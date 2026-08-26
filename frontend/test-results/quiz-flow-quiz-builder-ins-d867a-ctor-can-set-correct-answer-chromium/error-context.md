# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quiz-flow.spec.ts >> quiz builder (instructor) >> instructor can set correct answer
- Location: e2e/quiz-flow.spec.ts:83:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('radio', { name: /correct answer|correct/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('radio', { name: /correct answer|correct/i }).first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to main content" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e5]:
    - generic [ref=e6]:
      - link "LearnSpace" [ref=e7] [cursor=pointer]:
        - /url: /
        - img [ref=e9]
        - heading "LearnSpace" [level=6] [ref=e11]
      - generic [ref=e12]:
        - link "Features" [ref=e13] [cursor=pointer]:
          - /url: /#features
        - link "Courses" [ref=e14] [cursor=pointer]:
          - /url: /courses/explore
        - link "Pricing" [ref=e15] [cursor=pointer]:
          - /url: /pricing
        - link "About" [ref=e16] [cursor=pointer]:
          - /url: /about
      - generic [ref=e17]:
        - link "Log in" [ref=e18] [cursor=pointer]:
          - /url: /auth/login
        - link "Get Started" [ref=e19] [cursor=pointer]:
          - /url: /auth/signup
  - main [ref=e20]:
    - generic [ref=e25]:
      - paragraph [ref=e27]: "404"
      - generic [ref=e28]:
        - heading "Page not found" [level=4] [ref=e29]
        - paragraph [ref=e30]: The page "/courses/course-react/quiz-builder" doesn't exist or has been moved.
      - generic [ref=e31]:
        - link "Go to Dashboard" [ref=e32] [cursor=pointer]:
          - /url: /instructor/dashboard
          - img [ref=e34]
          - text: Go to Dashboard
        - link "Get Help" [ref=e36] [cursor=pointer]:
          - /url: /help
          - img [ref=e38]
          - text: Get Help
      - paragraph [ref=e41]:
        - text: Need assistance?
        - link "Contact support" [ref=e42] [cursor=pointer]:
          - /url: /contact
  - contentinfo [ref=e43]:
    - generic [ref=e45]:
      - generic [ref=e46]:
        - paragraph [ref=e48]: LearnSpace
        - paragraph [ref=e49]: Empowering educators to share knowledge and build sustainable businesses online.
      - generic [ref=e50]:
        - paragraph [ref=e51]: Product
        - generic [ref=e52]:
          - link "Features" [ref=e53] [cursor=pointer]:
            - /url: /#features
          - link "Courses" [ref=e54] [cursor=pointer]:
            - /url: /courses/explore
          - link "Pricing" [ref=e55] [cursor=pointer]:
            - /url: /pricing
          - link "Testimonials" [ref=e56] [cursor=pointer]:
            - /url: /#testimonials
      - generic [ref=e57]:
        - paragraph [ref=e58]: Company
        - generic [ref=e59]:
          - link "About" [ref=e60] [cursor=pointer]:
            - /url: /about
          - link "Careers" [ref=e61] [cursor=pointer]:
            - /url: /careers
          - link "Blog" [ref=e62] [cursor=pointer]:
            - /url: /blog
          - link "Contact" [ref=e63] [cursor=pointer]:
            - /url: /contact
      - generic [ref=e64]:
        - paragraph [ref=e65]: Resources
        - generic [ref=e66]:
          - link "Help Center" [ref=e67] [cursor=pointer]:
            - /url: /help
          - link "Docs" [ref=e68] [cursor=pointer]:
            - /url: /docs
          - link "Community" [ref=e69] [cursor=pointer]:
            - /url: /community
          - link "Status" [ref=e70] [cursor=pointer]:
            - /url: /status
    - generic [ref=e73]:
      - paragraph [ref=e74]: © 2026 LearnSpace. All rights reserved.
      - generic [ref=e75]:
        - link "Privacy" [ref=e76] [cursor=pointer]:
          - /url: /privacy
        - link "Terms" [ref=e77] [cursor=pointer]:
          - /url: /terms
        - link "Cookies" [ref=e78] [cursor=pointer]:
          - /url: /cookies
```

# Test source

```ts
  1   | import { test, expect } from './support/fixtures';
  2   |
  3   | test.describe('quiz flow', () => {
  4   |   test.beforeEach(async ({ page, app }) => {
  5   |     await app.loginAs(page, 'student');
  6   |   });
  7   |
  8   |   test('student can start a quiz', async ({ page }) => {
  9   |     await page.goto('/courses/course-react');
  10  |     await page.waitForLoadState('networkidle');
  11  |
  12  |     const startQuizButton = page.getByRole('button', { name: /start quiz|begin quiz/i });
  13  |     await expect(startQuizButton).toBeVisible({ timeout: 10000 });
  14  |     await startQuizButton.click();
  15  |
  16  |     await expect(page.getByRole('heading', { name: /quiz/i })).toBeVisible({ timeout: 10000 });
  17  |   });
  18  |
  19  |   test('quiz displays questions', async ({ page }) => {
  20  |     await page.goto('/courses/course-react/quiz/quiz-123');
  21  |     await page.waitForLoadState('networkidle');
  22  |
  23  |     await expect(page.getByRole('radio').first()).toBeVisible({ timeout: 10000 });
  24  |   });
  25  |
  26  |   test('can select answer and proceed', async ({ page }) => {
  27  |     await page.goto('/courses/course-react/quiz/quiz-123');
  28  |     await page.waitForLoadState('networkidle');
  29  |
  30  |     const firstAnswer = page.getByRole('radio').first();
  31  |     await expect(firstAnswer).toBeVisible({ timeout: 10000 });
  32  |     await firstAnswer.check();
  33  |
  34  |     const nextButton = page.getByRole('button', { name: /next|submit/i });
  35  |     await expect(nextButton).toBeVisible({ timeout: 5000 });
  36  |     await nextButton.click();
  37  |   });
  38  |
  39  |   test('quiz submission shows results', async ({ page }) => {
  40  |     await page.goto('/quiz-results');
  41  |     await page.waitForLoadState('networkidle');
  42  |
  43  |     await expect(page.getByRole('heading', { name: /results|score|quiz complete/i })).toBeVisible({ timeout: 10000 });
  44  |   });
  45  |
  46  |   test('can view past quiz results', async ({ page }) => {
  47  |     await page.goto('/quiz-results');
  48  |     await page.waitForLoadState('networkidle');
  49  |
  50  |     await expect(
  51  |       page.getByRole('heading', { name: /my results|quiz history/i })
  52  |     ).toBeVisible({ timeout: 10000 });
  53  |   });
  54  | });
  55  |
  56  | test.describe('quiz builder (instructor)', () => {
  57  |   test.beforeEach(async ({ page, app }) => {
  58  |     await app.loginAs(page, 'instructor');
  59  |   });
  60  |
  61  |   test('instructor can access quiz builder', async ({ page }) => {
  62  |     await page.goto('/courses/course-react/quiz-builder');
  63  |     await page.waitForLoadState('networkidle');
  64  |
  65  |     await expect(
  66  |       page.getByRole('heading', { name: /quiz builder|create quiz/i }).or(page.getByText('Quiz Builder'))
  67  |     ).toBeVisible({ timeout: 10000 });
  68  |   });
  69  |
  70  |   test('instructor can create new question', async ({ page }) => {
  71  |     await page.goto('/courses/course-react/quiz-builder');
  72  |     await page.waitForLoadState('networkidle');
  73  |
  74  |     const addQuestionButton = page.getByRole('button', { name: /add question|new question/i });
  75  |     await expect(addQuestionButton).toBeVisible({ timeout: 10000 });
  76  |     await addQuestionButton.click();
  77  |
  78  |     await expect(
  79  |       page.getByRole('textbox', { name: /question/i }).or(page.getByText('Question'))
  80  |     ).toBeVisible({ timeout: 5000 });
  81  |   });
  82  |
  83  |   test('instructor can set correct answer', async ({ page }) => {
  84  |     await page.goto('/courses/course-react/quiz-builder');
  85  |     await page.waitForLoadState('networkidle');
  86  |
  87  |     const correctAnswerOption = page.getByRole('radio', { name: /correct answer|correct/i });
> 88  |     await expect(correctAnswerOption.first()).toBeVisible({ timeout: 10000 });
      |                                               ^ Error: expect(locator).toBeVisible() failed
  89  |     await correctAnswerOption.first().check();
  90  |   });
  91  |
  92  |   test('instructor can save quiz', async ({ page }) => {
  93  |     await page.goto('/courses/course-react/quiz-builder');
  94  |     await page.waitForLoadState('networkidle');
  95  |
  96  |     const saveButton = page.getByRole('button', { name: /save quiz|publish/i });
  97  |     await expect(saveButton).toBeVisible({ timeout: 10000 });
  98  |     await saveButton.click();
  99  |
  100 |     await expect(page.getByText(/quiz saved|quiz published/i)).toBeVisible({ timeout: 10000 });
  101 |   });
  102 | });
  103 |
  104 | test.describe('quiz accessibility', () => {
  105 |   test.beforeEach(async ({ page, app }) => {
  106 |     await app.loginAs(page, 'student');
  107 |   });
  108 |
  109 |   test('quiz questions are accessible via keyboard', async ({ page }) => {
  110 |     await page.goto('/courses/course-react/quiz/quiz-123');
  111 |     await page.waitForLoadState('networkidle');
  112 |
  113 |     await expect(page.getByRole('radio').first()).toBeVisible({ timeout: 10000 });
  114 |
  115 |     await page.keyboard.press('Tab');
  116 |     const firstOption = page.getByRole('radio').first();
  117 |     await expect(firstOption).toBeFocused();
  118 |
  119 |     await page.keyboard.press('ArrowRight');
  120 |     const secondOption = page.getByRole('radio').nth(1);
  121 |     await expect(secondOption).toBeFocused();
  122 |   });
  123 |
  124 |   test('quiz has proper heading structure', async ({ page }) => {
  125 |     await page.goto('/courses/course-react/quiz/quiz-123');
  126 |     await page.waitForLoadState('networkidle');
  127 |
  128 |     await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  129 |     await expect(
  130 |       page.getByRole('heading', { level: 2 }).or(page.getByRole('heading', { level: 3 }))
  131 |     ).toBeVisible();
  132 |   });
  133 | });
```