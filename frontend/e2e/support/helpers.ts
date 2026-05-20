import type { Page, Locator } from '@playwright/test';

export class Wait {
  static async forElement(
    page: Page,
    selector: string,
    timeout = 10000
  ): Promise<Locator> {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    return element;
  }

  static async forResponse(
    page: Page,
    urlPattern: string | RegExp,
    timeout = 10000
  ): Promise<void> {
    await page.waitForResponse(urlPattern, { timeout });
  }

  static async forNavigation(
    page: Page,
    urlPattern?: string | RegExp,
    timeout = 30000
  ): Promise<void> {
    if (urlPattern) {
      await page.waitForURL(urlPattern, { timeout });
    } else {
      await page.waitForLoadState('networkidle', { timeout });
    }
  }

  static async forApiIdle(page: Page, timeout = 5000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async forFunction(
    page: Page,
    fn: () => boolean | Promise<boolean>,
    timeout = 10000
  ): Promise<void> {
    const start = Date.now();
    while (!(await fn())) {
      if (Date.now() - start > timeout) {
        throw new Error(`Function did not return true within ${timeout}ms`);
      }
      await page.waitForTimeout(100);
    }
  }

  static async forElementHidden(
    page: Page,
    selector: string,
    timeout = 10000
  ): Promise<void> {
    await page.locator(selector).waitFor({ state: 'hidden', timeout });
  }

  static async forLoadingToComplete(
    page: Page,
    loadingSelector = '[role="progressbar"], [class*="skeleton"], [class*="loading"]',
    timeout = 15000
  ): Promise<void> {
    const start = Date.now();
    const loadingElements = page.locator(loadingSelector);
    
    while (await loadingElements.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      if (Date.now() - start > timeout) {
        break;
      }
      await page.waitForTimeout(500);
    }
  }
}

export class Selector {
  static emailInput(page: Page): Locator {
    return page.getByRole('textbox', { name: /email/i });
  }

  static passwordInput(page: Page): Locator {
    return page.getByRole('textbox', { name: /password/i });
  }

  static submitButton(page: Page, name = /sign in|log in|submit/i): Locator {
    return page.getByRole('button', { name });
  }

  static searchBox(page: Page): Locator {
    return page.getByRole('textbox', { name: /search/i }).or(page.getByPlaceholder(/search/i));
  }

  static logoutButton(page: Page): Locator {
    return page.getByRole('button', { name: /logout|sign out/i });
  }

  static heading(page: Page, level = 1): Locator {
    return page.getByRole('heading', { level });
  }

  static retryButton(page: Page): Locator {
    return page.getByRole('button', { name: /retry|refresh|try again/i });
  }

  static enrollButton(page: Page): Locator {
    return page.getByRole('button', { name: /enroll|start learning|get started/i });
  }

  static notificationBadge(page: Page): Locator {
    return page.locator('[class*="badge"], [class*="count"]').first();
  }

  static courseCard(page: Page, title?: string): Locator {
    if (title) {
      return page.locator('[class*="course"], [class*="card"]').filter({ hasText: title });
    }
    return page.locator('[class*="course"], [class*="card"]');
  }

  static progressBar(page: Page): Locator {
    return page.locator('[role="progressbar"], [class*="progress"]');
  }

  static errorMessage(page: Page): Locator {
    return page.locator('[class*="error"], [role="alert"]');
  }

  static emptyState(page: Page): Locator {
    return page.getByText(/no courses|not found|empty|be the first/i);
  }

  static skeletonLoader(page: Page): Locator {
    return page.locator('[class*="skeleton"], [class*="loading"]');
  }

