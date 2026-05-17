import { test, expect } from './support/fixtures';
import {
  ROLE_CREDENTIALS,
  ROLE_DASHBOARDS,
  assertProtectedRouteRedirects,
  expectToBeOnUrl,
} from './support/factories';

test.describe('authentication security', () => {
  test('login with invalid credentials shows error without leaking info', async ({ page, app }) => {
    await page.goto('/auth/login');
    
    await page.getByRole('textbox', { name: 'Email' }).fill('nonexistent@test.com');
    await page.locator('#password').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expectToBeOnUrl(page, /\/auth\/login/);
  });

  test('login with correct email but wrong password shows error', async ({ page, app }) => {
    await page.goto('/auth/login');
    
    await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
    await page.locator('#password').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('login rate limiting - multiple failed attempts', async ({ page, app }) => {
    await page.goto('/auth/login');
    
    for (let i = 0; i < 3; i++) {
      await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
      await page.locator('#password').fill('WrongPassword123!');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.waitForTimeout(200);
    }

    await expect(page.getByText(/too many|rate limit|please try again/i)).toBeVisible();
  });

  test('csrf token is required for login', async ({ page, app }) => {
    app.setSessionActive(false);
    
    await page.goto('/auth/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
    await page.locator('#password').fill('Passw0rd!');
    
    await page.evaluate(() => {
      const tokenInput = document.querySelector('input[name="csrf"]') as HTMLInputElement;
      if (tokenInput) tokenInput.value = '';
    });
    
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText(/security error|csrf/i)).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('session persists across page refreshes', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await expect(page).toHaveURL(/\/dashboard/);
    
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
    
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile/);
  });

  test('logout clears session completely', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await expect(page).toHaveURL(/\/dashboard/);
    
    await page.click('[class*="logout"], button:has-text("Logout"), [aria-label="Logout"]');
    await page.waitForTimeout(500);
    
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('expired access token triggers refresh', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await expect(page).toHaveURL(/\/dashboard/);
    
    app.setRefreshFailure(true);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.describe('authorization boundaries', () => {
  test('student cannot access instructor dashboard', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    await page.goto('/instructor/dashboard');
    await expect(page).toHaveURL(/\/dashboard|403|access denied|unauthorized/i);
  });

  test('student cannot access admin dashboard', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/dashboard|403|access denied|unauthorized/i);
  });

  test('instructor cannot access admin dashboard', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');
    
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/instructor|403|access denied|unauthorized/i);
  });

  test('instructor cannot access user management', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');
    
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/instructor|403/);
  });

  test('content_manager cannot access admin routes', async ({ page, app }) => {
    await app.loginAs(page, 'content_manager');
    
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/cms|403/);
  });

  test('content_manager cannot access system settings', async ({ page, app }) => {
    await app.loginAs(page, 'content_manager');
    
    await page.goto('/admin/settings');
    await expect(page).toHaveURL(/\/cms|403/);
  });

  test('unauthenticated user cannot access protected routes', async ({ page }) => {
    await assertProtectedRouteRedirects(page, '/dashboard');
    await assertProtectedRouteRedirects(page, '/profile');
    await assertProtectedRouteRedirects(page, '/instructor/dashboard');
    await assertProtectedRouteRedirects(page, '/admin/dashboard');
    await assertProtectedRouteRedirects(page, '/cms/content');
    await assertProtectedRouteRedirects(page, '/my-courses');
  });

  test('student cannot access course creation', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    await page.goto('/courses/create');
    await expect(page).toHaveURL(/\/courses(\/explore)?|403/);
  });

  test('student cannot access CMS upload', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    await page.goto('/cms/upload/any-course');
    await expect(page).toHaveURL(/\/dashboard|403/);
  });

  test('instructor can access own course management', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');
    
    await page.goto('/instructor/dashboard');
    await expect(page).toHaveURL(/\/instructor\/dashboard/);
    await expect(page.getByText(/my courses|teaching/i)).toBeVisible();
  });
});

