# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api-failures.spec.ts >> API failure handling >> failed request preserves previous data
- Location: e2e/api-failures.spec.ts:24:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/error|unavailable/i)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/error|unavailable/i)

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - img [ref=e7]
        - textbox "Search LearnSpace..." [ref=e10]
      - link "3" [ref=e11] [cursor=pointer]:
        - /url: /notifications
        - generic [ref=e12]:
          - img [ref=e13]
          - generic [ref=e15]: "3"
      - link [ref=e16] [cursor=pointer]:
        - /url: /messages
        - img [ref=e17]
  - generic [ref=e20]:
    - generic [ref=e22]:
      - img [ref=e24]
      - paragraph [ref=e26]: LearnSpace
    - generic [ref=e27]:
      - generic [ref=e28]:
        - generic [ref=e29]: MAIN MENU
        - list [ref=e30]:
          - link "Dashboard" [ref=e31] [cursor=pointer]:
            - /url: /dashboard
            - img [ref=e33]
            - paragraph [ref=e36]: Dashboard
          - link "My Courses" [ref=e37] [cursor=pointer]:
            - /url: /courses
            - img [ref=e39]
            - paragraph [ref=e42]: My Courses
          - link "Schedule" [ref=e43] [cursor=pointer]:
            - /url: /activity
            - img [ref=e45]
            - paragraph [ref=e48]: Schedule
          - link "Messages 3" [ref=e49] [cursor=pointer]:
            - /url: /messages
            - img [ref=e51]
            - paragraph [ref=e54]: Messages
            - generic [ref=e55]: "3"
          - link "Achievements" [ref=e56] [cursor=pointer]:
            - /url: /certificates
            - img [ref=e58]
            - paragraph [ref=e61]: Achievements
      - generic [ref=e62]:
        - generic [ref=e63]: SETTINGS
        - list [ref=e64]:
          - link "Profile" [ref=e65] [cursor=pointer]:
            - /url: /profile-settings
            - img [ref=e67]
            - paragraph [ref=e70]: Profile
          - link "Preferences" [ref=e71] [cursor=pointer]:
            - /url: /settings/notifications
            - img [ref=e73]
            - paragraph [ref=e76]: Preferences
          - link "Help Center" [ref=e77] [cursor=pointer]:
            - /url: /help
            - img [ref=e79]
            - paragraph [ref=e82]: Help Center
    - generic [ref=e84]:
      - generic [ref=e85]: ST
      - generic [ref=e86]:
        - paragraph [ref=e87]: Student Tester
        - paragraph [ref=e88]: student
      - button "Log out" [ref=e89] [cursor=pointer]:
        - img [ref=e90]
  - main [ref=e92]
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
  12  |       await expect(page.getByText(/network connection issue|check your connection/i)).toBeVisible();
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
> 33  |     await expect(page.getByText(/error|unavailable/i)).toBeVisible();
      |                                                        ^ Error: expect(locator).toBeVisible() failed
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
  113 |     if (await retryButton.isVisible()) {
  114 |       await retryButton.click();
  115 |
  116 |       await expect(page.getByText(/loading/i)).toBeVisible();
  117 |     }
  118 |   });
  119 | });
  120 |
  121 | test.describe('offline handling', () => {
  122 |   test('detects offline state', async ({ page }) => {
  123 |     await page.goto('/dashboard');
  124 |
  125 |     const offlineBanner = page.getByText(/you are offline|no connection/i);
  126 |     if (await offlineBanner.isVisible()) {
  127 |       await expect(offlineBanner).toBeVisible();
  128 |     }
  129 |   });
  130 |
  131 |   test('offline shows cached content when available', async ({ page }) => {
  132 |     await page.goto('/courses/explore');
  133 |
```