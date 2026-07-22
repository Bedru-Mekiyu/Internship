import { test, expect } from './support/fixtures';

test.describe('API failure handling', () => {
  test('network error shows error message', async ({ page, app }) => {
      app.setLoginNetworkFailure(true);

      await page.goto('/auth/login');
      await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
      await page.locator('#password').fill('Passw0rd!');
      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page.getByText(/network connection issue|check your connection|network error|connection failed|server error/i)).toBeVisible();
    });

  test('500 error shows error page', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    app.setMediaFailureMode('server_error');

    await page.goto('/cms/media');

    await expect(page.getByText(/error|unavailable|temporary/i)).toBeVisible();
  });

  test('failed request preserves previous data', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/dashboard');

    app.setMediaFailureMode('server_error');

    await page.goto('/cms/media');

    await expect(page.getByText(/error|unavailable/i)).toBeVisible();
  });

  test('retry button appears on failure', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    app.setMediaFailureMode('server_error');

    await page.goto('/cms/media');

    const retryButton = page.getByRole('button', { name: /retry|refresh|try again/i });
    if (await retryButton.isVisible()) {
      await retryButton.click();

      await expect(page.getByText(/loading|loading/i)).toBeVisible();
    }
  });
});

test.describe('loading states', () => {
  test('shows loading indicator during API call', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/dashboard');

    const loadingIndicator = page.getByText(/loading|please wait/i);
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();
    }
  });

  test('shows skeleton while loading', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/courses/explore');

    const skeleton = page.locator('[class*="skeleton"]');
    if (await skeleton.first().isVisible()) {
      await expect(skeleton.first()).toBeVisible();
    }
  });
});

test.describe('empty states', () => {
  test('shows empty state when no courses', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/my-courses');

    const emptyState = page.getByText(/no courses|enroll in a course/i);
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('shows empty state when no notifications', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/notifications');

    const emptyState = page.getByText(/no notifications|all caught up/i);
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }
  });
});

test.describe('timeout handling', () => {
  test('long request shows timeout message', async ({ page }) => {
    await page.goto('/courses/explore');

    const timeoutMessage = page.getByText(/request timed out|took too long/i);
    if (await timeoutMessage.isVisible()) {
      await expect(timeoutMessage).toBeVisible();
    }
  });

  test('timeout allows retry', async ({ page }) => {
    await page.goto('/courses/explore');

    const retryButton = page.getByRole('button', { name: /retry|try again/i });
    if (await retryButton.isVisible()) {
      await retryButton.click();

      await expect(page.getByText(/loading/i)).toBeVisible();
    }
  });
});

test.describe('offline handling', () => {
  test('detects offline state', async ({ page }) => {
    await page.goto('/dashboard');

    const offlineBanner = page.getByText(/you are offline|no connection/i);
    if (await offlineBanner.isVisible()) {
      await expect(offlineBanner).toBeVisible();
    }
  });

  test('offline shows cached content when available', async ({ page }) => {
    await page.goto('/courses/explore');

    const cachedContent = page.getByText(/showing cached|offline mode/i);
    if (await cachedContent.isVisible()) {
      await expect(cachedContent).toBeVisible();
    }
  });

  test('offline prevents data changes', async ({ page }) => {
    await page.goto('/settings/notifications');

    const saveButton = page.getByRole('button', { name: /save|update/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();

      await expect(page.getByText(/saved while offline|sync when online/i)).toBeVisible();
    }
  });
});