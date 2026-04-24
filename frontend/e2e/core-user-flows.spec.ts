import { expect, test, type Page, type Route } from '@playwright/test';

type MockUser = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'content_manager';
};

type MockPageRecord = {
  _id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  type: 'page';
  blocks: unknown[];
  content: string;
};

type MockMedia = {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: string;
};

const json = async (route: Route, status: number, body: unknown, extraHeaders?: Record<string, string>) => {
  await route.fulfill({
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
};

const setupApiMocks = async (page: Page) => {
  const user: MockUser = {
    _id: 'user-content-manager',
    email: 'manager@learnspace.dev',
    firstName: 'Content',
    lastName: 'Manager',
    role: 'content_manager',
  };

  let isAuthenticated = false;
  let pageCounter = 1;
  let mediaCounter = 2;

  let pages: MockPageRecord[] = [
    {
      _id: 'page-1',
      title: 'Welcome',
      slug: 'welcome',
      status: 'draft',
      type: 'page',
      blocks: [],
      content: '[]',
    },
  ];

  let media: MockMedia[] = [
    {
      _id: 'media-1',
      filename: 'hero-banner.png',
      originalName: 'hero-banner.png',
      mimetype: 'image/png',
      size: 152000,
      url: '/uploads/hero-banner.png',
      createdAt: '2026-01-01T08:00:00.000Z',
    },
    {
      _id: 'media-2',
      filename: 'intro-video.mp4',
      originalName: 'intro-video.mp4',
      mimetype: 'video/mp4',
      size: 2280000,
      url: '/uploads/intro-video.mp4',
      createdAt: '2026-01-02T08:00:00.000Z',
    },
  ];

  await page.route('**/api/auth/csrf-token', async (route) => {
    await json(route, 200, { csrfToken: 'test-csrf-token' }, { 'Set-Cookie': 'csrfToken=test-csrf-token; Path=/' });
  });

  await page.route('**/api/auth/login', async (route) => {
    isAuthenticated = true;
    await json(route, 200, { message: 'Login successful', user, accessToken: 'mock-access-token' });
  });

  await page.route('**/api/auth/me', async (route) => {
    if (!isAuthenticated) {
      await json(route, 401, { message: 'No token provided' });
      return;
    }

    await json(route, 200, user);
  });

  await page.route('**/api/auth/logout', async (route) => {
    isAuthenticated = false;
    await json(route, 200, { message: 'Logged out' });
  });

  await page.route('**/api/auth/refresh-token', async (route) => {
    if (!isAuthenticated) {
      await json(route, 401, { message: 'Refresh token missing' });
      return;
    }

    await json(route, 200, { accessToken: 'mock-access-token' });
  });

  await page.route('**/api/content/manage', async (route) => {
    if (!isAuthenticated) {
      await json(route, 401, { message: 'No token provided' });
      return;
    }

    await json(route, 200, pages);
  });

  await page.route('**/api/content/media', async (route) => {
    if (!isAuthenticated) {
      await json(route, 401, { message: 'No token provided' });
      return;
    }

    await json(route, 200, media);
  });

  await page.route('**/api/content/upload', async (route) => {
    if (!isAuthenticated) {
      await json(route, 401, { message: 'No token provided' });
      return;
    }

    const raw = route.request().postDataBuffer()?.toString('utf8') ?? '';
    const filename = raw.match(/filename="([^"]+)"/)?.[1] ?? `upload-${Date.now().toString()}.bin`;
    mediaCounter += 1;
    media = [
      ...media,
      {
        _id: `media-${mediaCounter}`,
        filename,
        originalName: filename,
        mimetype: 'image/png',
        size: 200000,
        url: `/uploads/${filename}`,
        createdAt: '2026-01-03T08:00:00.000Z',
      },
    ];

    await json(route, 200, { message: 'Uploaded', filename, url: `/uploads/${filename}` });
  });

  await page.route('**/uploads/**', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });

  await page.route('**/api/content', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await json(route, 200, pages);
      return;
    }

    if (!isAuthenticated) {
      await json(route, 401, { message: 'No token provided' });
      return;
    }

    if (method === 'POST') {
      const payload = route.request().postDataJSON() as Partial<MockPageRecord>;
      pageCounter += 1;
      const created: MockPageRecord = {
        _id: `page-${pageCounter}`,
        title: payload.title ?? `Untitled ${pageCounter}`,
        slug: payload.slug ?? `untitled-${pageCounter}`,
        status: payload.status ?? 'draft',
        type: 'page',
        blocks: Array.isArray(payload.blocks) ? payload.blocks : [],
        content: typeof payload.content === 'string' ? payload.content : '[]',
      };
      pages = [...pages, created];
      await json(route, 201, created);
      return;
    }

    await json(route, 405, { message: 'Method not allowed' });
  });

  await page.route('**/api/content/**', async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const mediaPatchMatch = url.pathname.match(/^\/api\/content\/media\/([^/]+)$/);
    const contentMatch = url.pathname.match(/^\/api\/content\/([^/]+)$/);

    if (mediaPatchMatch) {
      if (!isAuthenticated) {
        await json(route, 401, { message: 'No token provided' });
        return;
      }

      const mediaId = decodeURIComponent(mediaPatchMatch[1]);
      if (method === 'PATCH') {
        const payloadText = route.request().postData() ?? '{}';
        let payload: { originalName?: string } = {};
        try {
          payload = JSON.parse(payloadText) as { originalName?: string };
        } catch {
          payload = {};
        }
        media = media.map((item) =>
          item._id === mediaId && payload.originalName
            ? { ...item, filename: payload.originalName, originalName: payload.originalName }
            : item,
        );
        const updated = media.find((item) => item._id === mediaId);
        await json(route, updated ? 200 : 404, updated ?? { message: 'Media not found' });
        return;
      }

      if (method === 'DELETE') {
        const exists = media.some((item) => item._id === mediaId);
        media = media.filter((item) => item._id !== mediaId);
        await json(route, exists ? 200 : 404, exists ? { message: 'Media deleted', id: mediaId } : { message: 'Media not found' });
        return;
      }
    }

    if (contentMatch && !url.pathname.includes('/media/')) {
      if (!isAuthenticated) {
        await json(route, 401, { message: 'No token provided' });
        return;
      }

      const pageId = decodeURIComponent(contentMatch[1]);
      if (method === 'PUT') {
        const payload = route.request().postDataJSON() as Partial<MockPageRecord>;
        pages = pages.map((item) => (item._id === pageId ? { ...item, ...payload } : item));
        const updated = pages.find((item) => item._id === pageId);
        await json(route, updated ? 200 : 404, updated ?? { message: 'Content not found' });
        return;
      }

      if (method === 'DELETE') {
        const exists = pages.some((item) => item._id === pageId);
        pages = pages.filter((item) => item._id !== pageId);
        await json(route, exists ? 200 : 404, exists ? { message: 'Content deleted' } : { message: 'Content not found' });
        return;
      }
    }

    await route.fallback();
  });
};

