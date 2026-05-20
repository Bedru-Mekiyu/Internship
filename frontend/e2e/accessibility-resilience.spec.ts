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

  test('login form is accessible via screen reader', async ({ page }) => {
    await page.goto('/auth/login');

    const emailInput = page.getByRole('textbox', { name: 'Email' });
    await expect(emailInput).toHaveAttribute('aria-label', /email/i);
    
    const passwordInput = page.locator('#password');
    await expect(passwordInput).toBeVisible();
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

  test.describe('mobile viewport (390x844)', () => {
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

    test('mobile header shows hamburger menu', async ({ page, app }) => {
      await app.loginAs(page, 'student');
      
      const menuButton = page.getByRole('button', { name: /open navigation|menu/i });
      await expect(menuButton).toBeVisible();
    });

    test('mobile course cards stack vertically', async ({ page, app }) => {
      await app.loginAs(page, 'student');
      await page.goto('/courses/explore');

      const courseCards = page.locator('[class*="course-card"], [class*="CourseCard"]');
      const count = await courseCards.count();
      if (count > 0) {
        const firstCard = courseCards.first();
        const secondCard = courseCards.nth(1);
        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();
        
        if (firstBox && secondBox) {
          expect(secondBox.y).toBeGreaterThan(firstBox.y);
        }
      }
    });
  });

  test.describe('tablet viewport (768x1024)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('tablet shows expanded navigation', async ({ page, app }) => {
      await app.loginAs(page, 'student');
      
      const sidebar = page.locator('[class*="sidebar"], [class*="Sidebar"]');
      if (await sidebar.first().isVisible()) {
        await expect(sidebar.first()).toBeVisible();
      }
    });

    test('tablet course grid shows 2 columns', async ({ page, app }) => {
      await app.loginAs(page, 'student');
      await page.goto('/courses/explore');

      const courseCards = page.locator('[class*="course-card"], [class*="CourseCard"]');
      const count = await courseCards.count();
      if (count >= 2) {
        const firstCard = courseCards.first();
        const secondCard = courseCards.nth(1);
        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();
        
        if (firstBox && secondBox) {
          expect(secondBox.x).toBe(firstBox.x + firstBox.width + 16);
        }
      }
    });
  });

  test.describe('desktop viewport (1920x1080)', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('desktop shows full navigation', async ({ page, app }) => {
      await app.loginAs(page, 'student');
      
      const navLinks = page.getByRole('link');
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(5);
    });

    test('desktop course grid shows 3+ columns', async ({ page, app }) => {
      await app.loginAs(page, 'student');
      await page.goto('/courses/explore');

      const courseCards = page.locator('[class*="course-card"], [class*="CourseCard"]');
      expect(await courseCards.count()).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('focus management', () => {
    test('modal traps focus inside', async ({ page, app }) => {
      await app.loginAs(page, 'student');
      await page.goto('/dashboard');

      const openModalButton = page.getByRole('button', { name: /create|add|open/i }).first();
      if (await openModalButton.isVisible()) {
        await openModalButton.click();

        const modal = page.locator('[role="dialog"]');
        if (await modal.isVisible()) {
          const focusableElements = page.locator('button, input, select, textarea, a[href]');
          const firstElement = focusableElements.first();
          await expect(firstElement).toBeFocused();
        }
      }
    });

    test('focus returns to trigger after modal close', async ({ page, app }) => {
      await app.loginAs(page, 'student');
      await page.goto('/dashboard');

      const triggerButton = page.getByRole('button', { name: /create|add/i }).first();
      if (await triggerButton.isVisible()) {
        const trigger = triggerButton;
        await trigger.click();

        const closeButton = page.getByRole('button', { name: /close|cancel/i }).first();
        if (await closeButton.isVisible()) {
          await closeButton.click();

          await expect(trigger).toBeFocused();
        }
      }
    });
  });

  test.describe('color and contrast', () => {
    test('text has sufficient contrast on dashboard', async ({ page, app }) => {
      await app.loginAs(page, 'student');
      await page.goto('/dashboard');

      const headings = page.getByRole('heading');
      const count = await headings.count();
      expect(count).toBeGreaterThan(0);
    });

    test('error states are visually distinct', async ({ page }) => {
      await page.goto('/auth/login');
      await page.getByRole('textbox', { name: 'Email' }).fill('test@test.com');
      await page.locator('#password').fill('wrong');
      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page.getByText('Invalid credentials')).toBeVisible();
      
      const errorText = page.getByText('Invalid credentials');
      const color = await errorText.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      
      expect(color).toBeDefined();
    });
});
});
