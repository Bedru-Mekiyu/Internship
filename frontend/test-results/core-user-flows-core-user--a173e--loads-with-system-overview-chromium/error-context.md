# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-user-flows.spec.ts >> core user flows - admin dashboard >> admin dashboard loads with system overview
- Location: e2e/core-user-flows.spec.ts:148:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/users|courses|system/i)
Expected: visible
Error: strict mode violation: getByText(/users|courses|system/i) resolved to 3 elements:
    1) <p class="MuiTypography-root MuiTypography-body1 MuiTypography-noWrap css-238799">System Settings</p> aka getByRole('link', { name: 'System Settings' })
    2) <p class="MuiTypography-root MuiTypography-body2 css-7wqyn8">Active Courses</p> aka getByText('Active Courses')
    3) <p class="MuiTypography-root MuiTypography-body2 css-1tqhzjp">Total courses</p> aka getByText('Total courses')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/users|courses|system/i)

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
            - link "Admin Dashboard" [ref=e31] [cursor=pointer]:
              - /url: /admin/dashboard
              - img [ref=e33]
              - paragraph [ref=e36]: Admin Dashboard
            - link "Analytics" [ref=e37] [cursor=pointer]:
              - /url: /admin/analytics
              - img [ref=e39]
              - paragraph [ref=e43]: Analytics
        - generic [ref=e44]:
          - generic [ref=e45]: CONTENT
          - list [ref=e46]:
            - link "Content Manager" [ref=e47] [cursor=pointer]:
              - /url: /cms/content
              - img [ref=e49]
              - paragraph [ref=e52]: Content Manager
            - link "Page Builder" [ref=e53] [cursor=pointer]:
              - /url: /cms/pages
              - img [ref=e55]
              - paragraph [ref=e58]: Page Builder
            - link "Media Library" [ref=e59] [cursor=pointer]:
              - /url: /cms/media
              - img [ref=e61]
              - paragraph [ref=e64]: Media Library
        - generic [ref=e65]:
          - generic [ref=e66]: ADMINISTRATION
          - list [ref=e67]:
            - link "Course Management" [ref=e68] [cursor=pointer]:
              - /url: /admin/courses
              - img [ref=e70]
              - paragraph [ref=e73]: Course Management
            - link "Contact Messages" [ref=e74] [cursor=pointer]:
              - /url: /admin/contacts
              - img [ref=e76]
              - paragraph [ref=e79]: Contact Messages
            - link "User Management" [ref=e80] [cursor=pointer]:
              - /url: /admin/users
              - img [ref=e82]
              - paragraph [ref=e85]: User Management
            - link "System Settings" [ref=e86] [cursor=pointer]:
              - /url: /admin/settings
              - img [ref=e88]
              - paragraph [ref=e91]: System Settings
            - link "Notifications" [ref=e92] [cursor=pointer]:
              - /url: /notifications
              - img [ref=e94]
              - paragraph [ref=e97]: Notifications
            - link "Messages 3" [ref=e98] [cursor=pointer]:
              - /url: /messages
              - img [ref=e100]
              - paragraph [ref=e103]: Messages
              - generic [ref=e104]: "3"
        - generic [ref=e105]:
          - generic [ref=e106]: SETTINGS
          - list [ref=e107]:
            - link "Profile" [ref=e108] [cursor=pointer]:
              - /url: /profile-settings
              - img [ref=e110]
              - paragraph [ref=e113]: Profile
      - generic [ref=e115]:
        - generic [ref=e116]: AT
        - generic [ref=e117]:
          - paragraph [ref=e118]: Admin Tester
          - paragraph [ref=e119]: admin
        - button "Log out" [ref=e120] [cursor=pointer]:
          - img [ref=e121]
    - main [ref=e123]:
      - generic [ref=e125]:
        - generic [ref=e126]:
          - generic [ref=e127]:
            - paragraph [ref=e128]: Admin workspace
            - heading "Dashboard" [level=4] [ref=e129]
            - paragraph [ref=e130]: Overview of your learning platform performance.
          - generic [ref=e131]:
            - generic "Search dashboard" [ref=e132]:
              - generic [ref=e133]:
                - textbox "Search…" [ref=e134]
                - group
            - button "Add new course" [ref=e135] [cursor=pointer]: + Add New Course
        - tablist [ref=e139]:
          - tab "Overview" [selected] [ref=e140] [cursor=pointer]
          - tab "Pending approvals" [ref=e141] [cursor=pointer]
        - generic [ref=e143]:
          - generic [ref=e148]:
            - paragraph [ref=e149]: Total Students
            - heading "420" [level=5] [ref=e150]
          - generic [ref=e155]:
            - paragraph [ref=e156]: Active Courses
            - heading "18" [level=5] [ref=e157]
          - generic [ref=e162]:
            - paragraph [ref=e163]: Total Revenue
            - heading "$125.0K" [level=5] [ref=e164]
          - generic [ref=e169]:
            - paragraph [ref=e170]: Pending Approvals
            - heading "2" [level=5] [ref=e171]
          - generic [ref=e174]:
            - generic [ref=e175]:
              - generic [ref=e176]:
                - heading "Revenue Analytics" [level=6] [ref=e177]
                - paragraph [ref=e178]: Monthly revenue performance across the current year.
              - generic [ref=e179]: Yearly
            - application [ref=e183]:
              - generic [ref=e187]:
                - generic [ref=e188]:
                  - generic [ref=e190]: Jan
                  - generic [ref=e192]: Feb
                - generic [ref=e193]:
                  - generic [ref=e195]: "0"
                  - generic [ref=e197]: "6"
                  - generic [ref=e199]: "12"
                  - generic [ref=e201]: "18"
                  - generic [ref=e203]: "24"
          - generic [ref=e207]:
            - generic [ref=e208]:
              - heading "Course Distribution" [level=6] [ref=e209]
              - paragraph [ref=e210]: Active catalog mix by category.
            - generic [ref=e211]:
              - heading "18" [level=2] [ref=e212]
              - paragraph [ref=e213]: Total courses
            - generic [ref=e214]:
              - generic [ref=e215]:
                - generic [ref=e216]:
                  - paragraph [ref=e219]: Development
                  - paragraph [ref=e220]: 50%
                - 'progressbar "Development: 50%" [ref=e221]'
              - generic [ref=e223]:
                - generic [ref=e224]:
                  - paragraph [ref=e227]: Design
                  - paragraph [ref=e228]: 28%
                - 'progressbar "Design: 28%" [ref=e229]'
          - generic [ref=e233]:
            - generic [ref=e234]:
              - generic [ref=e235]:
                - heading "Recent Enrollments" [level=6] [ref=e236]
                - paragraph [ref=e237]: New student enrollments across the platform.
              - link "View all users" [ref=e238] [cursor=pointer]:
                - /url: /admin/users
                - text: View All
            - table "Recent enrollment table" [ref=e240]:
              - rowgroup [ref=e241]:
                - row "Student Course Date Status" [ref=e242]:
                  - columnheader "Student" [ref=e243]
                  - columnheader "Course" [ref=e244]
                  - columnheader "Date" [ref=e245]
                  - columnheader "Status" [ref=e246]
              - rowgroup [ref=e247]:
                - row "PD Pat Doe React Foundations 2026-01-12 Active" [ref=e248]:
                  - cell "PD Pat Doe" [ref=e249]:
                    - generic [ref=e250]:
                      - generic [ref=e251]: PD
                      - paragraph [ref=e252]: Pat Doe
                  - cell "React Foundations" [ref=e253]:
                    - paragraph [ref=e254]: React Foundations
                  - cell "2026-01-12" [ref=e255]:
                    - paragraph [ref=e256]: 2026-01-12
                  - cell "Active" [ref=e257]:
                    - paragraph [ref=e258]: Active
  - generic [ref=e259]: "0"
```

# Test source

```ts
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
  134 |     await expect(page.getByText(/students|enrollment|revenue/i)).toBeVisible({ timeout: 5000 });
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
> 152 |     await expect(page.getByText(/users|courses|system/i)).toBeVisible({ timeout: 5000 });
      |                                                           ^ Error: expect(locator).toBeVisible() failed
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
  235 |   });
  236 |
  237 |   test('student can take quizzes', async ({ page, app }) => {
  238 |     await app.loginAs(page, 'student');
  239 |
  240 |     await page.goto('/courses/course-react/quiz/quiz-1');
  241 |
  242 |     await expect(page.getByText(/quiz|question/i)).toBeVisible({ timeout: 5000 });
  243 |   });
  244 | });
  245 |
  246 | test.describe('core user flows - content management', () => {
  247 |   test('content manager can access CMS', async ({ page, app }) => {
  248 |     await app.loginAs(page, 'content_manager');
  249 |     await expect(page).toHaveURL(/\/cms\/content/);
  250 |
  251 |     await expect(page.getByText(/pages|content|manage/i)).toBeVisible({ timeout: 5000 });
  252 |   });
```