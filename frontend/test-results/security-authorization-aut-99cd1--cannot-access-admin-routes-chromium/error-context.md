# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-authorization.spec.ts >> authorization boundaries >> content_manager cannot access admin routes
- Location: e2e/security-authorization.spec.ts:119:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/cms|403/
Received string:  "http://127.0.0.1:4173/admin/dashboard"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    14 × unexpected value "http://127.0.0.1:4173/admin/dashboard"

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
          - link "Content Manager" [ref=e31] [cursor=pointer]:
            - /url: /cms/content
            - img [ref=e33]
            - paragraph [ref=e36]: Content Manager
          - link "Page Builder" [ref=e37] [cursor=pointer]:
            - /url: /cms/pages
            - img [ref=e39]
            - paragraph [ref=e42]: Page Builder
          - link "Media Library" [ref=e43] [cursor=pointer]:
            - /url: /cms/media
            - img [ref=e45]
            - paragraph [ref=e48]: Media Library
      - generic [ref=e49]:
        - generic [ref=e50]: SETTINGS
        - list [ref=e51]:
          - link "Notifications" [ref=e52] [cursor=pointer]:
            - /url: /notifications
            - img [ref=e54]
            - paragraph [ref=e57]: Notifications
          - link "Messages 3" [ref=e58] [cursor=pointer]:
            - /url: /messages
            - img [ref=e60]
            - paragraph [ref=e63]: Messages
            - generic [ref=e64]: "3"
          - link "Profile" [ref=e65] [cursor=pointer]:
            - /url: /profile-settings
            - img [ref=e67]
            - paragraph [ref=e70]: Profile
    - generic [ref=e72]:
      - generic [ref=e73]: CM
      - generic [ref=e74]:
        - paragraph [ref=e75]: Content Manager
        - paragraph [ref=e76]: content manager
      - button "Log out" [ref=e77] [cursor=pointer]:
        - img [ref=e78]
  - main [ref=e80]
```

# Test source

```ts
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
  116 |     await expect(page).toHaveURL(/\/instructor|403/);
  117 |   });
  118 |
  119 |   test('content_manager cannot access admin routes', async ({ page, app }) => {
  120 |     await app.loginAs(page, 'content_manager');
  121 |
  122 |     await page.goto('/admin/dashboard');
> 123 |     await expect(page).toHaveURL(/\/cms|403/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  124 |   });
  125 |
  126 |   test('content_manager cannot access system settings', async ({ page, app }) => {
  127 |     await app.loginAs(page, 'content_manager');
  128 |
  129 |     await page.goto('/admin/settings');
  130 |     await expect(page).toHaveURL(/\/cms|403/);
  131 |   });
  132 |
  133 |   test('unauthenticated user cannot access protected routes', async ({ page }) => {
  134 |     await assertProtectedRouteRedirects(page, '/dashboard');
  135 |     await assertProtectedRouteRedirects(page, '/profile');
  136 |     await assertProtectedRouteRedirects(page, '/instructor/dashboard');
  137 |     await assertProtectedRouteRedirects(page, '/admin/dashboard');
  138 |     await assertProtectedRouteRedirects(page, '/cms/content');
  139 |     await assertProtectedRouteRedirects(page, '/my-courses');
  140 |   });
  141 |
  142 |   test('student cannot access course creation', async ({ page, app }) => {
  143 |     await app.loginAs(page, 'student');
  144 |
  145 |     await page.goto('/courses/create');
  146 |     await expect(page).toHaveURL(/\/courses(\/explore)?|403/);
  147 |   });
  148 |
  149 |   test('student cannot access CMS upload', async ({ page, app }) => {
  150 |     await app.loginAs(page, 'student');
  151 |
  152 |     await page.goto('/cms/upload/any-course');
  153 |     await expect(page).toHaveURL(/\/dashboard|403/);
  154 |   });
  155 |
  156 |   test('instructor can access own course management', async ({ page, app }) => {
  157 |     await app.loginAs(page, 'instructor');
  158 |
  159 |     await page.goto('/instructor/dashboard');
  160 |     await expect(page).toHaveURL(/\/instructor\/dashboard/);
  161 |     await expect(page.getByText(/my courses|teaching/i)).toBeVisible();
  162 |   });
  163 | });
  164 |
  165 | test.describe('role-based UI elements', () => {
  166 |   test('student sees student dashboard only', async ({ page, app }) => {
  167 |     await app.loginAs(page, 'student');
  168 |
  169 |     await expect(page.getByRole('link', { name: 'User Management' })).toHaveCount(0);
  170 |     await expect(page.getByRole('link', { name: 'System Settings' })).toHaveCount(0);
  171 |     await expect(page.getByRole('link', { name: 'Content Manager' })).toHaveCount(0);
  172 |     await expect(page.getByRole('link', { name: 'Media Library' })).toHaveCount(0);
  173 |   });
  174 |
  175 |   test('instructor sees instructor dashboard', async ({ page, app }) => {
  176 |     await app.loginAs(page, 'instructor');
  177 |
  178 |     await expect(page.getByRole('link', { name: 'User Management' })).toHaveCount(0);
  179 |     await expect(page.getByRole('link', { name: 'System Settings' })).toHaveCount(0);
  180 |     await expect(page.getByRole('link', { name: 'Content Manager' })).toHaveCount(0);
  181 |   });
  182 |
  183 |   test('admin sees all dashboard options', async ({ page, app }) => {
  184 |     await app.loginAs(page, 'admin');
  185 |
  186 |     await expect(page.getByRole('link', { name: 'User Management' })).toHaveCount(1);
  187 |     await expect(page.getByRole('link', { name: 'System Settings' })).toHaveCount(1);
  188 |   });
  189 |
  190 |   test('content_manager sees CMS options', async ({ page, app }) => {
  191 |     await app.loginAs(page, 'content_manager');
  192 |
  193 |     await expect(page.getByRole('link', { name: 'Content Manager' })).toHaveCount(1);
  194 |     await expect(page.getByRole('link', { name: 'Media Library' })).toHaveCount(1);
  195 |   });
  196 | });
  197 |
  198 | test.describe('API security boundaries', () => {
  199 |   test('API endpoints reject requests without auth token', async ({ page }) => {
  200 |     await page.goto('/');
  201 |
  202 |     const responses: { url: string; status: number }[] = [];
  203 |     await page.route('**/api/**', async (route) => {
  204 |       responses.push({ url: route.request().url(), status: route.request().method() === 'OPTIONS' ? 204 : 401 });
  205 |     });
  206 |
  207 |     await page.goto('/api/courses');
  208 |     await page.goto('/api/users/me');
  209 |     await page.goto('/api/dashboard/student');
  210 |
  211 |     await expect(responses.some(r => r.status === 401)).toBeTruthy();
  212 |   });
  213 |
  214 |   test('API returns proper error for expired token', async ({ page, app }) => {
  215 |     app.setSessionActive(false);
  216 |     app.setRefreshFailure(true);
  217 |
  218 |     await page.goto('/dashboard');
  219 |     await expect(page).toHaveURL(/\/auth\/login/);
  220 |     await expect(page.getByText(/session expired|please sign in/i)).toBeVisible();
  221 |   });
  222 |
  223 |   test('forbidden endpoints return 403', async ({ page, app }) => {
```