# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api-failures.spec.ts >> API failure handling >> network error shows error message
- Location: e2e/api-failures.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/network connection issue|check your connection/i)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/network connection issue|check your connection/i)

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
  3   | test.describe('API failure handling', () => {
  4   |   test('network error shows error message', async ({ page, app }) => {
  5   |       app.setLoginNetworkFailure(true);
  6   |
  7   |       await page.goto('/auth/login');
  8   |       await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
  9   |       await page.locator('#password').fill('Passw0rd!');
  10  |       await page.getByRole('button', { name: 'Sign in' }).click();
  11  |
> 12  |       await expect(page.getByText(/network connection issue|check your connection/i)).toBeVisible();
      |                                                                                       ^ Error: expect(locator).toBeVisible() failed
  13  |     });
  14  |
  15  |   test('500 error shows error page', async ({ page, app }) => {
  16  |     await app.loginAs(page, 'student');
  17  |     app.setMediaFailureMode('server_error');
  18  |
  19  |     await page.goto('/cms/media');
  20  |
  21  |     await expect(page.getByText(/error|unavailable|temporary/i)).toBeVisible();
  22  |   });
  23  |
  24  |   test('failed request preserves previous data', async ({ page, app }) => {
  25  |     await app.loginAs(page, 'student');
  26  |
  27  |     await page.goto('/dashboard');
  28  |
  29  |     app.setMediaFailureMode('server_error');
  30  |
  31  |     await page.goto('/cms/media');
  32  |
  33  |     await expect(page.getByText(/error|unavailable/i)).toBeVisible();
  34  |   });
  35  |
  36  |   test('retry button appears on failure', async ({ page, app }) => {
  37  |     await app.loginAs(page, 'student');
  38  |     app.setMediaFailureMode('server_error');
  39  |
  40  |     await page.goto('/cms/media');
  41  |
  42  |     const retryButton = page.getByRole('button', { name: /retry|refresh|try again/i });
  43  |     if (await retryButton.isVisible()) {
  44  |       await retryButton.click();
  45  |
  46  |       await expect(page.getByText(/loading|loading/i)).toBeVisible();
  47  |     }
  48  |   });
  49  | });
  50  |
  51  | test.describe('loading states', () => {
  52  |   test('shows loading indicator during API call', async ({ page, app }) => {
  53  |     await app.loginAs(page, 'student');
  54  |
  55  |     await page.goto('/dashboard');
  56  |
  57  |     const loadingIndicator = page.getByText(/loading|please wait/i);
  58  |     if (await loadingIndicator.isVisible()) {
  59  |       await expect(loadingIndicator).toBeVisible();
  60  |     }
  61  |   });
  62  |
  63  |   test('shows skeleton while loading', async ({ page, app }) => {
  64  |     await app.loginAs(page, 'student');
  65  |
  66  |     await page.goto('/courses/explore');
  67  |
  68  |     const skeleton = page.locator('[class*="skeleton"]');
  69  |     if (await skeleton.first().isVisible()) {
  70  |       await expect(skeleton.first()).toBeVisible();
  71  |     }
  72  |   });
  73  | });
  74  |
  75  | test.describe('empty states', () => {
  76  |   test('shows empty state when no courses', async ({ page, app }) => {
  77  |     await app.loginAs(page, 'student');
  78  |
  79  |     await page.goto('/my-courses');
  80  |
  81  |     const emptyState = page.getByText(/no courses|enroll in a course/i);
  82  |     if (await emptyState.isVisible()) {
  83  |       await expect(emptyState).toBeVisible();
  84  |     }
  85  |   });
  86  |
  87  |   test('shows empty state when no notifications', async ({ page, app }) => {
  88  |     await app.loginAs(page, 'student');
  89  |
  90  |     await page.goto('/notifications');
  91  |
  92  |     const emptyState = page.getByText(/no notifications|all caught up/i);
  93  |     if (await emptyState.isVisible()) {
  94  |       await expect(emptyState).toBeVisible();
  95  |     }
  96  |   });
  97  | });
  98  |
  99  | test.describe('timeout handling', () => {
  100 |   test('long request shows timeout message', async ({ page }) => {
  101 |     await page.goto('/courses/explore');
  102 |
  103 |     const timeoutMessage = page.getByText(/request timed out|took too long/i);
  104 |     if (await timeoutMessage.isVisible()) {
  105 |       await expect(timeoutMessage).toBeVisible();
  106 |     }
  107 |   });
  108 |
  109 |   test('timeout allows retry', async ({ page }) => {
  110 |     await page.goto('/courses/explore');
  111 |
  112 |     const retryButton = page.getByRole('button', { name: /retry|try again/i });
```