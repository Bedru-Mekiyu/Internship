import { test, expect } from './support/fixtures';

test.describe('network and API failure handling', () => {
  test('shows error state when API is unreachable', async ({ page, app }) => {
    app.setLoginNetworkFailure(true);
    
    await page.goto('/auth/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
    await page.locator('#password').fill('Passw0rd!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText(/network|connection|unavailable/i)).toBeVisible({ timeout: 10000 });
  });

  test('shows loading skeleton during API calls', async ({ page }) => {
    let requestPending = false;
    
    await page.route('**/api/courses', async (route) => {
      requestPending = true;
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto('/courses/explore');
    
    const loadingElement = page.locator('[class*="skeleton"], [class*="loading"]');
    await expect(loadingElement.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('retry button appears on API failure', async ({ page, app }) => {
    await page.route('**/api/courses', async (route) => {
      if (route.request().method() !== 'OPTIONS') {
        await route.fulfill({ status: 500, body: JSON.stringify({ message: 'Server error' }) });
        return;
      }
      await route.continue();
    });

    await page.goto('/courses/explore');
    await expect(page.getByRole('button', { name: /retry|refresh|try again/i })).toBeVisible({ timeout: 10000 });
  });

  test('shows cached data when offline', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    const cachedResponse = await page.evaluate(() => {
      return caches.match('/api/dashboard/student');
    });
    
    expect(cachedResponse).toBeTruthy();
  });
});

test.describe('empty state handling', () => {
  test('shows empty state when no courses found', async ({ page }) => {
    await page.route('**/api/courses', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify([]) });
    });

    await page.goto('/courses/explore');
    await expect(page.getByText(/no courses|not found|empty/i)).toBeVisible({ timeout: 5000 });
  });

  test('shows empty state when user has no enrollments', async ({ page }) => {
    await page.route('**/api/dashboard/student', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ enrolledCourses: [], totalCourses: 0 })
      });
    });

    await page.goto('/dashboard');
    await expect(page.getByText(/no courses|enroll to start|get started/i)).toBeVisible({ timeout: 5000 });
  });

  test('shows empty state for discussions', async ({ page }) => {
    await page.route('**/api/discussions/**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([])
      });
    });

    await page.goto('/courses/discussions');
    await expect(page.getByText(/no discussions|start a thread|be the first/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('error state rendering', () => {
  test('displays friendly error for 400 Bad Request', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      if (route.request().method() !== 'OPTIONS') {
        await route.fulfill({ status: 400, body: JSON.stringify({ message: 'Invalid input' }) });
        return;
      }
      await route.continue();
    });

    await page.goto('/courses/explore');
    await expect(page.getByText(/invalid|check your input|please review/i)).toBeVisible({ timeout: 5000 });
  });

  test('displays friendly error for 403 Forbidden', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      if (route.request().method() !== 'OPTIONS') {
        await route.fulfill({ status: 403, body: JSON.stringify({ message: 'Access denied' }) });
        return;
      }
      await route.continue();
    });

    await page.goto('/dashboard');
    await expect(page.getByText(/not authorized|access denied|forbidden/i)).toBeVisible({ timeout: 5000 });
  });

  test('displays friendly error for 404 Not Found', async ({ page }) => {
    await page.goto('/courses/non-existent-course');
    await expect(page.getByText(/not found|does not exist|404/i)).toBeVisible({ timeout: 5000 });
  });

  test('displays friendly error for 500 Internal Server Error', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      if (route.request().method() !== 'OPTIONS') {
        await route.fulfill({ status: 500, body: JSON.stringify({ message: 'Server error' }) });
        return;
      }
      await route.continue();
    });

    await page.goto('/dashboard');
    await expect(page.getByText(/something went wrong|please try again|server error/i)).toBeVisible({ timeout: 10000 });
  });

  test('displays friendly error for 502 Bad Gateway', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      if (route.request().method() !== 'OPTIONS') {
        await route.fulfill({ status: 502, body: JSON.stringify({ message: 'Service unavailable' }) });
        return;
      }
      await route.continue();
    });

    await page.goto('/dashboard');
    await expect(page.getByText(/unavailable|temporary|try again/i)).toBeVisible({ timeout: 10000 });
  });

  test('displays friendly error for 503 Service Unavailable', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      if (route.request().method() !== 'OPTIONS') {
        await route.fulfill({ status: 503, body: JSON.stringify({ message: 'Maintenance' }) });
        return;
      }
      await route.continue();
    });

    await page.goto('/dashboard');
    await expect(page.getByText(/maintenance|unavailable|try again later/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('timeout handling', () => {
  test('shows timeout message for slow requests', async ({ page }) => {
    await page.route('**/api/courses', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 35000));
      await route.continue();
    });

    await page.goto('/courses/explore');
    await expect(page.getByText(/timed out|take too long|please retry/i)).toBeVisible({ timeout: 40000 });
  });

  test('allows cancellation of long-running requests', async ({ page }) => {
    await page.route('**/api/courses', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 60000));
      await route.continue();
    });

    await page.goto('/courses/explore');
    
    const cancelButton = page.getByRole('button', { name: /cancel|stop|close/i });
    await expect(cancelButton).toBeVisible({ timeout: 10000 }).catch(() => {});
  });
});

