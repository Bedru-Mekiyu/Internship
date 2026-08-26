# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-authorization.spec.ts >> data isolation >> instructor only sees own course analytics
- Location: e2e/security-authorization.spec.ts:280:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/my courses|teaching/i)
Expected: visible
Error: strict mode violation: getByText(/my courses|teaching/i) resolved to 3 elements:
    1) <p class="MuiTypography-root MuiTypography-body1 MuiTypography-noWrap css-238799">My Courses</p> aka getByRole('link', { name: 'My Courses' })
    2) <h6 class="MuiTypography-root MuiTypography-h6 css-azutn0">My Courses</h6> aka getByRole('heading', { name: 'My Courses' })
    3) <p class="MuiTypography-root MuiTypography-body2 css-1w9weqd">No courses yet. Create your first course to start…</p> aka getByText('No courses yet. Create your first course to start your teaching journey!')

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/my courses|teaching/i)

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
            - generic: "3"
        - link [ref=e15] [cursor=pointer]:
          - /url: /messages
          - img [ref=e16]
    - generic [ref=e19]:
      - generic [ref=e21]:
        - img [ref=e23]
        - paragraph [ref=e25]: LearnSpace
      - generic [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]: MAIN MENU
          - list [ref=e29]:
            - link "Instructor Dashboard" [ref=e30] [cursor=pointer]:
              - /url: /instructor/dashboard
              - img [ref=e32]
              - paragraph [ref=e35]: Instructor Dashboard
            - link "My Courses" [ref=e36] [cursor=pointer]:
              - /url: /courses
              - img [ref=e38]
              - paragraph [ref=e41]: My Courses
            - link "Create New Course" [ref=e42] [cursor=pointer]:
              - /url: /courses/new
              - img [ref=e44]
              - paragraph [ref=e47]: Create New Course
            - link "Upload Lesson" [ref=e48] [cursor=pointer]:
              - /url: /lessons/upload
              - img [ref=e50]
              - paragraph [ref=e53]: Upload Lesson
            - link "Analytics" [ref=e54] [cursor=pointer]:
              - /url: /admin/analytics
              - img [ref=e56]
              - paragraph [ref=e60]: Analytics
        - generic [ref=e61]:
          - generic [ref=e62]: LEARNING
          - list [ref=e63]:
            - link "Activity" [ref=e64] [cursor=pointer]:
              - /url: /activity
              - img [ref=e66]
              - paragraph [ref=e70]: Activity
        - generic [ref=e71]:
          - generic [ref=e72]: CONTENT
          - list [ref=e73]:
            - link "Media Library" [ref=e74] [cursor=pointer]:
              - /url: /cms/media
              - img [ref=e76]
              - paragraph [ref=e79]: Media Library
        - generic [ref=e80]:
          - generic [ref=e81]: SETTINGS
          - list [ref=e82]:
            - link "Messages 3" [ref=e83] [cursor=pointer]:
              - /url: /messages
              - img [ref=e85]
              - paragraph [ref=e88]: Messages
              - generic [ref=e89]: "3"
            - link "Profile" [ref=e90] [cursor=pointer]:
              - /url: /profile-settings
              - img [ref=e92]
              - paragraph [ref=e95]: Profile
            - link "Help Center" [ref=e96] [cursor=pointer]:
              - /url: /help
              - img [ref=e98]
              - paragraph [ref=e101]: Help Center
      - generic [ref=e103]:
        - generic [ref=e104]: IT
        - generic [ref=e105]:
          - paragraph [ref=e106]: Instructor Tester
          - paragraph [ref=e107]: instructor
        - button "Log out" [ref=e108] [cursor=pointer]:
          - img [ref=e109]
    - main [ref=e111]:
      - generic [ref=e113]:
        - generic [ref=e114]:
          - generic [ref=e115]:
            - paragraph [ref=e116]: Instructor workspace
            - heading "Welcome back, Instructor!" [level=4] [ref=e117]
            - paragraph [ref=e118]: Track course performance, student activity, and revenue from one focused workspace.
          - button "Create a new course" [ref=e119] [cursor=pointer]: New Course
        - generic [ref=e120]:
          - paragraph [ref=e122]: Loading dashboard metrics...
          - generic [ref=e128]:
            - paragraph [ref=e129]: Total Students
            - heading "…" [level=4] [ref=e130]
            - paragraph [ref=e131]: Live data
          - generic [ref=e137]:
            - paragraph [ref=e138]: Total Revenue
            - heading "…" [level=4] [ref=e139]
            - paragraph [ref=e140]: From payment records
          - generic [ref=e146]:
            - paragraph [ref=e147]: Average Rating
            - heading "…" [level=4] [ref=e148]
            - paragraph [ref=e149]: Across all courses
          - generic [ref=e155]:
            - paragraph [ref=e156]: Active Courses
            - heading "…" [level=4] [ref=e157]
            - paragraph [ref=e158]: Live data
        - generic [ref=e159]:
          - generic [ref=e162]:
            - generic [ref=e164]:
              - heading "Revenue Overview" [level=6] [ref=e165]
              - paragraph [ref=e166]: Last 6 months of course revenue.
            - application [ref=e170]:
              - generic [ref=e174]:
                - generic [ref=e175]:
                  - generic [ref=e177]: Jan
                  - generic [ref=e179]: Feb
                - generic [ref=e180]:
                  - generic [ref=e182]: "0"
                  - generic [ref=e184]: "4"
                  - generic [ref=e186]: "8"
                  - generic [ref=e188]: "12"
                  - generic [ref=e190]: "16"
          - generic [ref=e193]:
            - generic [ref=e194]:
              - heading "Top Performing Courses" [level=6] [ref=e195]
              - paragraph [ref=e196]: Your strongest courses by revenue and ratings.
            - paragraph [ref=e198]: No courses yet. Create your first course to see performance data.
        - generic [ref=e200]:
          - generic [ref=e202]:
            - heading "My Courses" [level=6] [ref=e203]
            - paragraph [ref=e204]: Quickly edit, view, and inspect performance.
          - paragraph [ref=e207]: No courses yet. Create your first course to start your teaching journey!
        - generic [ref=e208]:
          - generic [ref=e211]:
            - generic [ref=e213]:
              - heading "Recent Enrollments" [level=6] [ref=e214]
              - paragraph [ref=e215]: Latest students joining your courses.
            - table "Recent student enrollments" [ref=e217]:
              - rowgroup [ref=e218]:
                - row "Student Course Date Status" [ref=e219]:
                  - columnheader "Student" [ref=e220]
                  - columnheader "Course" [ref=e221]
                  - columnheader "Date" [ref=e222]
                  - columnheader "Status" [ref=e223]
              - rowgroup [ref=e224]:
                - row "No enrollments yet. Students will appear here when they enroll in your courses." [ref=e225]:
                  - cell "No enrollments yet. Students will appear here when they enroll in your courses." [ref=e226]:
                    - paragraph [ref=e227]: No enrollments yet. Students will appear here when they enroll in your courses.
          - generic [ref=e230]:
            - generic [ref=e231]:
              - heading "Student Engagement" [level=6] [ref=e232]
              - paragraph [ref=e233]: Key engagement metrics across your courses.
            - paragraph [ref=e235]: No engagement data available yet.
  - generic [ref=e236]: "0"
```

# Test source

```ts
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
> 284 |     await expect(page.getByText(/my courses|teaching/i)).toBeVisible();
      |                                                          ^ Error: expect(locator).toBeVisible() failed
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