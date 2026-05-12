import { test, expect } from './support/fixtures';

test.describe('authentication and role authorization', () => {
  test('login succeeds with CSRF flow and routes content manager to CMS', async ({ page, app }) => {
    await app.loginAs(page, 'content_manager');

    await expect(page).toHaveURL(/\/cms\/content/);
    await expect(page.getByText('Manage CMS pages and maintain structured learning content across the platform.')).toBeVisible();
    expect(app.metrics.csrfTokenRequests).toBeGreaterThanOrEqual(1);
    expect(app.metrics.loginRequests).toBe(1);
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
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('instructor navigation excludes admin-only destinations', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');
    await expect(page).toHaveURL(/\/instructor\/dashboard/);

    await expect(page.getByRole('link', { name: 'User Management' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'System Settings' })).toHaveCount(0);
  });

  test('student navigation excludes CMS management routes', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await expect(page).toHaveURL(/\/dashboard/);

    await expect(page.getByRole('link', { name: 'Content Manager' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Media Library' })).toHaveCount(0);
  });
});