const loginAsContentManager = async (page: Page) => {
  await page.goto('/auth/login');
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  await page.getByRole('textbox', { name: 'Email' }).fill('manager@learnspace.dev');
  await page.locator('#password').fill('Passw0rd!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/cms\/content/);
  await expect(page.getByRole('heading', { name: /content manager/i }).first()).toBeVisible();
};

test.describe('core user flows audit', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test('authentication and navigation stay consistent across refresh', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.evaluate(() => window.localStorage.getItem('learnspace.accessToken'))).resolves.toBeNull();

    await loginAsContentManager(page);
    await expect(page.evaluate(() => window.localStorage.getItem('learnspace.accessToken'))).resolves.toBeNull();

    await page.getByRole('link', { name: 'Media Library' }).click();
    await expect(page).toHaveURL(/\/cms\/media/);
    await expect(page.getByRole('heading', { name: 'Media Library' }).first()).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/cms\/media/);
    await expect(page.getByRole('heading', { name: 'Media Library' }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.evaluate(() => window.localStorage.getItem('learnspace.accessToken'))).resolves.toBeNull();

    await page.goto('/cms/media');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('content create update delete reflects backend state and survives refresh', async ({ page }) => {
    await loginAsContentManager(page);
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();

    const pageCardMenu = page.locator('.MuiCard-root').filter({ has: page.getByRole('heading', { name: 'Welcome' }) }).first().locator('button').first();
    await pageCardMenu.click();
    await page.getByRole('menuitem', { name: 'Duplicate' }).click();
    await expect(page.getByText('Page duplicated.')).toBeVisible();
    await expect(page.getByText('Welcome (Copy)')).toBeVisible();

    const duplicatedPageCardMenu = page.locator('.MuiCard-root').filter({ has: page.getByText('Welcome (Copy)') }).first().locator('button').first();
    await duplicatedPageCardMenu.click();
    await page.getByRole('menuitem', { name: 'Publish' }).click();
    await expect(page.getByText('Page published.')).toBeVisible();
    await expect(page.locator('.MuiCard-root').filter({ has: page.getByText('Welcome (Copy)') }).first().getByText('PUBLISHED')).toBeVisible();

    await duplicatedPageCardMenu.click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).last().click();
    await expect(page.getByText('Page deleted.')).toBeVisible();
    await expect(page.getByText('Welcome (Copy)')).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
    await expect(page.getByText('Welcome (Copy)')).toHaveCount(0);
  });

  test.describe('Student User Flow', () => {
    test('can browse courses and enroll', async ({ page }) => {
      await setupApiMocks(page);

      // Mock course data
      await page.route('**/api/courses', async (route) => {
        await json(route, 200, [
          {
            _id: 'course-1',
            title: 'Introduction to React',
            description: 'Learn React basics',
            category: 'Development',
            thumbnail: '/course1.jpg',
            pricing: { amount: 0, type: 'free' }
          }
        ]);
      });

      await loginAsContentManager(page);
      await page.getByRole('link', { name: 'Courses' }).click();
      await expect(page.getByRole('heading', { name: 'My Courses' })).toBeVisible();
      await expect(page.getByText('Introduction to React')).toBeVisible();
    });

    test('can track learning progress', async ({ page }) => {
      await setupApiMocks(page);

      await page.route('**/api/courses/*/progress', async (route) => {
        await json(route, 200, { progress: 50, completedLessons: ['lesson-1'] });
      });

      await loginAsContentManager(page);
      await page.getByRole('link', { name: 'Courses' }).click();

      const courseCard = page.locator('.MuiCard-root').first();
      await expect(courseCard.getByText('50%')).toBeVisible();
    });

    test('can access certificates upon completion', async ({ page }) => {
      await setupApiMocks(page);

      await page.route('**/api/certificates', async (route) => {
        await json(route, 200, [
          {
            _id: 'cert-1',
            courseName: 'Introduction to React',
            issuedAt: '2026-01-01',
            certificateUrl: '/certificates/react.pdf'
          }
        ]);
      });

      await loginAsContentManager(page);
      await page.getByRole('link', { name: 'Certificates' }).click();
      await expect(page.getByRole('heading', { name: 'My Certificates' })).toBeVisible();
      await expect(page.getByText('Introduction to React')).toBeVisible();
    });
  });

  test.describe('Instructor User Flow', () => {
    test('can create and manage courses', async ({ page }) => {
      await setupApiMocks(page);

      await loginAsContentManager(page);
      await page.getByRole('link', { name: 'Courses' }).click();
      await page.getByRole('button', { name: 'Create Course' }).click();

      await page.getByRole('textbox', { name: 'Course Title' }).fill('New Course');
      await page.getByRole('textbox', { name: 'Description' }).fill('Course description');
      await page.getByRole('button', { name: 'Create Course' }).click();

      await expect(page.getByText('Course created successfully')).toBeVisible();
    });

    test('can view student analytics', async ({ page }) => {
      await setupApiMocks(page);

      await page.route('**/api/instructor/analytics', async (route) => {
        await json(route, 200, {
          enrollmentTrend: [{ date: '2026-01-01', count: 10 }],
          completionRates: [{ course: 'React', rate: 85 }]
        });
      });

      await loginAsContentManager(page);
      await page.getByRole('link', { name: 'Analytics' }).click();
      await expect(page.getByRole('heading', { name: 'Analytics Dashboard' })).toBeVisible();
    });

    test('can manage course discussions', async ({ page }) => {
      await setupApiMocks(page);

      await page.route('**/api/discussions', async (route) => {
        await json(route, 200, [
          {
            _id: 'disc-1',
            title: 'Question about React',
            author: 'Student',
            replies: 3,
            createdAt: '2026-01-01'
          }
        ]);
      });

      await loginAsContentManager(page);
      await page.getByRole('link', { name: 'Discussions' }).click();
      await expect(page.getByText('Question about React')).toBeVisible();
    });
  });

  test.describe('Content Manager Flow', () => {
    test('can manage CMS pages', async ({ page }) => {
      await loginAsContentManager(page);
      await expect(page.getByRole('heading', { name: /content manager/i })).toBeVisible();

      // Test page creation
      const createButton = page.getByRole('button', { name: 'Create Page' });
      await createButton.click();

      await page.getByRole('textbox', { name: 'Page Title' }).fill('New Landing Page');
      await page.getByRole('button', { name: 'Save' }).click();

      await expect(page.getByText('Page created successfully')).toBeVisible();
    });

    test('can manage media assets', async ({ page }) => {
      await loginAsContentManager(page);
      await page.getByRole('link', { name: 'Media Library' }).click();

      await expect(page.getByRole('heading', { name: 'Media Library' })).toBeVisible();
      await expect(page.getByAltText('hero-banner.png')).toBeVisible();

      // Test upload functionality
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        files: [{
          name: 'test-image.png',
          mimeType: 'image/png',
          buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
        }]
      });

      await expect(page.getByText('test-image.png')).toBeVisible();
    });

    test('can publish and unpublish content', async ({ page }) => {
      await loginAsContentManager(page);

      const pageCard = page.locator('.MuiCard-root').first();
      const menuButton = pageCard.locator('button').first();

      await menuButton.click();
      await page.getByRole('menuitem', { name: 'Publish' }).click();

      await expect(page.getByText('Page published')).toBeVisible();
      await expect(pageCard.getByText('PUBLISHED')).toBeVisible();
    });
  });

  test.describe('Admin User Flow', () => {
    test('can manage user accounts', async ({ page }) => {
      await setupApiMocks(page);

      await page.route('**/api/admin/users', async (route) => {
        await json(route, 200, [
          {
            _id: 'user-1',
            email: 'student@test.com',
            role: 'student',
            status: 'active'
          }
        ]);
      });

      await loginAsContentManager(page);
      await page.goto('/admin/users');
      await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
      await expect(page.getByText('student@test.com')).toBeVisible();
    });

    test('can view system settings', async ({ page }) => {
      await setupApiMocks(page);

      await page.route('**/api/admin/settings', async (route) => {
        await json(route, 200, {
          siteName: 'LearnSpace',
          maintenanceMode: false
        });
      });

      await loginAsContentManager(page);
      await page.getByRole('link', { name: 'Settings' }).click();
      await expect(page.getByRole('heading', { name: 'System Settings' })).toBeVisible();
    });

    test('can view system analytics', async ({ page }) => {
      await setupApiMocks(page);

      await page.route('**/api/admin/analytics', async (route) => {
        await json(route, 200, {
          totalUsers: 1000,
          activeCourses: 50,
          revenue: 50000
        });
      });

      await loginAsContentManager(page);
      await page.getByRole('link', { name: 'Dashboard' }).click();
      await expect(page.getByText('1,000')).toBeVisible();
    });
  });

  test.describe('Accessibility and Error Handling', () => {
    test('handles 404 pages gracefully', async ({ page }) => {
      await loginAsContentManager(page);
      await page.goto('/non-existent-page');
      await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    });

    test('maintains accessibility on error states', async ({ page }) => {
      await page.route('**/api/courses', async (route) => {
        await json(route, 500, { message: 'Server error' });
      });

      await loginAsContentManager(page);
      await page.getByRole('link', { name: 'Courses' }).click();

      // Error message should be accessible
      const errorAlert = page.locator('role=alert');
      await expect(errorAlert.getByText('Something went wrong')).toBeVisible();
    });

    test('preserves navigation state on errors', async ({ page }) => {
      await loginAsContentManager(page);

      // Navigate through multiple pages
      await page.getByRole('link', { name: 'Dashboard' }).click();
      await page.getByRole('link', { name: 'Courses' }).click();

      // Simulate error
      await page.route('**/api/courses/*/progress', async (route) => {
        await json(route, 500, { message: 'Error' });
      });

      // Should still be on courses page
      await expect(page).toHaveURL(/\/courses/);
      await expect(page.getByRole('heading', { name: 'My Courses' })).toBeVisible();
    });
  });

  test.describe('Performance Tests', () => {
    test('loads pages within acceptable time', async ({ page }) => {
      await loginAsContentManager(page);

      const startTime = Date.now();
      await page.goto('/courses');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
      await expect(page.getByRole('heading', { name: 'My Courses' })).toBeVisible();
    });

    test('handles concurrent requests efficiently', async ({ page }) => {
      await loginAsContentManager(page);

      // Start multiple concurrent navigations
      const promises = [
        page.goto('/courses'),
        page.goto('/dashboard'),
        page.goto('/profile-settings')
      ];

      await Promise.all(promises);
      await expect(page.getByRole('heading', { name: 'My Courses' })).toBeVisible();
    });
  });
});
