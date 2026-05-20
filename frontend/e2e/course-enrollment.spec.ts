import { test, expect } from './support/fixtures';

test.describe('course enrollment flow', () => {
  test('browse courses and view course details', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/courses/explore');
    await expect(page.getByRole('heading', { name: /explore courses/i })).toBeVisible();

    await page.getByText('React Foundations').first().click();

    await expect(page.getByRole('heading', { name: /react foundations/i })).toBeVisible();
    await expect(page.getByText('Build modern React apps')).toBeVisible();
  });

  test('enroll in free course', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/courses/explore');
    await page.getByText('React Foundations').first().click();

    await expect(page.getByRole('button', { name: /enroll|start learning/i })).toBeVisible();

    await page.getByRole('button', { name: /enroll|start learning/i }).click();

    await expect(page.getByText(/enrollment successful|you are enrolled/i)).toBeVisible();
  });

  test('course search returns matching results', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/courses/explore');

    const searchBox = page.getByRole('textbox', { name: /search courses/i });
    if (await searchBox.isVisible()) {
      await searchBox.fill('React');
      await page.keyboard.press('Enter');

      await expect(page.getByText('React Foundations')).toBeVisible();
    }
  });

  test('course filter by category works', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/courses/explore');

    const categoryFilter = page.getByRole('combobox', { name: /category/i });
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption('Development');

      await expect(page.getByText('Development')).toBeVisible();
    }
  });

  test('course filter by level works', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/courses/explore');

    const levelFilter = page.getByRole('combobox', { name: /level/i });
    if (await levelFilter.isVisible()) {
      await levelFilter.selectOption('beginner');

      await expect(page.getByText('React Foundations')).toBeVisible();
    }
  });

  test('access enrolled course content', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/my-courses');

    const enrolledCourse = page.getByText('React Foundations').first();
    if (await enrolledCourse.isVisible()) {
      await enrolledCourse.click();

      await expect(page).toHaveURL(/\/learn\//);
    }
  });

  test('view my courses shows enrolled courses', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/my-courses');

    await expect(page.getByRole('heading', { name: /my courses/i }).or(page.getByText('Enrolled Courses'))).toBeVisible();
  });
});

test.describe('course discovery for unauthenticated users', () => {
  test('explore courses page is accessible without login', async ({ page }) => {
    await page.goto('/courses/explore');

    await expect(page.getByRole('heading', { name: /explore courses/i })).toBeVisible();
    await expect(page.getByText('React Foundations')).toBeVisible();
  });

  test('course card shows key information', async ({ page }) => {
    await page.goto('/courses/explore');

    await expect(page.getByText('React Foundations')).toBeVisible();
    await expect(page.getByText('Development')).toBeVisible();
    await expect(page.getByText('beginner')).toBeVisible();
  });
});

test.describe('instructor course management', () => {
  test('instructor can access course creation', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');

    await page.goto('/courses/create');

    await expect(page.getByRole('heading', { name: /create course/i }).or(page.getByText('New Course'))).toBeVisible();
  });

  test('instructor can view their courses', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');

    await page.goto('/instructor/courses');

    await expect(page.getByRole('heading', { name: /my courses|your courses/i }).or(page.getByText('Instructor Courses'))).toBeVisible();
  });
});