import { test, expect } from '@playwright/test';

test.describe('LMS journey smoke', () => {
  test('explore courses and pricing are reachable', async ({ page }) => {
    await page.goto('/courses/explore');
    await expect(page.getByRole('heading', { name: /explore courses/i })).toBeVisible();

    await page.goto('/pricing');
    await expect(page.getByRole('heading', { name: /transparent pricing/i })).toBeVisible();
  });

  test('contact page shows form affordance', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: /hear from you/i })).toBeVisible();
  });
});
