# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-authorization.spec.ts >> authorization boundaries >> instructor cannot access admin dashboard
- Location: e2e/security-authorization.spec.ts:105:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/instructor|403|access denied|unauthorized/i
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
          - link "Instructor Dashboard" [ref=e31] [cursor=pointer]:
            - /url: /instructor/dashboard
            - img [ref=e33]
            - paragraph [ref=e36]: Instructor Dashboard
          - link "My Courses" [ref=e37] [cursor=pointer]:
            - /url: /courses
            - img [ref=e39]
            - paragraph [ref=e42]: My Courses
          - link "Create New Course" [ref=e43] [cursor=pointer]:
            - /url: /courses/new
            - img [ref=e45]
            - paragraph [ref=e48]: Create New Course
          - link "Upload Lesson" [ref=e49] [cursor=pointer]:
            - /url: /lessons/upload
            - img [ref=e51]
            - paragraph [ref=e54]: Upload Lesson
          - link "Analytics" [ref=e55] [cursor=pointer]:
            - /url: /admin/analytics
            - img [ref=e57]
            - paragraph [ref=e61]: Analytics
      - generic [ref=e62]:
        - generic [ref=e63]: LEARNING
        - list [ref=e64]:
          - link "Activity" [ref=e65] [cursor=pointer]:
            - /url: /activity
            - img [ref=e67]
            - paragraph [ref=e71]: Activity
      - generic [ref=e72]:
        - generic [ref=e73]: CONTENT
        - list [ref=e74]:
          - link "Media Library" [ref=e75] [cursor=pointer]:
            - /url: /cms/media
            - img [ref=e77]
            - paragraph [ref=e80]: Media Library
      - generic [ref=e81]:
        - generic [ref=e82]: SETTINGS
        - list [ref=e83]:
          - link "Messages 3" [ref=e84] [cursor=pointer]:
            - /url: /messages
            - img [ref=e86]
            - paragraph [ref=e89]: Messages
            - generic [ref=e90]: "3"
          - link "Profile" [ref=e91] [cursor=pointer]:
            - /url: /profile-settings
            - img [ref=e93]
            - paragraph [ref=e96]: Profile
          - link "Help Center" [ref=e97] [cursor=pointer]:
            - /url: /help
            - img [ref=e99]
            - paragraph [ref=e102]: Help Center
    - generic [ref=e104]:
      - generic [ref=e105]: IT
      - generic [ref=e106]:
        - paragraph [ref=e107]: Instructor Tester
        - paragraph [ref=e108]: instructor
      - button "Log out" [ref=e109] [cursor=pointer]:
        - img [ref=e110]
  - main [ref=e112]
```

# Test source

```ts
  9   |     await page.goto('/auth/login');
  10  |
  11  |     await page.getByRole('textbox', { name: 'Email' }).fill('nonexistent@test.com');
  12  |     await page.locator('#password').fill('WrongPassword123!');
  13  |     await page.getByRole('button', { name: 'Sign in' }).click();
  14  |
  15  |     await expect(page.getByText('Invalid credentials')).toBeVisible();
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
> 109 |     await expect(page).toHaveURL(/\/instructor|403|access denied|unauthorized/i);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
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
  123 |     await expect(page).toHaveURL(/\/cms|403/);
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
```