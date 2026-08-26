# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-user-flows.spec.ts >> core user flows - authentication >> complete registration flow
- Location: e2e/core-user-flows.spec.ts:25:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /create account|sign up/i })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: /create account|sign up/i })

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - img [ref=e6]
  - generic [ref=e10]:
    - generic [ref=e11]:
      - heading "Create an account" [level=4] [ref=e12]
      - paragraph [ref=e13]: Start your learning journey today.
    - tablist "Choose account role" [ref=e16]:
      - tab "Student" [selected] [ref=e17] [cursor=pointer]:
        - generic [ref=e18]:
          - img [ref=e19]
          - generic [ref=e21]: Student
      - tab "Instructor" [ref=e22] [cursor=pointer]:
        - generic [ref=e23]:
          - img [ref=e24]
          - generic [ref=e26]: Instructor
    - generic [ref=e28]:
      - generic [ref=e29]:
        - paragraph [ref=e30]: Full Name
        - generic [ref=e32]:
          - img [ref=e34]
          - textbox "Jane Doe" [ref=e36]
          - group
      - generic [ref=e37]:
        - paragraph [ref=e38]: Email address
        - generic [ref=e40]:
          - img [ref=e42]
          - textbox "jane@example.com" [ref=e44]
          - group
      - generic [ref=e45]:
        - paragraph [ref=e46]: Password
        - generic [ref=e47]:
          - generic [ref=e48]:
            - img [ref=e50]
            - textbox "Create a password" [ref=e52]
            - button "Show password" [ref=e54] [cursor=pointer]:
              - img [ref=e55]
            - group
          - paragraph [ref=e57]: Use 8+ characters with uppercase, lowercase, number, and special character.
      - button "Create Account" [ref=e58] [cursor=pointer]
    - generic [ref=e59]:
      - text: By clicking continue, you agree to our
      - link "Terms of Service" [ref=e60] [cursor=pointer]:
        - /url: /terms
      - text: and
      - link "Privacy Policy" [ref=e61] [cursor=pointer]:
        - /url: /privacy
      - text: .
  - paragraph [ref=e62]:
    - text: Already have an account?
    - link "Log in" [ref=e63] [cursor=pointer]:
      - /url: /auth/login
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
> 28  |     await expect(page.getByRole('heading', { name: /create account|sign up/i })).toBeVisible();
      |                                                                                  ^ Error: expect(locator).toBeVisible() failed
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
  55  |     await page.getByRole('textbox', { name: /email/i }).fill('test@test.com');
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
```