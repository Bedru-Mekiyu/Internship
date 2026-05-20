import { test, expect } from './support/fixtures';

test.describe('course enrollment flow', () => {
  test.beforeEach(async ({ page, app }) => {
    await app.loginAs(page, 'student');
  });

  test('browse courses and view course details', async ({ page }) => {
    await page.goto('/courses/explore');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /explore courses/i })).toBeVisible({ timeout: 10000 });

    const courseCard = page.getByText('React Foundations').first();
    await expect(courseCard).toBeVisible();
    await courseCard.click();

    await expect(page.getByRole('heading', { name: /react foundations/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Build modern React apps')).toBeVisible();
  });

  test('enroll in free course', async ({ page }) => {
    await page.goto('/courses/explore');
    await page.waitForLoadState('networkidle');

    const courseCard = page.getByText('React Foundations').first();
    await expect(courseCard).toBeVisible();
    await courseCard.click();

    const enrollButton = page.getByRole('button', { name: /enroll|start learning/i });
    await expect(enrollButton).toBeVisible({ timeout: 10000 });
    await enrollButton.click();

    await expect(page.getByText(/enrollment successful|you are enrolled/i)).toBeVisible({ timeout: 15000 });
  });

  test('course search returns matching results', async ({ page }) => {
    await page.goto('/courses/explore');
    await page.waitForLoadState('networkidle');

    const searchBox = page.getByRole('textbox', { name: /search courses/i }).or(page.getByPlaceholder(/search/i));
    await expect(searchBox).toBeVisible({ timeout: 10000 });
    await searchBox.fill('React');
    await page.keyboard.press('Enter');

    await page.waitForLoadState('networkidle');
    await expect(page.getByText('React Foundations')).toBeVisible({ timeout: 10000 });
  });

  test('course filter by category works', async ({ page }) => {
    await page.goto('/courses/explore');
    await page.waitForLoadState('networkidle');

    const categoryFilter = page.getByRole('combobox', { name: /category/i });
    await expect(categoryFilter).toBeVisible({ timeout: 10000 });
    await categoryFilter.selectOption('Development');

    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Development')).toBeVisible({ timeout: 10000 });
  });

  test('course filter by level works', async ({ page }) => {
    await page.goto('/courses/explore');
    await page.waitForLoadState('networkidle');

    const levelFilter = page.getByRole('combobox', { name: /level/i });
    await expect(levelFilter).toBeVisible({ timeout: 10000 });
    await levelFilter.selectOption('beginner');

    await page.waitForLoadState('networkidle');
    await expect(page.getByText('React Foundations')).toBeVisible({ timeout: 10000 });
  });

  test('access enrolled course content', async ({ page }) => {
    await page.goto('/my-courses');
    await page.waitForLoadState('networkidle');

    const enrolledCourse = page.getByText('React Foundations').first();
    await expect(enrolledCourse).toBeVisible({ timeout: 10000 });
    await enrolledCourse.click();

    await page.waitForURL(/\/learn\//, { timeout: 10000 });
  });

  test('view my courses shows enrolled courses', async ({ page }) => {
    await page.goto('/my-courses');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /my courses/i }).or(page.getByText('Enrolled Courses'))
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('course discovery for unauthenticated users', () => {
  test('explore courses page is accessible without login', async ({ page }) => {
    await page.goto('/courses/explore');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /explore courses/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('React Foundations')).toBeVisible();
  });

  test('course card shows key information', async ({ page }) => {
    await page.goto('/courses/explore');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('React Foundations')).toBeVisible();
    await expect(page.getByText('Development')).toBeVisible();
    await expect(page.getByText('beginner')).toBeVisible();
  });
});

test.describe('instructor course management', () => {
  test.beforeEach(async ({ page, app }) => {
    await app.loginAs(page, 'instructor');
  });

  test('instructor can access course creation', async ({ page }) => {
    await page.goto('/courses/create');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /create course/i }).or(page.getByText('New Course'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('instructor can view their courses', async ({ page }) => {
    await page.goto('/instructor/courses');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /my courses|your courses/i }).or(page.getByText('Instructor Courses'))
    ).toBeVisible({ timeout: 10000 });
  });
});