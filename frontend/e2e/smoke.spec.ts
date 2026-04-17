import { test, expect } from '@playwright/test';

test.describe('public smoke', () => {
  test('marketing homepage shows LearnSpace', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('LearnSpace').first()).toBeVisible();
  });

  test('explore courses page shows heading', async ({ page }) => {
    await page.goto('/courses/explore');
    await expect(page.getByRole('heading', { name: /explore courses/i })).toBeVisible();
  });

  test('login page has email field', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
  });

  test('unauthenticated visit to dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('password reset page shows request form', async ({ page }) => {
    await page.goto('/auth/reset-password');
    await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible();
  });

  test('legacy /reset-password redirects to /auth/reset-password', async ({ page }) => {
    await page.goto('/reset-password?token=test');
    await expect(page).toHaveURL(/\/auth\/reset-password\?token=test/);
  });
});
