# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-user-flows.spec.ts >> core user flows - profile and settings >> user can access notification settings
- Location: e2e/core-user-flows.spec.ts:197:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/notification|email|preferences/i)
Expected: visible
Error: strict mode violation: getByText(/notification|email|preferences/i) resolved to 25 elements:
    1) <p class="MuiTypography-root MuiTypography-body1 MuiTypography-noWrap css-ah3b2n">Preferences</p> aka getByRole('link', { name: 'Preferences' })
    2) <p class="MuiTypography-root MuiTypography-body2 css-1w9weqd">Notifications</p> aka getByText('Notifications', { exact: true })
    3) <h4 class="MuiTypography-root MuiTypography-h4 css-19k6vgi">Notification Preferences</h4> aka getByRole('heading', { name: 'Notification Preferences' })
    4) <p class="MuiTypography-root MuiTypography-body1 css-1q07bx">Manage how and when you receive notifications</p> aka getByText('Manage how and when you')
    5) <h6 class="MuiTypography-root MuiTypography-h6 css-1bo5alx">Email & Notification Channels</h6> aka getByRole('heading', { name: 'Email & Notification Channels' })
    6) <h6 class="MuiTypography-root MuiTypography-subtitle1 css-15t2fhz">Notification Categories</h6> aka getByRole('heading', { name: 'Notification Categories' })
    7) <p class="MuiTypography-root MuiTypography-body2 css-1w9weqd">10 notifications enabled</p> aka getByText('notifications enabled')
    8) <p class="MuiTypography-root MuiTypography-body2 css-1w9weqd">Notifications about new lessons, content updates,…</p> aka getByText('Notifications about new')
    9) <span class="MuiTypography-root MuiTypography-caption css-ia3sg0">Email</span> aka getByText('Email').nth(1)
    10) <p class="MuiTypography-root MuiTypography-body2 css-ujnngh">Detailed settings for course updates notification…</p> aka getByText('Detailed settings for course')
    ...

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/notification|email|preferences/i)

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
  - generic [ref=e19]:
    - generic [ref=e21]:
      - img [ref=e23]
      - paragraph [ref=e25]: LearnSpace
    - generic [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e28]: MAIN MENU
        - list [ref=e29]:
          - link "Dashboard" [ref=e30] [cursor=pointer]:
            - /url: /dashboard
            - img [ref=e32]
            - paragraph [ref=e35]: Dashboard
          - link "My Courses" [ref=e36] [cursor=pointer]:
            - /url: /courses
            - img [ref=e38]
            - paragraph [ref=e41]: My Courses
          - link "Schedule" [ref=e42] [cursor=pointer]:
            - /url: /activity
            - img [ref=e44]
            - paragraph [ref=e47]: Schedule
          - link "Messages 3" [ref=e48] [cursor=pointer]:
            - /url: /messages
            - img [ref=e50]
            - paragraph [ref=e53]: Messages
            - generic [ref=e54]: "3"
          - link "Achievements" [ref=e55] [cursor=pointer]:
            - /url: /certificates
            - img [ref=e57]
            - paragraph [ref=e60]: Achievements
      - generic [ref=e61]:
        - generic [ref=e62]: SETTINGS
        - list [ref=e63]:
          - link "Profile" [ref=e64] [cursor=pointer]:
            - /url: /profile-settings
            - img [ref=e66]
            - paragraph [ref=e69]: Profile
          - link "Preferences" [ref=e70] [cursor=pointer]:
            - /url: /settings/notifications
            - img [ref=e72]
            - paragraph [ref=e75]: Preferences
          - link "Help Center" [ref=e76] [cursor=pointer]:
            - /url: /help
            - img [ref=e78]
            - paragraph [ref=e81]: Help Center
    - generic [ref=e83]:
      - generic [ref=e84]: ST
      - generic [ref=e85]:
        - paragraph [ref=e86]: Student Tester
        - paragraph [ref=e87]: student
      - button "Log out" [ref=e88] [cursor=pointer]:
        - img [ref=e89]
  - main [ref=e91]:
    - generic [ref=e92]:
      - generic [ref=e93]:
        - link "Dashboard" [ref=e95] [cursor=pointer]:
          - /url: /dashboard
        - generic [ref=e96]:
          - paragraph [ref=e97]: /
          - link "Settings" [ref=e98] [cursor=pointer]:
            - /url: /profile-settings
        - generic [ref=e99]:
          - paragraph [ref=e100]: /
          - paragraph [ref=e101]: Notifications
      - generic [ref=e103]:
        - heading "Notification Preferences" [level=4] [ref=e104]
        - paragraph [ref=e105]: Manage how and when you receive notifications
      - generic [ref=e106]:
        - generic [ref=e109]:
          - img [ref=e111]
          - generic [ref=e113]:
            - heading "Email & Notification Channels" [level=6] [ref=e114]
            - paragraph [ref=e115]: Choose how you want to be notified for each category
        - generic [ref=e116]:
          - generic [ref=e118]:
            - generic [ref=e119]:
              - heading "Notification Categories" [level=6] [ref=e120]
              - paragraph [ref=e121]: 10 notifications enabled
            - generic [ref=e123]:
              - button "Reset to Default" [ref=e124] [cursor=pointer]
              - button "Save Changes" [ref=e125] [cursor=pointer]
          - generic [ref=e126]:
            - generic [ref=e128] [cursor=pointer]:
              - generic [ref=e129]:
                - img [ref=e131]
                - generic [ref=e133]:
                  - heading "Course Updates" [level=6] [ref=e134]
                  - paragraph [ref=e135]: Notifications about new lessons, content updates, and course announcements
              - generic [ref=e136]:
                - generic [ref=e137]:
                  - generic [ref=e138]: In-App
                  - switch [checked] [ref=e141]
                - generic [ref=e144]:
                  - generic [ref=e145]: Email
                  - switch [checked] [ref=e148]
                - img [ref=e151]
            - generic [ref=e154] [cursor=pointer]:
              - generic [ref=e155]:
                - img [ref=e157]
                - generic [ref=e159]:
                  - heading "Enrollment & Progress" [level=6] [ref=e160]
                  - paragraph [ref=e161]: Course enrollment confirmations, progress milestones, and completions
              - generic [ref=e162]:
                - generic [ref=e163]:
                  - generic [ref=e164]: In-App
                  - switch [checked] [ref=e167]
                - generic [ref=e170]:
                  - generic [ref=e171]: Email
                  - switch [checked] [ref=e174]
                - img [ref=e177]
            - generic [ref=e180] [cursor=pointer]:
              - generic [ref=e181]:
                - img [ref=e183]
                - generic [ref=e185]:
                  - heading "Announcements" [level=6] [ref=e186]
                  - paragraph [ref=e187]: Platform announcements, feature updates, and system notifications
              - generic [ref=e188]:
                - generic [ref=e189]:
                  - generic [ref=e190]: In-App
                  - switch [checked] [ref=e193]
                - generic [ref=e196]:
                  - generic [ref=e197]: Email
                  - switch [ref=e200]
                - img [ref=e203]
            - generic [ref=e206] [cursor=pointer]:
              - generic [ref=e207]:
                - img [ref=e209]
                - generic [ref=e211]:
                  - heading "Schedule & Reminders" [level=6] [ref=e212]
                  - paragraph [ref=e213]: Upcoming live sessions, assignment deadlines, and learning reminders
              - generic [ref=e214]:
                - generic [ref=e215]:
                  - generic [ref=e216]: In-App
                  - switch [checked] [ref=e219]
                - generic [ref=e222]:
                  - generic [ref=e223]: Email
                  - switch [checked] [ref=e226]
                - img [ref=e229]
            - generic [ref=e232] [cursor=pointer]:
              - generic [ref=e233]:
                - img [ref=e235]
                - generic [ref=e237]:
                  - heading "Payments & Billing" [level=6] [ref=e238]
                  - paragraph [ref=e239]: Payment confirmations, invoice receipts, and billing updates
              - generic [ref=e240]:
                - generic [ref=e241]:
                  - generic [ref=e242]: In-App
                  - switch [checked] [ref=e245]
                - generic [ref=e248]:
                  - generic [ref=e249]: Email
                  - switch [checked] [ref=e252]
                - img [ref=e255]
            - generic [ref=e258] [cursor=pointer]:
              - generic [ref=e259]:
                - img [ref=e261]
                - generic [ref=e263]:
                  - heading "Marketing & Promotions" [level=6] [ref=e264]
                  - paragraph [ref=e265]: Special offers, new course recommendations, and promotional content
              - generic [ref=e266]:
                - generic [ref=e267]:
                  - generic [ref=e268]: In-App
                  - switch [ref=e271]
                - generic [ref=e274]:
                  - generic [ref=e275]: Email
                  - switch [checked] [ref=e278]
                - img [ref=e281]
        - generic [ref=e284]:
          - heading "Important Notes" [level=6] [ref=e285]
          - generic [ref=e286]:
            - paragraph [ref=e287]: • Some critical notifications (like security alerts) cannot be disabled
            - paragraph [ref=e288]: • Email notifications may include a daily or weekly digest option
            - paragraph [ref=e289]: • Push notifications require browser permissions to be enabled
