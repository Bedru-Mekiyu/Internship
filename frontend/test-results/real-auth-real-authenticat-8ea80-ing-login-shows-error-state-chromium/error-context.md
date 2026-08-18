# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: real-auth.spec.ts >> real authentication flow >> network error during login shows error state
- Location: e2e/real-auth.spec.ts:73:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/error|failed|network/i)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/error|failed|network/i)

```

# Page snapshot

```yaml
- generic [ref=e6]:
  - img [ref=e9]
  - generic [ref=e11]:
    - heading "Welcome back" [level=5] [ref=e12]
    - paragraph [ref=e13]: Enter your credentials to access your courses
  - generic [ref=e15]:
    - generic "Email address" [ref=e16]:
      - generic [ref=e17]: Email
      - generic [ref=e18]:
        - textbox "Email" [ref=e19]:
          - /placeholder: name@example.com
          - text: student@learnspace.dev
        - group:
          - generic: Email
    - button "Forgot password?" [ref=e21] [cursor=pointer]
    - generic [ref=e22]:
      - generic [ref=e23]: Password
      - generic [ref=e24]:
        - textbox "Password" [ref=e25]:
          - /placeholder: ••••••••
          - text: Passw0rd!
        - button "Show password" [ref=e27] [cursor=pointer]:
          - img [ref=e28]
        - group:
          - generic: Password
    - alert [ref=e30]:
      - img [ref=e32]
      - generic [ref=e34]: Unable to complete your request right now. Please try again.
    - button "Sign in" [ref=e35] [cursor=pointer]: Sign in
  - generic [ref=e37]: OR CONTINUE WITH
  - generic [ref=e38]:
    - button "GH GitHub" [ref=e39] [cursor=pointer]:
      - generic [ref=e40]: GH
      - text: GitHub
    - button "G Google" [ref=e41] [cursor=pointer]:
      - generic [ref=e42]: G
      - text: Google
  - paragraph [ref=e43]:
    - text: Don't have an account?
    - link "Sign up" [ref=e44] [cursor=pointer]:
      - /url: /auth/signup
```

# Test source

```ts
  1   | import { test, expect } from './support/fixtures';
  2   |
  3   | test.describe('real authentication flow', () => {
  4   |   test('login with valid credentials redirects to role-appropriate dashboard', async ({ page, app }) => {
  5   |     await app.loginAs(page, 'student');
  6   |
  7   |     await expect(page).toHaveURL(/\/dashboard/);
  8   |     await expect(page.getByText('Student Tester')).toBeVisible();
  9   |   });
  10  |
  11  |   test('login with valid admin credentials redirects to admin dashboard', async ({ page, app }) => {
  12  |     await app.loginAs(page, 'admin');
  13  |
  14  |     await expect(page).toHaveURL(/\/admin\/dashboard/);
  15  |   });
  16  |
  17  |   test('login with valid instructor credentials redirects to instructor dashboard', async ({ page, app }) => {
  18  |     await app.loginAs(page, 'instructor');
  19  |
  20  |     await expect(page).toHaveURL(/\/instructor\/dashboard/);
  21  |   });
  22  |
  23  |   test('login with valid content_manager credentials redirects to CMS', async ({ page, app }) => {
  24  |     await app.loginAs(page, 'content_manager');
  25  |
  26  |     await expect(page).toHaveURL(/\/cms\/content/);
  27  |   });
  28  |
  29  |   test('login with invalid credentials shows error message', async ({ page, app }) => {
  30  |     await app.loginWithCredentials(page, 'wrong@test.com', 'WrongPassword123!');
  31  |
  32  |     await expect(page.getByText('Invalid credentials')).toBeVisible();
  33  |     await expect(page).toHaveURL(/\/auth\/login/);
  34  |   });
  35  |
  36  |   test('login with wrong password shows error message', async ({ page, app }) => {
  37  |     await app.loginWithCredentials(page, 'student@learnspace.dev', 'WrongPassword');
  38  |
  39  |     await expect(page.getByText('Invalid credentials')).toBeVisible();
  40  |   });
  41  |
  42  |   test('session persists across page navigation', async ({ page, app }) => {
  43  |     await app.loginAs(page, 'student');
  44  |     await expect(page).toHaveURL(/\/dashboard/);
  45  |
  46  |     await page.goto('/courses/explore');
  47  |     await expect(page).toHaveURL(/\/courses\/explore/);
  48  |
  49  |     await page.goto('/dashboard');
  50  |     await expect(page).toHaveURL(/\/dashboard/);
  51  |   });
  52  |
  53  |   test('logout clears session and redirects to login', async ({ page, app }) => {
  54  |     await app.loginAs(page, 'student');
  55  |     await expect(page).toHaveURL(/\/dashboard/);
  56  |
  57  |     await page.getByRole('button', { name: /sign out|logout/i }).click();
  58  |
  59  |     await expect(page).toHaveURL(/\/auth\/login/);
  60  |   });
  61  |
  62  |   test('expired session redirects to login', async ({ page, app }) => {
  63  |     await app.loginAs(page, 'student');
  64  |     await expect(page).toHaveURL(/\/dashboard/);
  65  |
  66  |     app.setSessionActive(false);
  67  |     app.setRefreshFailure(true);
  68  |
  69  |     await page.goto('/dashboard');
  70  |     await expect(page).toHaveURL(/\/auth\/login/);
  71  |   });
  72  |
  73  |   test('network error during login shows error state', async ({ page, app }) => {
  74  |     app.setLoginNetworkFailure(true);
  75  |
  76  |     await page.goto('/auth/login');
  77  |     await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
  78  |     await page.locator('#password').fill('Passw0rd!');
  79  |     await page.getByRole('button', { name: 'Sign in' }).click();
  80  |
> 81  |     await expect(page.getByText(/error|failed|network/i)).toBeVisible();
      |                                                           ^ Error: expect(locator).toBeVisible() failed
  82  |   });
  83  | });
  84  |
  85  | test.describe('authentication security', () => {
  86  |   test('protected route redirects unauthenticated user to login', async ({ page }) => {
  87  |     await page.goto('/dashboard');
  88  |     await expect(page).toHaveURL(/\/auth\/login/);
  89  |   });
  90  |
  91  |   test('redirect preserves intended destination', async ({ page }) => {
  92  |     await page.goto('/dashboard');
  93  |     await expect(page).toHaveURL(/\/auth\/login/);
  94  |
  95  |     await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
  96  |     await page.locator('#password').fill('Passw0rd!');
  97  |     await page.getByRole('button', { name: 'Sign in' }).click();
  98  |
  99  |     await expect(page).toHaveURL(/\/dashboard/);
  100 |   });
  101 |
  102 |   test('CSRF token is requested before login', async ({ page, app }) => {
  103 |     await page.goto('/auth/login');
  104 |
  105 |     expect(app.metrics.csrfTokenRequests).toBeGreaterThanOrEqual(1);
  106 |   });
  107 |
  108 |   test('login request includes CSRF token header', async ({ page, app }) => {
  109 |     await app.loginWithCredentials(page, 'student@learnspace.dev', 'Passw0rd!');
  110 |
  111 |     expect(app.metrics.loginRequestsWithCsrfHeader).toBe(1);
  112 |   });
  113 | });
```