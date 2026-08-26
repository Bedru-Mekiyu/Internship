# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-user-flows.spec.ts >> core user flows - instructor dashboard >> instructor can view course analytics
- Location: e2e/core-user-flows.spec.ts:130:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/students|enrollment|revenue/i)
Expected: visible
Error: strict mode violation: getByText(/students|enrollment|revenue/i) resolved to 10 elements:
    1) <p class="MuiTypography-root MuiTypography-body1 css-1q07bx">Track course performance, student activity, and r…</p> aka getByText('Track course performance,')
    2) <p class="MuiTypography-root MuiTypography-body2 css-7wqyn8">Total Students</p> aka getByText('Total Students')
    3) <p class="MuiTypography-root MuiTypography-body2 css-7wqyn8">Total Revenue</p> aka getByText('Total Revenue')
    4) <h6 class="MuiTypography-root MuiTypography-h6 css-azutn0">Revenue Overview</h6> aka getByRole('heading', { name: 'Revenue Overview' })
    5) <p class="MuiTypography-root MuiTypography-body2 css-1md2fi2">Last 6 months of course revenue.</p> aka getByText('Last 6 months of course')
    6) <p class="MuiTypography-root MuiTypography-body2 css-1w9weqd">No revenue data available yet.</p> aka getByText('No revenue data available yet.')
    7) <p class="MuiTypography-root MuiTypography-body2 css-1md2fi2">Your strongest courses by revenue and ratings.</p> aka getByText('Your strongest courses by')
    8) <h6 class="MuiTypography-root MuiTypography-h6 css-azutn0">Recent Enrollments</h6> aka getByRole('heading', { name: 'Recent Enrollments' })
    9) <p class="MuiTypography-root MuiTypography-body2 css-1md2fi2">Latest students joining your courses.</p> aka getByText('Latest students joining your')
    10) <p class="MuiTypography-root MuiTypography-body2 css-1xd2ctu">No enrollments yet. Students will appear here whe…</p> aka getByText('No enrollments yet. Students')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/students|enrollment|revenue/i)

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
  129 |
  130 |   test('instructor can view course analytics', async ({ page, app }) => {
  131 |     await app.loginAs(page, 'instructor');
  132 |     await page.goto('/instructor/dashboard');
  133 |
> 134 |     await expect(page.getByText(/students|enrollment|revenue/i)).toBeVisible({ timeout: 5000 });
      |                                                                  ^ Error: expect(locator).toBeVisible() failed
  135 |   });
  136 |
  137 |   test('instructor can manage course content', async ({ page, app }) => {
  138 |     await app.loginAs(page, 'instructor');
  139 |
  140 |     await page.goto('/instructor/dashboard');
  141 |
  142 |     await page.getByRole('link', { name: /my courses/i }).click();
  143 |     await page.waitForTimeout(500);
  144 |   });
  145 | });
  146 |
  147 | test.describe('core user flows - admin dashboard', () => {
  148 |   test('admin dashboard loads with system overview', async ({ page, app }) => {
  149 |     await app.loginAs(page, 'admin');
  150 |     await expect(page).toHaveURL(/\/admin\/dashboard/);
  151 |
  152 |     await expect(page.getByText(/users|courses|system/i)).toBeVisible({ timeout: 5000 });
  153 |   });
  154 |
  155 |   test('admin can access user management', async ({ page, app }) => {
  156 |     await app.loginAs(page, 'admin');
  157 |     await page.goto('/admin/users');
  158 |
  159 |     await expect(page.getByText(/users|manage/i)).toBeVisible({ timeout: 5000 });
  160 |   });
  161 |
  162 |   test('admin can access course manager', async ({ page, app }) => {
  163 |     await app.loginAs(page, 'admin');
  164 |     await page.goto('/admin/courses');
  165 |
  166 |     await expect(page.getByText(/courses|manage/i)).toBeVisible({ timeout: 5000 });
  167 |   });
  168 |
  169 |   test('admin can access system settings', async ({ page, app }) => {
  170 |     await app.loginAs(page, 'admin');
  171 |     await page.goto('/admin/settings');
  172 |
  173 |     await expect(page.getByText(/settings|configuration/i)).toBeVisible({ timeout: 5000 });
  174 |   });
  175 | });
  176 |
  177 | test.describe('core user flows - profile and settings', () => {
  178 |   test('user can view own profile', async ({ page, app }) => {
  179 |     await app.loginAs(page, 'student');
  180 |     await page.goto('/profile');
  181 |
  182 |     await expect(page.getByText(/profile|settings/i)).toBeVisible({ timeout: 5000 });
  183 |   });
  184 |
  185 |   test('user can update profile information', async ({ page, app }) => {
  186 |     await app.loginAs(page, 'student');
  187 |     await page.goto('/profile');
  188 |
  189 |     const firstNameInput = page.getByRole('textbox', { name: /first name/i });
  190 |     if (await firstNameInput.isVisible()) {
  191 |       await firstNameInput.fill('Updated Name');
  192 |       await page.getByRole('button', { name: /save|update/i }).click();
  193 |       await expect(page.getByText(/saved|updated|success/i)).toBeVisible({ timeout: 5000 });
  194 |     }
  195 |   });
  196 |
  197 |   test('user can access notification settings', async ({ page, app }) => {
  198 |     await app.loginAs(page, 'student');
  199 |     await page.goto('/settings/notifications');
  200 |
  201 |     await expect(page.getByText(/notification|email|preferences/i)).toBeVisible({ timeout: 5000 });
  202 |   });
  203 |
  204 |   test('user can change password', async ({ page, app }) => {
  205 |     await app.loginAs(page, 'student');
  206 |     await page.goto('/profile');
  207 |
  208 |     const changePasswordButton = page.getByRole('button', { name: /change password/i });
  209 |     if (await changePasswordButton.isVisible()) {
  210 |       await changePasswordButton.click();
  211 |       await page.getByRole('textbox', { name: /current password/i }).fill('Passw0rd!');
  212 |       await page.getByRole('textbox', { name: /new password/i }).fill('NewPass123!');
  213 |       await page.getByRole('button', { name: /update|save/i }).click();
  214 |     }
  215 |   });
  216 | });
  217 |
  218 | test.describe('core user flows - learning', () => {
  219 |   test('student can access course player', async ({ page, app }) => {
  220 |     await app.loginAs(page, 'student');
  221 |
  222 |     await page.goto('/learn/course-react');
  223 |
  224 |     await expect(page.getByText(/lessons|modules|content/i)).toBeVisible({ timeout: 5000 });
  225 |   });
  226 |
  227 |   test('student can track progress', async ({ page, app }) => {
  228 |     await app.loginAs(page, 'student');
  229 |
  230 |     await page.goto('/my-courses');
  231 |
  232 |     const progressElements = page.locator('[class*="progress"]');
  233 |     const count = await progressElements.count();
  234 |     expect(count).toBeGreaterThanOrEqual(0);
```