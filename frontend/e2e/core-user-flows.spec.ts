import { test, expect } from './support/fixtures';

test.describe('core product flows', () => {
  test('student can navigate dashboard to my courses and open course details', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await expect(page.getByRole('heading', { name: /continue learning/i })).toBeVisible();

    await page.getByRole('link', { name: 'My Courses' }).click();
    await expect(page).toHaveURL(/\/courses$/);
    await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible();

    await page.getByPlaceholder('Search by course or instructor').fill('no-match-query');
    await expect(page.getByText('No courses found')).toBeVisible();

    await page.getByPlaceholder('Search by course or instructor').fill('');
    await page.getByRole('button', { name: 'View Details' }).first().click();
    await expect(page).toHaveURL(/\/courses\/[^/]+\/details$/);
  });

  test('instructor can validate and create a course draft workflow', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');
    await page.getByRole('link', { name: 'Create New Course' }).click();

    await expect(page).toHaveURL(/\/courses\/new/);
    await expect(page.getByRole('heading', { name: 'Create Course' })).toBeVisible();

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Please add a course title before saving.')).toBeVisible();

    await page.getByRole('textbox', { name: 'Course Title' }).fill('Playwright Reliability Engineering');
    await page.getByRole('button', { name: 'Publish' }).click();

    await expect(page).toHaveURL(/\/courses$/);
    expect(app.state.createdCourseIds).toHaveLength(1);
  });

  test('content manager can filter and open page editor', async ({ page, app }) => {
    await app.loginAs(page, 'content_manager');
    await expect(page).toHaveURL(/\/cms\/content/);

    await page.getByRole('tab', { name: 'Published' }).click();
    await expect(page.getByText('WELCOME PAGE')).toBeVisible();

    await page.getByPlaceholder('Search by title or slug...').fill('missing-page');
    await expect(page.getByText('No pages match your filters yet.')).toBeVisible();

    await page.getByPlaceholder('Search by title or slug...').fill('welcome');
    await page.getByRole('button', { name: 'Edit' }).first().click();

    await expect(page.getByRole('heading', { name: 'Edit Page' })).toBeVisible();
    await page.getByRole('button', { name: 'Back to pages' }).click();
    await expect(page.getByRole('heading', { name: 'Content Manager' })).toBeVisible();
  });

  test('authenticated enrollment flow issues API enrollment request', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await page.goto('/courses/explore');

    await expect(page.getByRole('heading', { name: /explore courses/i })).toBeVisible();
    await page.getByPlaceholder('Search for courses...').fill('react');
    await page.getByRole('button', { name: 'Enroll' }).first().click();

    expect(app.state.enrollRequests.length).toBe(1);
    expect(app.state.enrollRequests[0]).toBe('course-react');
    await expect(page.getByText('Demo courses are placeholders')).toHaveCount(0);
  });

  test('media library supports search, upload, and failure feedback', async ({ page, app }) => {
    await app.loginAs(page, 'content_manager');
    await page.goto('/cms/media');

    await expect(page.getByRole('heading', { name: 'Media Library' })).toBeVisible();

    await page.getByPlaceholder('Search files...').fill('missing-file');
    await expect(page.getByText('No files found')).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles({
      name: 'upload.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-bytes'),
    });
    await expect(page.getByText('upload.png uploaded successfully.')).toBeVisible();

    app.setMediaFailureMode('server_error');
    await page.reload();
    await expect(page.getByText('Media service is temporarily unavailable. Please try again.')).toBeVisible();
  });
});
