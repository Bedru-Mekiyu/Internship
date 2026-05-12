import { test, expect } from './support/fixtures';

test.describe('authentication and role authorization', () => {
  test('login succeeds with CSRF flow and routes content manager to CMS', async ({ page, app }) => {
    await app.loginAs(page, 'content_manager');

    await expect(page).toHaveURL(/\/cms\/content/);
    await expect(page.getByRole('heading', { name: 'Content Manager' })).toBeVisible();
    expect(app.metrics.csrfTokenRequests).toBeGreaterThanOrEqual(1);
    expect(app.metrics.loginRequestsWithCsrfHeader).toBe(1);
  });

  test('invalid login shows actionable error and preserves login route', async ({ page, app }) => {
    await app.loginWithCredentials(page, 'wrong@learnspace.dev', 'bad-password');

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('expired session forces redirect back to login', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await expect(page).toHaveURL(/\/dashboard/);

    app.setSessionActive(false);
    app.setRefreshFailure(true);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText('Your session has expired. Please sign in again.')).toBeVisible();
  });

  test('instructor cannot access admin-only routes', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');
    await expect(page).toHaveURL(/\/instructor\/dashboard/);

    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/instructor\/dashboard/);
    await expect(page.getByText('You do not have permission to access this page')).toBeVisible();
  });

  test('student cannot access CMS routes', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/cms/content');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('You do not have permission to access this page')).toBeVisible();
  });
});
