# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-user-flows.spec.ts >> core user flows - authentication >> password reset flow
- Location: e2e/core-user-flows.spec.ts:52:3

# Error details

```
TimeoutError: locator.fill: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('textbox', { name: /email/i })

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
        - paragraph [ref=e30]: The page "/auth/forgot-password" doesn't exist or has been moved.
      - generic [ref=e31]:
        - link "Go Home" [ref=e32] [cursor=pointer]:
          - /url: /
          - img [ref=e34]
          - text: Go Home
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
  2   | import {
  3   |   ROLE_CREDENTIALS,
  4   |   ROLE_DASHBOARDS,
  5   | } from './support/factories';
  6   |
  7   | test.describe('core user flows - authentication', () => {
  8   |   test('complete login flow with CSRF protection', async ({ page, app }) => {
  9   |     await page.goto('/auth/login');
  10  |
  11  |     await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  12  |
  13  |     const csrfTokenRequest = app.metrics.csrfTokenRequests;
  14  |     await page.getByRole('textbox', { name: 'Email' }).fill(ROLE_CREDENTIALS.student.email);
  15  |     await page.locator('#password').fill(ROLE_CREDENTIALS.student.password);
  16  |
  17  |     await page.getByRole('button', { name: 'Sign in' }).click();
  18  |
  19  |     await page.waitForURL(ROLE_DASHBOARDS.student);
  20  |
  21  |     expect(app.metrics.csrfTokenRequests).toBeGreaterThanOrEqual(csrfTokenRequest);
  22  |     expect(app.metrics.loginRequestsWithCsrfHeader).toBeGreaterThanOrEqual(1);
  23  |   });
  24  |
  25  |   test('complete registration flow', async ({ page }) => {
  26  |     await page.goto('/auth/signup');
  27  |
  28  |     await expect(page.getByRole('heading', { name: /create account|sign up/i })).toBeVisible();
  29  |
  30  |     const uniqueEmail = `newuser-${Date.now()}@test.com`;
  31  |     await page.getByRole('textbox', { name: /email/i }).fill(uniqueEmail);
  32  |     await page.getByRole('textbox', { name: /first name/i }).fill('New');
  33  |     await page.getByRole('textbox', { name: /last name/i }).fill('User');
  34  |     await page.getByRole('textbox', { name: /password/i }).fill('NewUser123!');
  35  |     await page.getByRole('button', { name: /create account|sign up/i }).click();
  36  |
  37  |     await expect(page.getByText(/verify your email|check your email/i)).toBeVisible({ timeout: 5000 });
  38  |   });
  39  |
  40  |   test('logout flow', async ({ page, app }) => {
  41  |     await app.loginAs(page, 'student');
  42  |     await expect(page).toHaveURL(/\/dashboard/);
  43  |
  44  |     const logoutButton = page.getByRole('button', { name: /logout|sign out/i }).first();
  45  |     await logoutButton.click();
  46  |     await page.waitForTimeout(500);
  47  |
  48  |     await page.goto('/dashboard');
  49  |     await expect(page).toHaveURL(/\/auth\/login/);
  50  |   });
  51  |
  52  |   test('password reset flow', async ({ page }) => {
  53  |     await page.goto('/auth/forgot-password');
  54  |
> 55  |     await page.getByRole('textbox', { name: /email/i }).fill('test@test.com');
      |                                                         ^ TimeoutError: locator.fill: Timeout 15000ms exceeded.
  56  |     await page.getByRole('button', { name: /send reset|submit/i }).click();
  57  |
  58  |     await expect(page.getByText(/check your email|reset link sent/i)).toBeVisible({ timeout: 5000 });
  59  |   });
  60  | });
  61  |
  62  | test.describe('core user flows - student dashboard', () => {
  63  |   test('student dashboard loads with correct data', async ({ page, app }) => {
  64  |     await app.loginAs(page, 'student');
  65  |     await expect(page).toHaveURL(/\/dashboard/);
  66  |
  67  |     await expect(page.getByText(/my courses|progress/i)).toBeVisible();
  68  |     await expect(page.getByText(/enrolled|courses/i)).toBeVisible();
  69  |   });
  70  |
  71  |   test('student can view enrolled courses', async ({ page, app }) => {
  72  |     await app.loginAs(page, 'student');
  73  |     await page.goto('/my-courses');
  74  |
  75  |     await expect(page.getByText(/enrolled|courses/i)).toBeVisible({ timeout: 5000 });
  76  |   });
  77  |
  78  |   test('student can browse course catalog', async ({ page }) => {
  79  |     await page.goto('/courses/explore');
  80  |
  81  |     await expect(page.getByRole('heading', { name: /explore courses/i })).toBeVisible();
  82  |     await expect(page.getByPlaceholder(/search courses/i)).toBeVisible({ timeout: 5000 });
  83  |   });
  84  |
  85  |   test('student can view course details', async ({ page, app }) => {
  86  |     await app.loginAs(page, 'student');
  87  |
  88  |     await page.goto('/courses/course-react');
  89  |
  90  |     await expect(page.getByText(/react|foundations/i)).toBeVisible({ timeout: 5000 });
  91  |   });
  92  |
  93  |   test('student can filter courses by category', async ({ page }) => {
  94  |     await page.goto('/courses/explore');
  95  |
  96  |     const categoryDropdown = page.getByRole('combobox', { name: /category/i });
  97  |     await expect(categoryDropdown).toBeVisible({ timeout: 5000 });
  98  |   });
  99  |
  100 |   test('student can search courses', async ({ page }) => {
  101 |     await page.goto('/courses/explore');
  102 |
  103 |     const searchInput = page.getByPlaceholder(/search courses/i);
  104 |     await searchInput.fill('react');
  105 |     await searchInput.press('Enter');
  106 |
  107 |     await page.waitForTimeout(1000);
  108 |   });
  109 | });
  110 |
  111 | test.describe('core user flows - instructor dashboard', () => {
  112 |   test('instructor dashboard loads with analytics', async ({ page, app }) => {
  113 |     await app.loginAs(page, 'instructor');
  114 |     await expect(page).toHaveURL(/\/instructor\/dashboard/);
  115 |
  116 |     await expect(page.getByText(/my courses|teaching|analytics/i)).toBeVisible({ timeout: 5000 });
  117 |   });
  118 |
  119 |   test('instructor can create new course', async ({ page, app }) => {
  120 |     await app.loginAs(page, 'instructor');
  121 |     await page.goto('/courses/create');
  122 |
  123 |     await page.getByRole('textbox', { name: /title/i }).fill('Test Course');
  124 |     await page.getByRole('textbox', { name: /description/i }).fill('Test description');
  125 |     await page.getByRole('button', { name: /create|save|publish/i }).click();
  126 |
  127 |     await page.waitForTimeout(1000);
  128 |   });
  129 |
  130 |   test('instructor can view course analytics', async ({ page, app }) => {
  131 |     await app.loginAs(page, 'instructor');
  132 |     await page.goto('/instructor/dashboard');
  133 |
  134 |     await expect(page.getByText(/students|enrollment|revenue/i)).toBeVisible({ timeout: 5000 });
  135 |   });
  136 |
  137 |   test('instructor can manage course content', async ({ page, app }) => {
  138 |     await app.loginAs(page, 'instructor');
  139 |
  140 |     await page.goto('/instructor/dashboard');
  141 |
  142 |     await page.getByRole('link', { name: /my courses/i }).click();
  143 |     await page.waitForTimeout(500);
  144 |   });
  145 | });
  146 |
  147 | test.describe('core user flows - admin dashboard', () => {
  148 |   test('admin dashboard loads with system overview', async ({ page, app }) => {
  149 |     await app.loginAs(page, 'admin');
  150 |     await expect(page).toHaveURL(/\/admin\/dashboard/);
  151 |
  152 |     await expect(page.getByText(/users|courses|system/i)).toBeVisible({ timeout: 5000 });
  153 |   });
  154 |
  155 |   test('admin can access user management', async ({ page, app }) => {
```