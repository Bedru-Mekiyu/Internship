import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export type TestUserRole = 'student' | 'instructor' | 'admin' | 'content_manager';

export interface TestUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: TestUserRole;
  avatar?: string;
}

export interface TestCourse {
  _id: string;
  title: string;
  description: string;
  slug: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  instructor: TestUser;
  pricing: { type: 'free' | 'paid'; amount: number };
  rating: { average: number; count: number };
  enrollmentCount: number;
}

export interface TestEnrollment {
  _id: string;
  userId: string;
  courseId: string;
  progress: number;
  status: 'enrolled' | 'completed';
  enrolledAt: string;
}

export interface TestDiscussion {
  _id: string;
  courseId: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  replies: TestReply[];
}

export interface TestReply {
  _id: string;
  userId: string;
  content: string;
  createdAt: string;
}

const generateId = (prefix: string): string => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const createTestUser = (overrides?: Partial<TestUser>): TestUser => ({
  _id: generateId('user'),
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'student',
  ...overrides,
});

export const createTestCourse = (overrides?: Partial<TestCourse>): TestCourse => ({
  _id: generateId('course'),
  title: 'Test Course',
  description: 'Test course description',
  slug: 'test-course',
  category: 'Development',
  level: 'beginner',
  instructor: createTestUser({ role: 'instructor' }),
  pricing: { type: 'free', amount: 0 },
  rating: { average: 4.5, count: 10 },
  enrollmentCount: 0,
  ...overrides,
});

export const createTestEnrollment = (overrides?: Partial<TestEnrollment>): TestEnrollment => ({
  _id: generateId('enrollment'),
  userId: generateId('user'),
  courseId: generateId('course'),
  progress: 0,
  status: 'enrolled',
  enrolledAt: new Date().toISOString(),
  ...overrides,
});

export const createTestDiscussion = (overrides?: Partial<TestDiscussion>): TestDiscussion => ({
  _id: generateId('discussion'),
  courseId: generateId('course'),
  userId: generateId('user'),
  title: 'Test Discussion',
  content: 'Test discussion content',
  createdAt: new Date().toISOString(),
  replies: [],
  ...overrides,
});

export const ROLE_CREDENTIALS: Record<TestUserRole, { email: string; password: string }> = {
  student: { email: 'student@learnspace.dev', password: 'Passw0rd!' },
  instructor: { email: 'instructor@learnspace.dev', password: 'Passw0rd!' },
  admin: { email: 'admin@learnspace.dev', password: 'Passw0rd!' },
  content_manager: { email: 'manager@learnspace.dev', password: 'Passw0rd!' },
};

export const ROLE_DASHBOARDS: Record<TestUserRole, string> = {
  student: '/dashboard',
  instructor: '/instructor/dashboard',
  admin: '/admin/dashboard',
  content_manager: '/cms/content',
};

export const navigateToRoleDashboard = async (page: Page, role: TestUserRole): Promise<void> => {
  await page.goto(ROLE_DASHBOARDS[role]);
};

export const loginAsRole = async (page: Page, role: TestUserRole): Promise<void> => {
  const creds = ROLE_CREDENTIALS[role];
  await page.goto('/auth/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(creds.email);
  await page.locator('#password').fill(creds.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(ROLE_DASHBOARDS[role]);
};

export const assertProtectedRouteRedirects = async (page: Page, route: string): Promise<void> => {
  await page.goto(route);
  await page.waitForURL(/\/auth\/login/);
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
};

export const waitForApiResponse = async (
  page: Page,
  urlPattern: string | RegExp,
  options?: { timeout?: number }
): Promise<void> => {
  await page.waitForResponse(urlPattern, { timeout: options?.timeout ?? 10000 });
};

export const assertElementVisible = async (
  page: Page,
  selector: string,
  options?: { timeout?: number; visible?: boolean }
): Promise<void> => {
  const element = page.locator(selector);
  if (options?.visible === false) {
    await expect(element).not.toBeVisible({ timeout: options?.timeout ?? 5000 });
  } else {
    await expect(element).toBeVisible({ timeout: options?.timeout ?? 5000 });
  }
};

export const fillFormField = async (
  page: Page,
  fieldLabel: string,
  value: string
): Promise<void> => {
  await page.getByRole('textbox', { name: fieldLabel }).fill(value);
};

export const submitForm = async (page: Page, buttonName: string): Promise<void> => {
  await page.getByRole('button', { name: buttonName }).click();
};

export const expectToBeOnUrl = async (page: Page, pattern: string | RegExp): Promise<void> => {
  await expect(page).toHaveURL(pattern);
};