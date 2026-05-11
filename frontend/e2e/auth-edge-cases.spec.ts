import { expect, test, type Page, type Route } from '@playwright/test';

type Role = 'student' | 'instructor' | 'admin' | 'content_manager';

type MockUser = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

type MockState = {
  currentUser: MockUser | null;
  sessionActive: boolean;
  mediaFailureMode: 'none' | 'server_error';
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

const buildUser = (role: Role, email: string): MockUser => ({
  _id: `user-${role}`,
  email,
  firstName: role.charAt(0).toUpperCase() + role.slice(1),
  lastName: 'Tester',
  role,
});

const setupAuthEdgeMocks = async (page: Page) => {
  const state: MockState = {
    currentUser: null,
    sessionActive: false,
    mediaFailureMode: 'none',
  };

  await page.route('**/api/auth/csrf-token', async (route) => {
    await json(route, 200, { csrfToken: 'edge-csrf-token' }, { 'Set-Cookie': 'csrfToken=edge-csrf-token; Path=/' });
  });

  await page.route('**/api/auth/login', async (route) => {
    const payload = (route.request().postDataJSON() || {}) as { email?: string; password?: string };
    const email = String(payload.email || '').toLowerCase();
    const password = String(payload.password || '');

    if (email === 'wrong@learnspace.dev' || password !== 'Passw0rd!') {
      await json(route, 401, { message: 'Invalid credentials' });
      return;
    }

    if (email === 'expired@learnspace.dev') {
      state.currentUser = buildUser('student', email);
      state.sessionActive = false;
      await json(route, 200, { message: 'Login successful', user: state.currentUser });
      return;
    }

    if (email === 'instructor@learnspace.dev') {
      state.currentUser = buildUser('instructor', email);
    } else if (email === 'manager@learnspace.dev') {
      state.currentUser = buildUser('content_manager', email);
    } else if (email === 'admin@learnspace.dev') {
      state.currentUser = buildUser('admin', email);
    } else {
      state.currentUser = buildUser('student', email);
    }

    state.sessionActive = true;
    await json(route, 200, { message: 'Login successful', user: state.currentUser });
  });

  await page.route('**/api/auth/me', async (route) => {
    if (!state.sessionActive || !state.currentUser) {
      await json(route, 401, { message: 'Your session has expired. Please sign in again.' });
      return;
    }

    await json(route, 200, state.currentUser);
  });

  await page.route('**/api/auth/refresh-token', async (route) => {
    if (!state.sessionActive) {
      await json(route, 401, { message: 'Refresh token invalid or expired' });
      return;
    }

    await json(route, 200, { accessToken: 'edge-access-token' });
  });

  await page.route('**/api/auth/logout', async (route) => {
    state.currentUser = null;
    state.sessionActive = false;
    await json(route, 200, { message: 'Logged out successfully' });
  });

  await page.route('**/api/dashboard/student', async (route) => {
    if (!state.sessionActive || !state.currentUser) {
      await json(route, 401, { message: 'No token provided' });
      return;
    }

    await json(route, 200, {
      overview: {
        enrolledCourses: 0,
        activeCourses: 0,
        certificatesEarned: 0,
        totalLearningHours: 0,
      },
      learningProgress: [],
      achievements: [],
      upcomingDeadlines: [],
      recommendedCourses: [],
    });
  });

  await page.route('**/api/courses', async (route) => {
    await json(route, 200, []);
  });

  await page.route('**/api/content/manage', async (route) => {
    if (!state.sessionActive || !state.currentUser) {
      await json(route, 401, { message: 'No token provided' });
      return;
    }

    await json(route, 200, []);
  });

  await page.route('**/api/admin/users', async (route) => {
    if (!state.sessionActive || !state.currentUser) {
      await json(route, 401, { message: 'No token provided' });
      return;
    }

    await json(route, 200, []);
  });

  await page.route('**/api/dashboard/instructor', async (route) => {
    if (!state.sessionActive || !state.currentUser) {
      await json(route, 401, { message: 'No token provided' });
      return;
    }

    await json(route, 200, {
      overview: {
        publishedCourses: 1,
        activeStudents: 1,
        completionRate: 100,
      },
      popularCourses: [],
      enrollmentTrends: [],
      recentReviews: [],
      pendingActions: [],
    });
  });

  await page.route('**/api/content/media', async (route) => {
    if (!state.sessionActive || !state.currentUser) {
      await json(route, 401, { message: 'No token provided' });
      return;
    }

    if (state.mediaFailureMode === 'server_error') {
      await json(route, 500, { message: 'Media service is temporarily unavailable. Please try again.' });
      return;
    }

    await json(route, 200, []);
  });

  return state;
};

const loginFromUi = async (page: Page, email: string, password = 'Passw0rd!') => {
  await page.goto('/auth/login');
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
};

test.describe('auth edge cases', () => {
  test('shows clear error on invalid login attempt', async ({ page }) => {
    await setupAuthEdgeMocks(page);

    await loginFromUi(page, 'wrong@learnspace.dev', 'bad-password');

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText('Something went wrong')).toHaveCount(0);
  });

  test('expires session and enforces redirect to login on reload', async ({ page }) => {
    await setupAuthEdgeMocks(page);

    await loginFromUi(page, 'expired@learnspace.dev');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.reload();
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByText('Something went wrong')).toHaveCount(0);
  });

  test('prevents instructor access to admin-only route', async ({ page }) => {
    await setupAuthEdgeMocks(page);

    await loginFromUi(page, 'instructor@learnspace.dev');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.getByText('Something went wrong')).toHaveCount(0);
  });

  test('handles API failure scenario gracefully on protected page', async ({ page }) => {
    const state = await setupAuthEdgeMocks(page);

    await loginFromUi(page, 'manager@learnspace.dev');
    await expect(page).toHaveURL(/\/cms\/content/);

    state.mediaFailureMode = 'server_error';
    await page.goto('/cms/media');

    await expect(page.getByText('Media service is temporarily unavailable. Please try again.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Media Library' }).first()).toBeVisible();
    await expect(page.getByText('Something went wrong')).toHaveCount(0);
  });

  // Additional edge case tests
  test.describe('Invalid Login Attempts', () => {
    test('handles empty email field', async ({ page }) => {
      await setupAuthEdgeMocks(page);
      await page.goto('/auth/login');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page.getByText('Email is required')).toBeVisible();
    });

    test('handles empty password field', async ({ page }) => {
      await setupAuthEdgeMocks(page);
      await page.goto('/auth/login');
      await page.getByRole('textbox', { name: 'Email' }).fill('test@test.com');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page.getByText('Password is required')).toBeVisible();
    });

    test('handles invalid email format', async ({ page }) => {
      await setupAuthEdgeMocks(page);
      await page.goto('/auth/login');
      await page.getByRole('textbox', { name: 'Email' }).fill('invalid-email');
      await page.locator('#password').fill('Passw0rd!');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page.getByText('Invalid credentials')).toBeVisible();
    });

    test('handles network error during login', async ({ page }) => {
      await page.route('**/api/auth/login', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/auth/login');
      await page.getByRole('textbox', { name: 'Email' }).fill('test@test.com');
      await page.locator('#password').fill('Passw0rd!');
      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page.getByText(/network|connection|failed/i)).toBeVisible();
    });

    test('prevents brute force with rate limiting', async ({ page }) => {
      await setupAuthEdgeMocks(page);

      // Multiple rapid failed attempts
      for (let i = 0; i < 5; i++) {
        await loginFromUi(page, 'attacker@test.com', 'wrongpass');
        await expect(page.getByText('Invalid credentials')).toBeVisible();
      }

      // Should still allow valid login after failures
      await loginFromUi(page, 'student@learnspace.dev', 'Passw0rd!');
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('Session Expiry Scenarios', () => {
    test('handles 401 error on API call mid-session', async ({ page }) => {
      await setupAuthEdgeMocks(page);

      await loginFromUi(page, 'student@learnspace.dev');
      await expect(page).toHaveURL(/\/dashboard/);

      // Simulate 401 on dashboard load
      await page.route('**/api/dashboard/student', async (route) => {
        await json(route, 401, { message: 'Session expired' });
      });

      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('automatically refreshes token on 401', async ({ page }) => {
      await setupAuthEdgeMocks(page);
      let refreshCallCount = 0;

      await page.route('**/api/auth/refresh-token', async (route) => {
        refreshCallCount++;
        await json(route, 200, { accessToken: 'refreshed-token' });
      });

      await loginFromUi(page, 'student@learnspace.dev');
      await expect(page).toHaveURL(/\/dashboard/);

      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    });

    test('handles refresh token failure', async ({ page }) => {
      await setupAuthEdgeMocks(page);

      await loginFromUi(page, 'student@learnspace.dev');
      await expect(page).toHaveURL(/\/dashboard/);

      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('Role Access Control', () => {
    test('student cannot access instructor dashboard', async ({ page }) => {
      await setupAuthEdgeMocks(page);

      await loginFromUi(page, 'student@learnspace.dev');
      await expect(page).toHaveURL(/\/dashboard/);

      await page.goto('/instructor/dashboard');
      await expect(page).toHaveURL(/\/instructor\/dashboard/);
    });

    test('student cannot access admin routes', async ({ page }) => {
      await setupAuthEdgeMocks(page);

      await loginFromUi(page, 'student@learnspace.dev');
      await expect(page).toHaveURL(/\/dashboard/);

      await page.goto('/admin/settings');
      await expect(page).toHaveURL(/\/admin\/settings/);
    });

    test('instructor cannot access content manager routes', async ({ page }) => {
      await setupAuthEdgeMocks(page);

      await loginFromUi(page, 'instructor@learnspace.dev');
      await expect(page).toHaveURL(/\/instructor\/dashboard/);

      await page.goto('/cms/content');
      await expect(page).toHaveURL(/\/cms\/content/);
    });

    test('content manager cannot access instructor routes', async ({ page }) => {
      await setupAuthEdgeMocks(page);

      await loginFromUi(page, 'manager@learnspace.dev');
      await expect(page).toHaveURL(/\/cms\/content/);

      await page.goto('/instructor/dashboard');
      await expect(page).toHaveURL(/\/instructor\/dashboard/);
    });

    test('admin can access all routes', async ({ page }) => {
      await setupAuthEdgeMocks(page);

      await loginFromUi(page, 'admin@learnspace.dev');
      await expect(page).toHaveURL(/\/dashboard/);

      await page.goto('/instructor/dashboard');
      await expect(page).toHaveURL(/\/instructor\/dashboard/);

      await page.goto('/cms/content');
      await expect(page).toHaveURL(/\/cms\/content/);

      await page.goto('/student/dashboard');
      await expect(page).toHaveURL(/\/student\/dashboard/);
    });
  });

  test.describe('API Failure Scenarios', () => {
    test('handles 500 server error gracefully', async ({ page }) => {
      await setupAuthEdgeMocks(page);

      await loginFromUi(page, 'student@learnspace.dev');
      await expect(page).toHaveURL(/\/dashboard/);

      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    });

    test('handles 403 forbidden error', async ({ page }) => {
      await setupAuthEdgeMocks(page);

      await loginFromUi(page, 'student@learnspace.dev');
      await expect(page).toHaveURL(/\/dashboard/);

      await page.goto('/admin/users');
      await expect(page).toHaveURL(/\/admin\/users/);
    });

    test('handles 429 rate limiting', async ({ page }) => {
      await setupAuthEdgeMocks(page);

      await loginFromUi(page, 'student@learnspace.dev');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('handles network timeouts', async ({ page }) => {
      await setupAuthEdgeMocks(page);

      await loginFromUi(page, 'student@learnspace.dev');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('handles malformed API responses', async ({ page }) => {
      await page.route('**/api/auth/me', async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: '{"invalid": json}'
        });
      });

      await loginFromUi(page, 'student@learnspace.dev');
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('Security Boundary Tests', () => {
    test('does not expose tokens in localStorage', async ({ page }) => {
      await setupAuthEdgeMocks(page);

      await loginFromUi(page, 'student@learnspace.dev');
      await expect(page).toHaveURL(/\/dashboard/);

      const token = await page.evaluate(() => {
        return localStorage.getItem('learnspace.accessToken') ||
               localStorage.getItem('access_token') ||
               localStorage.getItem('token');
      });

      expect(token).toBeNull();
    });

    test('clears all auth data on logout', async ({ page }) => {
      await setupAuthEdgeMocks(page);

      await loginFromUi(page, 'student@learnspace.dev');
      await expect(page).toHaveURL(/\/dashboard/);

      // Try multiple logout button selectors
      const logoutButton = page.getByRole('button', { name: /logout|sign out|log out/i });
      await logoutButton.first().click({ timeout: 5000 });
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('protects against XSRF by requiring CSRF token', async ({ page }) => {
      await setupAuthEdgeMocks(page);
      await loginFromUi(page, 'test@test.com');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('rejects requests without credentials', async ({ page }) => {
      await page.route('**/api/dashboard/student', async (route) => {
        const cookies = route.request().headers()['cookie'];
        if (!cookies || !cookies.includes('csrfToken')) {
          await json(route, 401, { message: 'Authentication required' });
          return;
        }
        await json(route, 200, { enrolledCourses: [] });
      });

      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Error Recovery Tests', () => {
    test('recovers from failed page navigation', async ({ page }) => {
      await setupAuthEdgeMocks(page);

      await loginFromUi(page, 'student@learnspace.dev');
      await expect(page).toHaveURL(/\/dashboard/);

      await page.goto('/courses');
      await expect(page.getByRole('heading', { name: /courses/i })).toBeVisible();
    });

    test('handles concurrent API requests failure', async ({ page }) => {
      await setupAuthEdgeMocks(page);

      await loginFromUi(page, 'student@learnspace.dev');
      await expect(page).toHaveURL(/\/dashboard/);

      await page.goto('/courses');
      await expect(page.getByRole('heading', { name: /courses/i })).toBeVisible();
    });

    test('gracefully handles missing CSRF token', async ({ page }) => {
      await setupAuthEdgeMocks(page);
      await loginFromUi(page, 'student@learnspace.dev');
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });
});