  static fileInput(page: Page): Locator {
    return page.locator('input[type="file"]');
  }
}

export class Assertion {
  static async isVisible(element: Locator, timeout = 5000): Promise<boolean> {
    try {
      await element.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  static async isHidden(element: Locator, timeout = 5000): Promise<boolean> {
    try {
      await element.waitFor({ state: 'hidden', timeout });
      return true;
    } catch {
      return false;
    }
  }

  static async isEnabled(element: Locator, timeout = 5000): Promise<boolean> {
    try {
      await element.waitFor({ state: 'attached', timeout });
      return !(await element.isDisabled());
    } catch {
      return false;
    }
  }

  static async containsText(element: Locator, text: string | RegExp): Promise<boolean> {
    const content = await element.textContent();
    if (typeof text === 'string') {
      return content?.includes(text) ?? false;
    }
    return text.test(content ?? '');
  }

  static async hasUrl(page: Page, pattern: string | RegExp): Promise<boolean> {
    const url = page.url();
    if (typeof pattern === 'string') {
      return url.includes(pattern);
    }
    return pattern.test(url);
  }
}

export class Form {
  static async fillLogin(page: Page, email: string, password: string): Promise<void> {
    await Selector.emailInput(page).fill(email);
    await Selector.passwordInput(page).fill(password);
  }

  static async submitLogin(page: Page): Promise<void> {
    await Selector.submitButton(page).click();
  }

  static async fillAndSubmitLogin(page: Page, email: string, password: string): Promise<void> {
    await this.fillLogin(page, email, password);
    await this.submitLogin(page);
  }

  static async selectDropdown(page: Page, label: string, value: string): Promise<void> {
    await page.getByRole('combobox', { name: new RegExp(label, 'i') }).selectOption(value);
  }

  static async fillTextField(page: Page, label: string, value: string): Promise<void> {
    await page.getByRole('textbox', { name: new RegExp(label, 'i') }).fill(value);
  }
}

export class Navigation {
  static async goToLogin(page: Page): Promise<void> {
    await page.goto('/auth/login');
  }

  static async goToDashboard(page: Page, role: 'student' | 'instructor' | 'admin' | 'content_manager'): Promise<void> {
    const routes: Record<string, string> = {
      student: '/dashboard',
      instructor: '/instructor/dashboard',
      admin: '/admin/dashboard',
      content_manager: '/cms/content',
    };
    await page.goto(routes[role] || '/dashboard');
  }

  static async goToCourses(page: Page): Promise<void> {
    await page.goto('/courses/explore');
  }

  static async goToCourseDetail(page: Page, courseSlug: string): Promise<void> {
    await page.goto(`/courses/${courseSlug}`);
  }

  static async goToMyCourses(page: Page): Promise<void> {
    await page.goto('/my-courses');
  }

  static async goToDiscussions(page: Page): Promise<void> {
    await page.goto('/discussions');
  }

  static async goToNotifications(page: Page): Promise<void> {
    await page.goto('/notifications');
  }

  static async goToProfile(page: Page): Promise<void> {
    await page.goto('/profile-settings');
  }
}

export class Auth {
  static async login(page: Page, email: string, password: string): Promise<void> {
    await Navigation.goToLogin(page);
    await Form.fillAndSubmitLogin(page, email, password);
    await Wait.forNavigation(page, /dashboard|instructor|admin|cms/, 15000);
  }

  static async loginAsStudent(page: Page): Promise<void> {
    await this.login(page, 'student@learnspace.dev', 'Passw0rd!');
  }

  static async loginAsInstructor(page: Page): Promise<void> {
    await this.login(page, 'instructor@learnspace.dev', 'Passw0rd!');
  }

  static async loginAsAdmin(page: Page): Promise<void> {
    await this.login(page, 'admin@learnspace.dev', 'Passw0rd!');
  }

  static async loginAsContentManager(page: Page): Promise<void> {
    await this.login(page, 'manager@learnspace.dev', 'Passw0rd!');
  }

  static async logout(page: Page): Promise<void> {
    await Selector.logoutButton(page).click();
    await Wait.forNavigation(page, /auth\/login/, 10000);
  }
}

export class ErrorState {
  static async expectNetworkError(page: Page): Promise<void> {
    await expect(page.getByText(/network|connection|unavailable/i)).toBeVisible({ timeout: 10000 });
  }

  static async expectTimeoutError(page: Page): Promise<void> {
    await expect(page.getByText(/timed out|too long|please retry/i)).toBeVisible({ timeout: 15000 });
  }

  static async expectServerError(page: Page): Promise<void> {
    await expect(page.getByText(/something went wrong|please try again|server error/i)).toBeVisible({ timeout: 10000 });
  }

  static async expectAuthError(page: Page): Promise<void> {
    await expect(page.getByText(/not authorized|access denied|forbidden/i)).toBeVisible({ timeout: 5000 });
  }

  static async expectNotFound(page: Page): Promise<void> {
    await expect(page.getByText(/not found|does not exist|404/i)).toBeVisible({ timeout: 5000 });
  }

  static async expectValidationError(page: Page): Promise<void> {
    await expect(page.getByText(/required|invalid|check your input/i)).toBeVisible({ timeout: 5000 });
  }
}

export class Network {
  static async mockApiFailure(
    page: Page,
    pathPattern: string,
    status = 500,
    body = { message: 'Server error' }
  ): Promise<void> {
    await page.route(pathPattern, async (route) => {
      if (route.request().method() !== 'OPTIONS') {
        await route.fulfill({ status, body: JSON.stringify(body) });
        return;
      }
      await route.continue();
    });
  }

  static async mockApiSuccess(
    page: Page,
    pathPattern: string,
    body: unknown,
    status = 200
  ): Promise<void> {
    await page.route(pathPattern, async (route) => {
      if (route.request().method() !== 'OPTIONS') {
        await route.fulfill({ status, body: JSON.stringify(body) });
        return;
      }
      await route.continue();
    });
  }

  static async mockSlowResponse(
    page: Page,
    pathPattern: string,
    delayMs: number
  ): Promise<void> {
    await page.route(pathPattern, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      await route.continue();
    });
  }
}

export async function expectNotVisible(
  element: Locator,
  timeout = 5000
): Promise<void> {
  await element.waitFor({ state: 'hidden', timeout });
}

export async function expectVisible(
  element: Locator,
  timeout = 5000
): Promise<void> {
  await element.waitFor({ state: 'visible', timeout });
}