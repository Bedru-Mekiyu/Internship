# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: course-enrollment.spec.ts >> instructor course management >> instructor can view their courses
- Location: e2e/course-enrollment.spec.ts:128:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /my courses|your courses/i }).or(getByText('Instructor Courses'))
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: /my courses|your courses/i }).or(getByText('Instructor Courses'))

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
        - paragraph [ref=e30]: The page "/instructor/courses" doesn't exist or has been moved.
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
  119 |   test('instructor can access course creation', async ({ page }) => {
  120 |     await page.goto('/courses/create');
  121 |     await page.waitForLoadState('networkidle');
  122 |
  123 |     await expect(
  124 |       page.getByRole('heading', { name: /create course/i }).or(page.getByText('New Course'))
  125 |     ).toBeVisible({ timeout: 10000 });
  126 |   });
  127 |
  128 |   test('instructor can view their courses', async ({ page }) => {
  129 |     await page.goto('/instructor/courses');
  130 |     await page.waitForLoadState('networkidle');
  131 |
  132 |     await expect(
  133 |       page.getByRole('heading', { name: /my courses|your courses/i }).or(page.getByText('Instructor Courses'))
> 134 |     ).toBeVisible({ timeout: 10000 });
      |       ^ Error: expect(locator).toBeVisible() failed
  135 |   });
  136 | });
```