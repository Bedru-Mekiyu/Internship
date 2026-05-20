import { test, expect } from './support/fixtures';

test.describe('quiz flow', () => {
  test.beforeEach(async ({ page, app }) => {
    await app.loginAs(page, 'student');
  });

  test('student can start a quiz', async ({ page }) => {
    await page.goto('/courses/course-react');
    await page.waitForLoadState('networkidle');

    const startQuizButton = page.getByRole('button', { name: /start quiz|begin quiz/i });
    await expect(startQuizButton).toBeVisible({ timeout: 10000 });
    await startQuizButton.click();

    await expect(page.getByRole('heading', { name: /quiz/i })).toBeVisible({ timeout: 10000 });
  });

  test('quiz displays questions', async ({ page }) => {
    await page.goto('/courses/course-react/quiz/quiz-123');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('radio').first()).toBeVisible({ timeout: 10000 });
  });

  test('can select answer and proceed', async ({ page }) => {
    await page.goto('/courses/course-react/quiz/quiz-123');
    await page.waitForLoadState('networkidle');

    const firstAnswer = page.getByRole('radio').first();
    await expect(firstAnswer).toBeVisible({ timeout: 10000 });
    await firstAnswer.check();

    const nextButton = page.getByRole('button', { name: /next|submit/i });
    await expect(nextButton).toBeVisible({ timeout: 5000 });
    await nextButton.click();
  });

  test('quiz submission shows results', async ({ page }) => {
    await page.goto('/quiz-results');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /results|score|quiz complete/i })).toBeVisible({ timeout: 10000 });
  });

  test('can view past quiz results', async ({ page }) => {
    await page.goto('/quiz-results');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /my results|quiz history/i })
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('quiz builder (instructor)', () => {
  test.beforeEach(async ({ page, app }) => {
    await app.loginAs(page, 'instructor');
  });

  test('instructor can access quiz builder', async ({ page }) => {
    await page.goto('/courses/course-react/quiz-builder');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /quiz builder|create quiz/i }).or(page.getByText('Quiz Builder'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('instructor can create new question', async ({ page }) => {
    await page.goto('/courses/course-react/quiz-builder');
    await page.waitForLoadState('networkidle');

    const addQuestionButton = page.getByRole('button', { name: /add question|new question/i });
    await expect(addQuestionButton).toBeVisible({ timeout: 10000 });
    await addQuestionButton.click();

    await expect(
      page.getByRole('textbox', { name: /question/i }).or(page.getByText('Question'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('instructor can set correct answer', async ({ page }) => {
    await page.goto('/courses/course-react/quiz-builder');
    await page.waitForLoadState('networkidle');

    const correctAnswerOption = page.getByRole('radio', { name: /correct answer|correct/i });
    await expect(correctAnswerOption.first()).toBeVisible({ timeout: 10000 });
    await correctAnswerOption.first().check();
  });

  test('instructor can save quiz', async ({ page }) => {
    await page.goto('/courses/course-react/quiz-builder');
    await page.waitForLoadState('networkidle');

    const saveButton = page.getByRole('button', { name: /save quiz|publish/i });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await saveButton.click();

    await expect(page.getByText(/quiz saved|quiz published/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('quiz accessibility', () => {
  test.beforeEach(async ({ page, app }) => {
    await app.loginAs(page, 'student');
  });

  test('quiz questions are accessible via keyboard', async ({ page }) => {
    await page.goto('/courses/course-react/quiz/quiz-123');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('radio').first()).toBeVisible({ timeout: 10000 });
    
    await page.keyboard.press('Tab');
    const firstOption = page.getByRole('radio').first();
    await expect(firstOption).toBeFocused();

    await page.keyboard.press('ArrowRight');
    const secondOption = page.getByRole('radio').nth(1);
    await expect(secondOption).toBeFocused();
  });

  test('quiz has proper heading structure', async ({ page }) => {
    await page.goto('/courses/course-react/quiz/quiz-123');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2 }).or(page.getByRole('heading', { level: 3 }))
    ).toBeVisible();
  });
});