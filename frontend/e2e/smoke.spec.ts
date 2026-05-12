import { test, expect } from './support/fixtures';

test.describe('public smoke and routing', () => {
  test('marketing routes render key entry points', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('LearnSpace').first()).toBeVisible();

    await page.goto('/courses/explore');
    await expect(page.getByRole('heading', { name: /explore courses/i })).toBeVisible();

    await page.goto('/pricing');
    await expect(page.getByRole('heading', { name: /transparent pricing/i })).toBeVisible();
  });

  test('legacy help route redirects to canonical help page', async ({ page }) => {
    await page.goto('/help-center');
    await expect(page).toHaveURL(/\/help$/);
    await expect(page.getByRole('heading', { name: /help center/i })).toBeVisible();
  });

  test('protected routes redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });
});
