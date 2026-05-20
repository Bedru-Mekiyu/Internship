import { test, expect } from './support/fixtures';

test.describe('failure states', () => {
  test.beforeEach(async ({ page, app }) => {
    await app.loginAs(page, 'student');
  });

  test('displays 404 page for non-existent course', async ({ page }) => {
    await page.goto('/courses/non-existent-course');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /not found|404/i }).or(page.getByText(/course not found/i))
    ).toBeVisible({ timeout: 10000 });
  });

  test('handles network error gracefully', async ({ page }) => {
    await page.route('**/api/**', route => route.abort('failed'));

    await page.goto('/courses/explore');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByText(/error|failed to load|network error/i)
    ).toBeVisible({ timeout: 10000 });
  });
});