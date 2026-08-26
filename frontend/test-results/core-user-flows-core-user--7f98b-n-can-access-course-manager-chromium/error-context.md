# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-user-flows.spec.ts >> core user flows - admin dashboard >> admin can access course manager
- Location: e2e/core-user-flows.spec.ts:162:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/courses|manage/i)
Expected: visible
Error: strict mode violation: getByText(/courses|manage/i) resolved to 10 elements:
    1) <p class="MuiTypography-root MuiTypography-body1 MuiTypography-noWrap css-238799">Content Manager</p> aka getByRole('link', { name: 'Content Manager' })
    2) <p class="MuiTypography-root MuiTypography-body1 MuiTypography-noWrap css-ah3b2n">Course Management</p> aka getByRole('link', { name: 'Course Management' })
    3) <p class="MuiTypography-root MuiTypography-body1 MuiTypography-noWrap css-238799">User Management</p> aka getByRole('link', { name: 'User Management' })
    4) <p class="MuiTypography-root MuiTypography-body2 css-1w9weqd">Courses</p> aka getByRole('paragraph').filter({ hasText: /^Courses$/ })
    5) <h4 class="MuiTypography-root MuiTypography-h4 css-19k6vgi">Course Management</h4> aka getByRole('heading', { name: 'Course Management' })
    6) <p class="MuiTypography-root MuiTypography-body1 css-1q07bx">Create, organize, and manage the course catalog f…</p> aka getByText('Create, organize, and manage')
    7) <h6 class="MuiTypography-root MuiTypography-h6 css-1bo5alx">Find courses</h6> aka getByRole('heading', { name: 'Find courses' })
    8) <h6 class="MuiTypography-root MuiTypography-h6 css-1bo5alx">Courses</h6> aka getByRole('heading', { name: 'Courses', exact: true })
    9) <p class="MuiTypography-root MuiTypography-body2 css-1md2fi2">0 courses in the catalog.</p> aka getByText('courses in the catalog.')
    10) <p class="MuiTypography-root MuiTypography-body2 css-duvdvf">Loading courses...</p> aka getByText('Loading courses...')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/courses|manage/i)

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
          - generic: "3"
      - link [ref=e15] [cursor=pointer]:
        - /url: /messages
        - img [ref=e16]
      - link "Add Course" [ref=e18] [cursor=pointer]:
        - /url: /courses/new
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
        - link "Dashboard" [ref=e128] [cursor=pointer]:
          - /url: /admin/dashboard
        - generic [ref=e129]:
          - paragraph [ref=e130]: /
          - paragraph [ref=e131]: Administration
        - generic [ref=e132]:
          - paragraph [ref=e133]: /
          - paragraph [ref=e134]: Courses
      - generic [ref=e135]:
        - generic [ref=e136]:
          - paragraph [ref=e137]: Administration
          - heading "Course Management" [level=4] [ref=e138]
          - paragraph [ref=e139]: Create, organize, and manage the course catalog from one workspace.
        - link "Create New Course" [ref=e140] [cursor=pointer]:
          - /url: /courses/new
      - generic [ref=e142]:
        - generic [ref=e144]:
          - heading "Find courses" [level=6] [ref=e145]
          - paragraph [ref=e146]: Search by title or course ID.
        - generic [ref=e148]:
          - img [ref=e150]
          - textbox "Search courses by title or ID..." [ref=e152]
          - group
      - generic [ref=e154]:
        - generic [ref=e156]:
          - heading "Courses" [level=6] [ref=e157]
          - paragraph [ref=e158]: 3 courses in the catalog.
        - table [ref=e160]:
          - rowgroup [ref=e161]:
            - row "Course Details Status Category Students Actions" [ref=e162]:
              - columnheader "Course Details" [ref=e163]
              - columnheader "Status" [ref=e164]
              - columnheader "Category" [ref=e165]
              - columnheader "Students" [ref=e166]
              - columnheader "Actions" [ref=e167]
          - rowgroup [ref=e168]:
            - 'row "React Foundations ID: course-react Draft Development 1240 Edit React Foundations Delete React Foundations" [ref=e169]':
              - 'cell "React Foundations ID: course-react" [ref=e170]':
                - generic [ref=e171]:
                  - img [ref=e173]
                  - generic [ref=e175]:
                    - heading "React Foundations" [level=6] [ref=e176]
                    - generic [ref=e177]: "ID: course-react"
              - cell "Draft" [ref=e178]:
                - generic [ref=e180]: Draft
              - cell "Development" [ref=e181]:
                - paragraph [ref=e182]: Development
              - cell "1240" [ref=e183]:
                - paragraph [ref=e184]: "1240"
              - cell "Edit React Foundations Delete React Foundations" [ref=e185]:
                - generic [ref=e186]:
                  - button "Edit React Foundations" [ref=e187] [cursor=pointer]:
                    - img [ref=e188]
                  - button "Delete React Foundations" [ref=e190] [cursor=pointer]:
                    - img [ref=e191]
            - 'row "UI Design Systems ID: course-design Draft Design 640 Edit UI Design Systems Delete UI Design Systems" [ref=e193]':
              - 'cell "UI Design Systems ID: course-design" [ref=e194]':
                - generic [ref=e195]:
                  - img [ref=e197]
                  - generic [ref=e199]:
                    - heading "UI Design Systems" [level=6] [ref=e200]
                    - generic [ref=e201]: "ID: course-design"
              - cell "Draft" [ref=e202]:
                - generic [ref=e204]: Draft
              - cell "Design" [ref=e205]:
                - paragraph [ref=e206]: Design
              - cell "640" [ref=e207]:
                - paragraph [ref=e208]: "640"
              - cell "Edit UI Design Systems Delete UI Design Systems" [ref=e209]:
                - generic [ref=e210]:
                  - button "Edit UI Design Systems" [ref=e211] [cursor=pointer]:
                    - img [ref=e212]
                  - button "Delete UI Design Systems" [ref=e214] [cursor=pointer]:
                    - img [ref=e215]
            - 'row "Growth Marketing Essentials ID: course-marketing Draft Marketing 320 Edit Growth Marketing Essentials Delete Growth Marketing Essentials" [ref=e217]':
              - 'cell "Growth Marketing Essentials ID: course-marketing" [ref=e218]':
                - generic [ref=e219]:
                  - img [ref=e221]
                  - generic [ref=e223]:
                    - heading "Growth Marketing Essentials" [level=6] [ref=e224]
                    - generic [ref=e225]: "ID: course-marketing"
              - cell "Draft" [ref=e226]:
                - generic [ref=e228]: Draft
              - cell "Marketing" [ref=e229]:
                - paragraph [ref=e230]: Marketing
              - cell "320" [ref=e231]:
                - paragraph [ref=e232]: "320"
              - cell "Edit Growth Marketing Essentials Delete Growth Marketing Essentials" [ref=e233]:
                - generic [ref=e234]:
                  - button "Edit Growth Marketing Essentials" [ref=e235] [cursor=pointer]:
                    - img [ref=e236]
                  - button "Delete Growth Marketing Essentials" [ref=e238] [cursor=pointer]:
                    - img [ref=e239]
```

# Test source

```ts
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
> 166 |     await expect(page.getByText(/courses|manage/i)).toBeVisible({ timeout: 5000 });
      |                                                     ^ Error: expect(locator).toBeVisible() failed
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
  253 |
  254 |   test('content manager can create new page', async ({ page, app }) => {
  255 |     await app.loginAs(page, 'content_manager');
  256 |     await page.goto('/cms/content');
  257 |
  258 |     const createButton = page.getByRole('button', { name: /create|add new|new page/i });
  259 |     await expect(createButton).toBeVisible({ timeout: 5000 });
  260 |   });
  261 |
  262 |   test('content manager can access media library', async ({ page, app }) => {
  263 |     await app.loginAs(page, 'content_manager');
  264 |     await page.goto('/cms/media');
  265 |
  266 |     await expect(page.getByText(/media|files|upload/i)).toBeVisible({ timeout: 5000 });
```