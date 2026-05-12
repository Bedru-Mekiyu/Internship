import { test, expect } from './support/fixtures';

test.describe('accessibility, responsiveness, and resilience', () => {
  test('login form supports keyboard-first navigation', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Forgot password?' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeFocused();
  });

  test('notification preferences update and persist visual feedback', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await page.goto('/settings/notifications');

    await expect(page.getByText('Manage how and when you receive notifications')).toBeVisible();
    await expect(page.getByText(/10 notifications enabled/i)).toBeVisible();

    await page.getByRole('switch').first().click();
    await expect(page.getByText(/9 notifications enabled/i)).toBeVisible();

    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('Your notification preferences have been saved successfully.')).toBeVisible();
  });

  test.describe('mobile shell behavior', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('mobile navigation drawer routes users to profile settings', async ({ page, app }) => {
      await app.loginAs(page, 'student');
      await expect(page).toHaveURL(/\/dashboard/);

      await page.getByRole('button', { name: 'open navigation' }).click();
      await page.getByRole('link', { name: 'Profile' }).click();

      await expect(page).toHaveURL(/\/profile-settings/);
      await expect(page.getByText('Profile & Settings')).toBeVisible();
      await expect(page.getByLabel('Search settings...')).toBeVisible();
    });
  });
});