```

# Test source

```ts
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
> 201 |     await expect(page.getByText(/notification|email|preferences/i)).toBeVisible({ timeout: 5000 });
      |                                                                     ^ Error: expect(locator).toBeVisible() failed
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
  267 |   });
  268 | });
  269 |
  270 | test.describe('core user flows - discussions', () => {
  271 |   test('student can view discussions', async ({ page, app }) => {
  272 |     await app.loginAs(page, 'student');
  273 |     await page.goto('/courses/discussions');
  274 |
  275 |     await expect(page.getByText(/discussion|threads/i)).toBeVisible({ timeout: 5000 });
  276 |   });
  277 |
  278 |   test('instructor can view course discussions', async ({ page, app }) => {
  279 |     await app.loginAs(page, 'instructor');
  280 |     await page.goto('/courses/discussions');
  281 |
  282 |     await expect(page.getByText(/discussion|threads/i)).toBeVisible({ timeout: 5000 });
  283 |   });
  284 | });
  285 |
  286 | test.describe('core user flows - navigation', () => {
  287 |   test('navigation menu shows correct links for student', async ({ page, app }) => {
  288 |     await app.loginAs(page, 'student');
  289 |
  290 |     await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
  291 |     await expect(page.getByRole('link', { name: /courses/i })).toBeVisible();
  292 |     await expect(page.getByRole('link', { name: /my courses/i })).toBeVisible();
  293 |   });
  294 |
  295 |   test('navigation menu shows correct links for instructor', async ({ page, app }) => {
  296 |     await app.loginAs(page, 'instructor');
  297 |
  298 |     await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
  299 |     await expect(page.getByRole('link', { name: /instructor/i })).toBeVisible();
  300 |   });
  301 |
```