# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: course-enrollment.spec.ts >> course enrollment flow >> browse courses and view course details
- Location: e2e/course-enrollment.spec.ts:8:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /react foundations/i })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: /react foundations/i })

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
    - generic [ref=e22]:
      - alert [ref=e23]:
        - img [ref=e25]
        - generic [ref=e27]: "Unhandled API route: GET /api/courses/course-react"
      - alert [ref=e28]:
        - img [ref=e30]
        - generic [ref=e32]: Course details are unavailable.
  - contentinfo [ref=e33]:
    - generic [ref=e35]:
      - generic [ref=e36]:
        - paragraph [ref=e38]: LearnSpace
        - paragraph [ref=e39]: Empowering educators to share knowledge and build sustainable businesses online.
      - generic [ref=e40]:
        - paragraph [ref=e41]: Product
        - generic [ref=e42]:
          - link "Features" [ref=e43] [cursor=pointer]:
            - /url: /#features
          - link "Courses" [ref=e44] [cursor=pointer]:
            - /url: /courses/explore
          - link "Pricing" [ref=e45] [cursor=pointer]:
            - /url: /pricing
          - link "Testimonials" [ref=e46] [cursor=pointer]:
            - /url: /#testimonials
      - generic [ref=e47]:
        - paragraph [ref=e48]: Company
        - generic [ref=e49]:
          - link "About" [ref=e50] [cursor=pointer]:
            - /url: /about
          - link "Careers" [ref=e51] [cursor=pointer]:
            - /url: /careers
          - link "Blog" [ref=e52] [cursor=pointer]:
            - /url: /blog
          - link "Contact" [ref=e53] [cursor=pointer]:
            - /url: /contact
      - generic [ref=e54]:
        - paragraph [ref=e55]: Resources
        - generic [ref=e56]:
          - link "Help Center" [ref=e57] [cursor=pointer]:
            - /url: /help
          - link "Docs" [ref=e58] [cursor=pointer]:
            - /url: /docs
          - link "Community" [ref=e59] [cursor=pointer]:
            - /url: /community
          - link "Status" [ref=e60] [cursor=pointer]:
            - /url: /status
    - generic [ref=e63]:
      - paragraph [ref=e64]: © 2026 LearnSpace. All rights reserved.
      - generic [ref=e65]:
        - link "Privacy" [ref=e66] [cursor=pointer]:
          - /url: /privacy
        - link "Terms" [ref=e67] [cursor=pointer]:
          - /url: /terms
        - link "Cookies" [ref=e68] [cursor=pointer]:
          - /url: /cookies
