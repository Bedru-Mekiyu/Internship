# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-authorization.spec.ts >> authorization boundaries >> student cannot access CMS upload
- Location: e2e/security-authorization.spec.ts:149:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/dashboard|403/
Received string:  "http://127.0.0.1:4173/cms/upload/any-course"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    14 × unexpected value "http://127.0.0.1:4173/cms/upload/any-course"

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
        - paragraph [ref=e30]: The page "/cms/upload/any-course" doesn't exist or has been moved.
      - generic [ref=e31]:
        - link "Go to Dashboard" [ref=e32] [cursor=pointer]:
          - /url: /dashboard
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
> 153 |     await expect(page).toHaveURL(/\/dashboard|403/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
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
  224 |     await app.loginAs(page, 'student');
  225 |
  226 |     let found403 = false;
  227 |     await page.route('**/api/admin/**', async (route) => {
  228 |       if (route.request().method() !== 'OPTIONS') {
  229 |         found403 = true;
  230 |       }
  231 |     });
  232 |
  233 |     await page.goto('/admin/dashboard');
  234 |     await page.waitForTimeout(1000);
  235 |
  236 |     expect(found403).toBeTruthy();
  237 |   });
  238 | });
  239 |
  240 | test.describe('password security', () => {
  241 |   test('password field is masked in login form', async ({ page }) => {
  242 |     await page.goto('/auth/login');
  243 |
  244 |     const passwordInput = page.locator('#password');
  245 |     await expect(passwordInput).toHaveAttribute('type', 'password');
  246 |   });
  247 |
  248 |   test('password requirements shown on registration', async ({ page }) => {
  249 |     await page.goto('/auth/signup');
  250 |
  251 |     await expect(page.getByText(/uppercase|lowercase|number|special/i)).toBeVisible();
  252 |   });
  253 |
```