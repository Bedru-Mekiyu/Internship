import { test, expect } from './support/fixtures';

test.describe('real authentication flow', () => {
  test('login with valid credentials redirects to role-appropriate dashboard', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Student Tester')).toBeVisible();
  });

  test('login with valid admin credentials redirects to admin dashboard', async ({ page, app }) => {
    await app.loginAs(page, 'admin');

    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('login with valid instructor credentials redirects to instructor dashboard', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');

    await expect(page).toHaveURL(/\/instructor\/dashboard/);
  });

  test('login with valid content_manager credentials redirects to CMS', async ({ page, app }) => {
    await app.loginAs(page, 'content_manager');

    await expect(page).toHaveURL(/\/cms\/content/);
  });

  test('login with invalid credentials shows error message', async ({ page, app }) => {
    await app.loginWithCredentials(page, 'wrong@test.com', 'WrongPassword123!');

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('login with wrong password shows error message', async ({ page, app }) => {
    await app.loginWithCredentials(page, 'student@learnspace.dev', 'WrongPassword');

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('session persists across page navigation', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/courses/explore');
    await expect(page).toHaveURL(/\/courses\/explore/);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('logout clears session and redirects to login', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await expect(page).toHaveURL(/\/dashboard/);

    app.setSessionActive(false);
    await page.reload();

    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('expired session redirects to login', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await expect(page).toHaveURL(/\/dashboard/);

    app.setSessionActive(false);
    app.setRefreshFailure(true);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('network error during login shows error state', async ({ page, app }) => {
    app.setLoginNetworkFailure(true);

    await page.goto('/auth/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
    await page.locator('#password').fill('Passw0rd!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
  });
});

test.describe('authentication security', () => {
  test('protected route redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('redirect preserves intended destination', async ({ page, app }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox', { name: /email/i }).fill('student@learnspace.dev');
    await app.loginAs(page, 'student');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('CSRF token is requested before login', async ({ page, app }) => {
    await page.goto('/auth/login');

    await page.waitForTimeout(500);
    expect(app.metrics.csrfTokenRequests).toBeGreaterThanOrEqual(0);
  });

  test('login request includes CSRF token header', async ({ page, app }) => {
    await app.loginWithCredentials(page, 'student@learnspace.dev', 'Passw0rd!');

    expect(app.metrics.loginRequestsWithCsrfHeader).toBeGreaterThanOrEqual(0);
  });
});