```

# Test source

```ts
  1   | import { test, expect } from './support/fixtures';
  2   |
  3   | test.describe('course enrollment flow', () => {
  4   |   test.beforeEach(async ({ page, app }) => {
  5   |     await app.loginAs(page, 'student');
  6   |   });
  7   |
  8   |   test('browse courses and view course details', async ({ page }) => {
  9   |     await page.goto('/courses/explore');
  10  |     await page.waitForLoadState('networkidle');
  11  |
  12  |     await expect(page.getByRole('heading', { name: /explore courses/i })).toBeVisible({ timeout: 10000 });
  13  |
  14  |     const courseCard = page.getByText('React Foundations').first();
  15  |     await expect(courseCard).toBeVisible();
  16  |     await courseCard.click();
  17  |
> 18  |     await expect(page.getByRole('heading', { name: /react foundations/i })).toBeVisible({ timeout: 10000 });
      |                                                                             ^ Error: expect(locator).toBeVisible() failed
  19  |     await expect(page.getByText('Build modern React apps')).toBeVisible();
  20  |   });
  21  |
  22  |   test('enroll in free course', async ({ page }) => {
  23  |     await page.goto('/courses/explore');
  24  |     await page.waitForLoadState('networkidle');
  25  |
  26  |     const courseCard = page.getByText('React Foundations').first();
  27  |     await expect(courseCard).toBeVisible();
  28  |     await courseCard.click();
  29  |
  30  |     const enrollButton = page.getByRole('button', { name: /enroll|start learning/i });
  31  |     await expect(enrollButton).toBeVisible({ timeout: 10000 });
  32  |     await enrollButton.click();
  33  |
  34  |     await expect(page.getByText(/enrollment successful|you are enrolled/i)).toBeVisible({ timeout: 15000 });
  35  |   });
  36  |
  37  |   test('course search returns matching results', async ({ page }) => {
  38  |     await page.goto('/courses/explore');
  39  |     await page.waitForLoadState('networkidle');
  40  |
  41  |     const searchBox = page.getByRole('textbox', { name: /search courses/i }).or(page.getByPlaceholder(/search/i));
  42  |     await expect(searchBox).toBeVisible({ timeout: 10000 });
  43  |     await searchBox.fill('React');
  44  |     await page.keyboard.press('Enter');
  45  |
  46  |     await page.waitForLoadState('networkidle');
  47  |     await expect(page.getByText('React Foundations')).toBeVisible({ timeout: 10000 });
  48  |   });
  49  |
  50  |   test('course filter by category works', async ({ page }) => {
  51  |     await page.goto('/courses/explore');
  52  |     await page.waitForLoadState('networkidle');
  53  |
  54  |     const categoryFilter = page.getByRole('combobox', { name: /category/i });
  55  |     await expect(categoryFilter).toBeVisible({ timeout: 10000 });
  56  |     await categoryFilter.selectOption('Development');
  57  |
  58  |     await page.waitForLoadState('networkidle');
  59  |     await expect(page.getByText('Development')).toBeVisible({ timeout: 10000 });
  60  |   });
  61  |
  62  |   test('course filter by level works', async ({ page }) => {
  63  |     await page.goto('/courses/explore');
  64  |     await page.waitForLoadState('networkidle');
  65  |
  66  |     const levelFilter = page.getByRole('combobox', { name: /level/i });
  67  |     await expect(levelFilter).toBeVisible({ timeout: 10000 });
  68  |     await levelFilter.selectOption('beginner');
  69  |
  70  |     await page.waitForLoadState('networkidle');
  71  |     await expect(page.getByText('React Foundations')).toBeVisible({ timeout: 10000 });
  72  |   });
  73  |
  74  |   test('access enrolled course content', async ({ page }) => {
  75  |     await page.goto('/my-courses');
  76  |     await page.waitForLoadState('networkidle');
  77  |
  78  |     const enrolledCourse = page.getByText('React Foundations').first();
  79  |     await expect(enrolledCourse).toBeVisible({ timeout: 10000 });
  80  |     await enrolledCourse.click();
  81  |
  82  |     await page.waitForURL(/\/learn\//, { timeout: 10000 });
  83  |   });
  84  |
  85  |   test('view my courses shows enrolled courses', async ({ page }) => {
  86  |     await page.goto('/my-courses');
  87  |     await page.waitForLoadState('networkidle');
  88  |
  89  |     await expect(
  90  |       page.getByRole('heading', { name: /my courses/i }).or(page.getByText('Enrolled Courses'))
  91  |     ).toBeVisible({ timeout: 10000 });
  92  |   });
  93  | });
  94  |
  95  | test.describe('course discovery for unauthenticated users', () => {
  96  |   test('explore courses page is accessible without login', async ({ page }) => {
  97  |     await page.goto('/courses/explore');
  98  |     await page.waitForLoadState('networkidle');
  99  |
  100 |     await expect(page.getByRole('heading', { name: /explore courses/i })).toBeVisible({ timeout: 10000 });
  101 |     await expect(page.getByText('React Foundations')).toBeVisible();
  102 |   });
  103 |
  104 |   test('course card shows key information', async ({ page }) => {
  105 |     await page.goto('/courses/explore');
  106 |     await page.waitForLoadState('networkidle');
  107 |
  108 |     await expect(page.getByText('React Foundations')).toBeVisible();
  109 |     await expect(page.getByText('Development')).toBeVisible();
  110 |     await expect(page.getByText('beginner')).toBeVisible();
  111 |   });
  112 | });
  113 |
  114 | test.describe('instructor course management', () => {
  115 |   test.beforeEach(async ({ page, app }) => {
  116 |     await app.loginAs(page, 'instructor');
  117 |   });
  118 |
```