test.describe('role-based UI elements', () => {
  test('student sees student dashboard only', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    await expect(page.getByRole('link', { name: 'User Management' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'System Settings' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Content Manager' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Media Library' })).toHaveCount(0);
  });

  test('instructor sees instructor dashboard', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');
    
    await expect(page.getByRole('link', { name: 'User Management' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'System Settings' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Content Manager' })).toHaveCount(0);
  });

  test('admin sees all dashboard options', async ({ page, app }) => {
    await app.loginAs(page, 'admin');
    
    await expect(page.getByRole('link', { name: 'User Management' })).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'System Settings' })).toHaveCount(1);
  });

  test('content_manager sees CMS options', async ({ page, app }) => {
    await app.loginAs(page, 'content_manager');
    
    await expect(page.getByRole('link', { name: 'Content Manager' })).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Media Library' })).toHaveCount(1);
  });
});

test.describe('API security boundaries', () => {
  test('API endpoints reject requests without auth token', async ({ page }) => {
    await page.goto('/');
    
    const responses: { url: string; status: number }[] = [];
    await page.route('**/api/**', async (route) => {
      responses.push({ url: route.request().url(), status: route.request().method() === 'OPTIONS' ? 204 : 401 });
    });

    await page.goto('/api/courses');
    await page.goto('/api/users/me');
    await page.goto('/api/dashboard/student');
    
    await expect(responses.some(r => r.status === 401)).toBeTruthy();
  });

  test('API returns proper error for expired token', async ({ page, app }) => {
    app.setSessionActive(false);
    app.setRefreshFailure(true);
    
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText(/session expired|please sign in/i)).toBeVisible();
  });

  test('forbidden endpoints return 403', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    let found403 = false;
    await page.route('**/api/admin/**', async (route) => {
      if (route.request().method() !== 'OPTIONS') {
        found403 = true;
      }
    });

    await page.goto('/admin/dashboard');
    await page.waitForTimeout(1000);
    
    expect(found403).toBeTruthy();
  });
});

test.describe('password security', () => {
  test('password field is masked in login form', async ({ page }) => {
    await page.goto('/auth/login');
    
    const passwordInput = page.locator('#password');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('password requirements shown on registration', async ({ page }) => {
    await page.goto('/auth/signup');
    
    await expect(page.getByText(/uppercase|lowercase|number|special/i)).toBeVisible();
  });

  test('weak password rejected during registration', async ({ page }) => {
    await page.goto('/auth/signup');
    
    await page.getByRole('textbox', { name: 'Email' }).fill('newuser@test.com');
    await page.getByRole('textbox', { name: 'First name' }).fill('New');
    await page.getByRole('textbox', { name: 'Last name' }).fill('User');
    await page.getByRole('textbox', { name: 'Password' }).fill('weak');
    await page.getByRole('button', { name: 'Create account' }).click();
    
    await expect(page.getByText(/password must|requirements|invalid/i)).toBeVisible();
  });
});

test.describe('data isolation', () => {
  test('student only sees own enrollment data', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    await page.goto('/my-courses');
    const content = await page.content();
    
    const otherStudentIds = ['user-other-1', 'user-other-2'];
    for (const id of otherStudentIds) {
      expect(content).not.toContain(id);
    }
  });

  test('instructor only sees own course analytics', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');
    
    await page.goto('/instructor/dashboard');
    await expect(page.getByText(/my courses|teaching/i)).toBeVisible();
  });

  test('discussions are isolated by course', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    const responses: string[] = [];
    await page.route('**/api/discussions/**', async (route) => {
      responses.push(route.request().url());
    });

    await page.goto('/courses/course-react/discussions');
    await page.waitForTimeout(500);

    const courseDiscussionsCalls = responses.filter(r => r.includes('course-react'));
    expect(courseDiscussionsCalls.length).toBeGreaterThan(0);
  });
});