# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-authorization.spec.ts >> authentication security >> login with invalid credentials shows error without leaking info
- Location: e2e/security-authorization.spec.ts:8:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Invalid credentials')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Invalid credentials')

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
          - text: nonexistent@test.com
        - group:
          - generic: Email
    - button "Forgot password?" [ref=e21] [cursor=pointer]
    - generic [ref=e22]:
      - generic [ref=e23]: Password
      - generic [ref=e24]:
        - textbox "Password" [ref=e25]:
          - /placeholder: ••••••••
          - text: WrongPassword123!
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
  2   | import {
  3   |   assertProtectedRouteRedirects,
  4   |   expectToBeOnUrl,
  5   | } from './support/factories';
  6   |
  7   | test.describe('authentication security', () => {
  8   |   test('login with invalid credentials shows error without leaking info', async ({ page }) => {
  9   |     await page.goto('/auth/login');
  10  |
  11  |     await page.getByRole('textbox', { name: 'Email' }).fill('nonexistent@test.com');
  12  |     await page.locator('#password').fill('WrongPassword123!');
  13  |     await page.getByRole('button', { name: 'Sign in' }).click();
  14  |
> 15  |     await expect(page.getByText('Invalid credentials')).toBeVisible();
      |                                                         ^ Error: expect(locator).toBeVisible() failed
  16  |     await expectToBeOnUrl(page, /\/auth\/login/);
  17  |   });
  18  |
  19  |   test('login with correct email but wrong password shows error', async ({ page }) => {
  20  |     await page.goto('/auth/login');
  21  |
  22  |     await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
  23  |     await page.locator('#password').fill('WrongPassword123!');
  24  |     await page.getByRole('button', { name: 'Sign in' }).click();
  25  |
  26  |     await expect(page.getByText('Invalid credentials')).toBeVisible();
  27  |   });
  28  |
  29  |   test('login rate limiting - multiple failed attempts', async ({ page }) => {
  30  |     await page.goto('/auth/login');
  31  |
  32  |     for (let i = 0; i < 3; i++) {
  33  |       await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
  34  |       await page.locator('#password').fill('WrongPassword123!');
  35  |       await page.getByRole('button', { name: 'Sign in' }).click();
  36  |       await page.waitForTimeout(200);
  37  |     }
  38  |
  39  |     await expect(page.getByText(/too many|rate limit|please try again/i)).toBeVisible();
  40  |   });
  41  |
  42  |   test('csrf token is required for login', async ({ page, app }) => {
  43  |     app.setSessionActive(false);
  44  |
  45  |     await page.goto('/auth/login');
  46  |     await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
  47  |     await page.locator('#password').fill('Passw0rd!');
  48  |
  49  |     await page.evaluate(() => {
  50  |       const tokenInput = document.querySelector('input[name="csrf"]') as HTMLInputElement;
  51  |       if (tokenInput) tokenInput.value = '';
  52  |     });
  53  |
  54  |     await page.getByRole('button', { name: 'Sign in' }).click();
  55  |     await expect(page.getByText(/security error|csrf/i)).toBeVisible({ timeout: 5000 });
  56  |   });
  57  |
  58  |   test('session persists across page refreshes', async ({ page, app }) => {
  59  |     await app.loginAs(page, 'student');
  60  |     await expect(page).toHaveURL(/\/dashboard/);
  61  |
  62  |     await page.reload();
  63  |     await expect(page).toHaveURL(/\/dashboard/);
  64  |
  65  |     await page.goto('/profile');
  66  |     await expect(page).toHaveURL(/\/profile/);
  67  |   });
  68  |
  69  |   test('logout clears session completely', async ({ page, app }) => {
  70  |     await app.loginAs(page, 'student');
  71  |     await expect(page).toHaveURL(/\/dashboard/);
  72  |
  73  |     await page.click('[class*="logout"], button:has-text("Logout"), [aria-label="Logout"]');
  74  |     await page.waitForTimeout(500);
  75  |
  76  |     await page.goto('/dashboard');
  77  |     await expect(page).toHaveURL(/\/auth\/login/);
  78  |   });
  79  |
  80  |   test('expired access token triggers refresh', async ({ page, app }) => {
  81  |     await app.loginAs(page, 'student');
  82  |     await expect(page).toHaveURL(/\/dashboard/);
  83  |
  84  |     app.setRefreshFailure(true);
  85  |     await page.goto('/dashboard');
  86  |     await expect(page).toHaveURL(/\/auth\/login/);
  87  |   });
  88  | });
  89  |
  90  | test.describe('authorization boundaries', () => {
  91  |   test('student cannot access instructor dashboard', async ({ page, app }) => {
  92  |     await app.loginAs(page, 'student');
  93  |
  94  |     await page.goto('/instructor/dashboard');
  95  |     await expect(page).toHaveURL(/\/dashboard|403|access denied|unauthorized/i);
  96  |   });
  97  |
  98  |   test('student cannot access admin dashboard', async ({ page, app }) => {
  99  |     await app.loginAs(page, 'student');
  100 |
  101 |     await page.goto('/admin/dashboard');
  102 |     await expect(page).toHaveURL(/\/dashboard|403|access denied|unauthorized/i);
  103 |   });
  104 |
  105 |   test('instructor cannot access admin dashboard', async ({ page, app }) => {
  106 |     await app.loginAs(page, 'instructor');
  107 |
  108 |     await page.goto('/admin/dashboard');
  109 |     await expect(page).toHaveURL(/\/instructor|403|access denied|unauthorized/i);
  110 |   });
  111 |
  112 |   test('instructor cannot access user management', async ({ page, app }) => {
  113 |     await app.loginAs(page, 'instructor');
  114 |
  115 |     await page.goto('/admin/users');
```