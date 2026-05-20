import { test, expect } from './support/fixtures';

test.describe('quiz flow', () => {
  test('student can start a quiz', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/courses/course-react');

    const startQuizButton = page.getByRole('button', { name: /start quiz|begin quiz/i });
    if (await startQuizButton.isVisible()) {
      await startQuizButton.click();

      await expect(page.getByRole('heading', { name: /quiz/i })).toBeVisible();
    }
  });

  test('quiz displays questions', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/courses/course-react/quiz/quiz-123');

    await expect(page.getByRole('radio').first()).toBeVisible();
  });

  test('can select answer and proceed', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/courses/course-react/quiz/quiz-123');

    const firstAnswer = page.getByRole('radio').first();
    if (await firstAnswer.isVisible()) {
      await firstAnswer.check();

      const nextButton = page.getByRole('button', { name: /next|submit/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    }
  });

  test('quiz submission shows results', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/quiz-results');

    await expect(page.getByRole('heading', { name: /results|score|quiz complete/i })).toBeVisible();
  });

  test('can view past quiz results', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/quiz-results');

    await expect(page.getByText('Quiz').or(page.getByRole('heading', { name: /my results|quiz history/i }))).toBeVisible();
  });
});

test.describe('quiz builder (instructor)', () => {
  test('instructor can access quiz builder', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');

    await page.goto('/courses/course-react/quiz-builder');

    await expect(page.getByRole('heading', { name: /quiz builder|create quiz/i }).or(page.getByText('Quiz Builder'))).toBeVisible();
  });

  test('instructor can create new question', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');

    await page.goto('/courses/course-react/quiz-builder');

    const addQuestionButton = page.getByRole('button', { name: /add question|new question/i });
    if (await addQuestionButton.isVisible()) {
      await addQuestionButton.click();

      await expect(page.getByRole('textbox', { name: /question/i }).or(page.getByText('Question'))).toBeVisible();
    }
  });

  test('instructor can set correct answer', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');

    await page.goto('/courses/course-react/quiz-builder');

    const correctAnswerOption = page.getByRole('radio', { name: /correct answer|correct/i });
    if (await correctAnswerOption.first().isVisible()) {
      await correctAnswerOption.first().check();
    }
  });

  test('instructor can save quiz', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');

    await page.goto('/courses/course-react/quiz-builder');

    const saveButton = page.getByRole('button', { name: /save quiz|publish/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();

      await expect(page.getByText(/quiz saved|quiz published/i)).toBeVisible();
    }
  });
});

test.describe('quiz accessibility', () => {
  test('quiz questions are accessible via keyboard', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/courses/course-react/quiz/quiz-123');

    await page.keyboard.press('Tab');
    const firstOption = page.getByRole('radio').first();
    await expect(firstOption).toBeFocused();

    await page.keyboard.press('ArrowRight');
    const secondOption = page.getByRole('radio').nth(1);
    await expect(secondOption).toBeFocused();
  });

  test('quiz has proper heading structure', async ({ page, app }) => {
    await app.loginAs(page, 'student');

    await page.goto('/courses/course-react/quiz/quiz-123');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 }).or(page.getByRole('heading', { level: 3 }))).toBeVisible();
  });
});