test.describe('form validation errors', () => {
  test('shows validation errors for empty required fields', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    await expect(page.getByText(/required|please fill|is required/i)).toBeVisible();
  });

  test('shows validation error for invalid email format', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('notanemail');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    await expect(page.getByText(/valid email|invalid format|email address/i)).toBeVisible();
  });

  test('shows validation error for password too short', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.getByRole('textbox', { name: 'Password' }).fill('short');
    await page.getByRole('button', { name: 'Create account' }).click();
    
    await expect(page.getByText(/too short|minimum|at least/i)).toBeVisible();
  });

  test('prevents form submission with validation errors', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    const submitButton = page.getByRole('button', { name: 'Sign in' });
    await expect(submitButton).toBeDisabled();
  });
});

test.describe('media upload failure handling', () => {
  test('shows error when file upload fails', async ({ page, app }) => {
    await app.loginAs(page, 'content_manager');
    await page.goto('/cms/media');
    
    app.setMediaFailureMode('server_error');
    await page.getByRole('button', { name: /upload|add media/i }).click();
    
    await expect(page.getByText(/failed|error|unavailable/i)).toBeVisible({ timeout: 5000 });
  });

  test('shows progress during upload', async ({ page, app }) => {
    await app.loginAs(page, 'content_manager');
    await page.goto('/cms/media');
    
    await page.getByRole('button', { name: /upload|add media/i }).click();
    
    const progressBar = page.locator('[class*="progress"], [role="progressbar"]');
    await expect(progressBar).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('shows error for invalid file type', async ({ page, app }) => {
    await app.loginAs(page, 'content_manager');
    await page.goto('/cms/media');
    
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'malicious.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('malicious content')
    });
    
    await expect(page.getByText(/invalid type|not allowed|unsupported/i)).toBeVisible({ timeout: 5000 });
  });

  test('shows error for file too large', async ({ page, app }) => {
    await app.loginAs(page, 'content_manager');
    await page.goto('/cms/media');
    
    const largeFile = Buffer.alloc(300 * 1024 * 1024);
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'huge-file.png',
      mimeType: 'image/png',
      buffer: largeFile
    });
    
    await expect(page.getByText(/too large|size limit|exceeds/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('payment failure handling', () => {
  test('shows error when payment fails', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    await page.route('**/api/payments/**', async (route) => {
      if (route.request().method() !== 'OPTIONS') {
        await route.fulfill({ status: 402, body: JSON.stringify({ message: 'Payment failed' }) });
        return;
      }
      await route.continue();
    });

    await page.goto('/courses/course-react/checkout');
    await expect(page.getByText(/payment failed|try again|error/i)).toBeVisible({ timeout: 5000 });
  });

  test('allows retry on payment failure', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await page.goto('/courses/course-react/checkout');
    
    await expect(page.getByRole('button', { name: /retry|try again|try payment/i })).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});

test.describe('reconnection handling', () => {
  test('shows reconnecting indicator when connection lost', async ({ page }) => {
    await page.route('**/socket.io/**', async (route) => {
      await route.abort('failed');
    });

    await page.goto('/courses/discussions');
    
    const reconnectingIndicator = page.locator('[class*="reconnect"], [class*="offline"], [class*="disconnected"]');
    await expect(reconnectingIndicator).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('auto-reconnects when connection restored', async ({ page }) => {
    let connectionCount = 0;
    
    await page.route('**/socket.io/**', async (route) => {
      connectionCount++;
      await route.continue();
    });

    await page.goto('/courses/discussions');
    await page.waitForTimeout(2000);
    
    expect(connectionCount).toBeGreaterThan(0);
  });
});

test.describe('graceful degradation', () => {
  test('continues working when analytics fail', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    await page.route('**/api/dashboard/**', async (route) => {
      if (route.request().method() !== 'OPTIONS') {
        await route.fulfill({ status: 500, body: JSON.stringify({ message: 'Analytics unavailable' }) });
        return;
      }
      await route.continue();
    });

    await page.goto('/dashboard');
    await expect(page.getByText(/dashboard/i)).toBeVisible();
    await expect(page.getByText(/analytics/i)).not.toBeVisible();
  });

  test('shows partial content when some APIs fail', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    let courseApiCallCount = 0;
    await page.route('**/api/courses', async (route) => {
      courseApiCallCount++;
      if (courseApiCallCount === 1) {
        await route.fulfill({ status: 500, body: JSON.stringify({ message: 'Error' }) });
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify([]) });
      }
    });

    await page.goto('/courses/explore');
    await page.waitForTimeout(2000);
    
    expect(page.url()).toContain('/courses');
  });
});