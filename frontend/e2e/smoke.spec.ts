import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads and shows correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/LearnSpace/);
    // Hero section should be visible
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('navigation to login works', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('button[type="submit"], button:has-text("Sign In")')).toBeVisible({ timeout: 15000 });
  });

  test('static pages load without errors', async ({ page }) => {
    const pages = ['/about', '/pricing', '/contact', '/help'];
    for (const path of pages) {
      await page.goto(path);
      // Should not crash — page should have content
      await expect(page.locator('body')).not.toHaveText(/404|Not Found/i);
    }
  });

  test('course catalog loads', async ({ page }) => {
    await page.goto('/courses/explore');
    await page.waitForLoadState('networkidle');
    // Should render something (course cards or empty state)
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
