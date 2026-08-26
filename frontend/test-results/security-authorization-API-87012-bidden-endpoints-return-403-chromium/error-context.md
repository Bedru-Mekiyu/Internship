# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-authorization.spec.ts >> API security boundaries >> forbidden endpoints return 403
- Location: e2e/security-authorization.spec.ts:223:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
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
> 236 |     expect(found403).toBeTruthy();
      |                      ^ Error: expect(received).toBeTruthy()
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
  254 |   test('weak password rejected during registration', async ({ page }) => {
  255 |     await page.goto('/auth/signup');
  256 |
  257 |     await page.getByRole('textbox', { name: 'Email' }).fill('newuser@test.com');
  258 |     await page.getByRole('textbox', { name: 'First name' }).fill('New');
  259 |     await page.getByRole('textbox', { name: 'Last name' }).fill('User');
  260 |     await page.getByRole('textbox', { name: 'Password' }).fill('weak');
  261 |     await page.getByRole('button', { name: 'Create account' }).click();
  262 |
  263 |     await expect(page.getByText(/password must|requirements|invalid/i)).toBeVisible();
  264 |   });
  265 | });
  266 |
  267 | test.describe('data isolation', () => {
  268 |   test('student only sees own enrollment data', async ({ page, app }) => {
  269 |     await app.loginAs(page, 'student');
  270 |
  271 |     await page.goto('/my-courses');
  272 |     const content = await page.content();
  273 |
  274 |     const otherStudentIds = ['user-other-1', 'user-other-2'];
  275 |     for (const id of otherStudentIds) {
  276 |       expect(content).not.toContain(id);
  277 |     }
  278 |   });
  279 |
  280 |   test('instructor only sees own course analytics', async ({ page, app }) => {
  281 |     await app.loginAs(page, 'instructor');
  282 |
  283 |     await page.goto('/instructor/dashboard');
  284 |     await expect(page.getByText(/my courses|teaching/i)).toBeVisible();
  285 |   });
  286 |
  287 |   test('discussions are isolated by course', async ({ page, app }) => {
  288 |     await app.loginAs(page, 'student');
  289 |
  290 |     const responses: string[] = [];
  291 |     await page.route('**/api/discussions/**', async (route) => {
  292 |       responses.push(route.request().url());
  293 |     });
  294 |
  295 |     await page.goto('/courses/course-react/discussions');
  296 |     await page.waitForTimeout(500);
  297 |
  298 |     const courseDiscussionsCalls = responses.filter(r => r.includes('course-react'));
  299 |     expect(courseDiscussionsCalls.length).toBeGreaterThan(0);
  300 |   });
  301 | });
```