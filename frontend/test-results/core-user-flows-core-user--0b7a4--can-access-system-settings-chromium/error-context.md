# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-user-flows.spec.ts >> core user flows - admin dashboard >> admin can access system settings
- Location: e2e/core-user-flows.spec.ts:169:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/settings|configuration/i)
Expected: visible
Error: strict mode violation: getByText(/settings|configuration/i) resolved to 7 elements:
    1) <p class="MuiTypography-root MuiTypography-body1 MuiTypography-noWrap css-ah3b2n">System Settings</p> aka getByRole('link', { name: 'System Settings' })
    2) <span class="MuiTypography-root MuiTypography-caption css-1p5hcyq">SETTINGS</span> aka getByText('SETTINGS', { exact: true })
    3) <h4 class="MuiTypography-root MuiTypography-h4 css-14babcw">System Settings</h4> aka getByRole('heading', { name: 'System Settings' })
    4) <p class="MuiTypography-root MuiTypography-body2 css-m4h9ys">Manage your platform's global configuration and p…</p> aka getByText('Manage your platform\'s global')
    5) <h6 class="MuiTypography-root MuiTypography-subtitle1 css-fdjcea">Payment Configuration</h6> aka getByRole('heading', { name: 'Payment Configuration' })
    6) <p class="MuiTypography-root MuiTypography-body2 css-b2is6">Configure payment gateways and currency settings.</p> aka getByText('Configure payment gateways')
    7) <h6 class="MuiTypography-root MuiTypography-subtitle1 css-fdjcea">Email Settings</h6> aka getByRole('heading', { name: 'Email Settings' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/settings|configuration/i)

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
          - link "Admin Dashboard" [ref=e30] [cursor=pointer]:
            - /url: /admin/dashboard
            - img [ref=e32]
            - paragraph [ref=e35]: Admin Dashboard
          - link "Analytics" [ref=e36] [cursor=pointer]:
            - /url: /admin/analytics
            - img [ref=e38]
            - paragraph [ref=e42]: Analytics
      - generic [ref=e43]:
        - generic [ref=e44]: CONTENT
        - list [ref=e45]:
          - link "Content Manager" [ref=e46] [cursor=pointer]:
            - /url: /cms/content
            - img [ref=e48]
            - paragraph [ref=e51]: Content Manager
          - link "Page Builder" [ref=e52] [cursor=pointer]:
            - /url: /cms/pages
            - img [ref=e54]
            - paragraph [ref=e57]: Page Builder
          - link "Media Library" [ref=e58] [cursor=pointer]:
            - /url: /cms/media
            - img [ref=e60]
            - paragraph [ref=e63]: Media Library
      - generic [ref=e64]:
        - generic [ref=e65]: ADMINISTRATION
        - list [ref=e66]:
          - link "Course Management" [ref=e67] [cursor=pointer]:
            - /url: /admin/courses
            - img [ref=e69]
            - paragraph [ref=e72]: Course Management
          - link "Contact Messages" [ref=e73] [cursor=pointer]:
            - /url: /admin/contacts
            - img [ref=e75]
            - paragraph [ref=e78]: Contact Messages
          - link "User Management" [ref=e79] [cursor=pointer]:
            - /url: /admin/users
            - img [ref=e81]
            - paragraph [ref=e84]: User Management
          - link "System Settings" [ref=e85] [cursor=pointer]:
            - /url: /admin/settings
            - img [ref=e87]
            - paragraph [ref=e90]: System Settings
          - link "Notifications" [ref=e91] [cursor=pointer]:
            - /url: /notifications
            - img [ref=e93]
            - paragraph [ref=e96]: Notifications
          - link "Messages 3" [ref=e97] [cursor=pointer]:
            - /url: /messages
            - img [ref=e99]
            - paragraph [ref=e102]: Messages
            - generic [ref=e103]: "3"
      - generic [ref=e104]:
        - generic [ref=e105]: SETTINGS
        - list [ref=e106]:
          - link "Profile" [ref=e107] [cursor=pointer]:
            - /url: /profile-settings
            - img [ref=e109]
            - paragraph [ref=e112]: Profile
    - generic [ref=e114]:
      - generic [ref=e115]: AT
      - generic [ref=e116]:
        - paragraph [ref=e117]: Admin Tester
        - paragraph [ref=e118]: admin
      - button "Log out" [ref=e119] [cursor=pointer]:
        - img [ref=e120]
  - main [ref=e122]:
    - generic [ref=e123]:
      - generic [ref=e124]:
        - heading "System Settings" [level=4] [ref=e125]
        - paragraph [ref=e126]: Manage your platform's global configuration and preferences.
      - generic [ref=e127]:
        - generic [ref=e129]:
          - generic [ref=e131]:
            - heading "Platform Branding" [level=6] [ref=e132]
            - paragraph [ref=e133]: Customize the look and feel of your admin panel.
          - generic [ref=e135]:
            - generic [ref=e136]:
              - text: Platform Logo
              - generic [ref=e137]:
                - img [ref=e139]
                - generic [ref=e141]:
                  - generic [ref=e142]:
                    - button "Change Logo" [ref=e143] [cursor=pointer]:
                      - img [ref=e145]
                      - text: Change Logo
                    - button "Remove" [disabled]:
                      - generic:
                        - img
                      - text: Remove
                  - generic [ref=e147]: "Recommended size: 512x512px. JPG, PNG or SVG."
            - generic [ref=e148]:
              - generic [ref=e149]: Platform Name
              - generic [ref=e151]:
                - textbox [ref=e152]: LearnSpace
                - group
            - generic [ref=e153]:
              - generic [ref=e154]: Support Email
              - generic [ref=e155]:
                - generic [ref=e156]:
                  - textbox [ref=e157]: hello@learnspace.com
                  - group
                - paragraph [ref=e158]
        - generic [ref=e160]:
          - generic [ref=e162]:
            - heading "Contact & Support" [level=6] [ref=e163]
            - paragraph [ref=e164]: Control the public contact details shown on the marketing contact page.
          - generic [ref=e166]:
            - generic [ref=e167]:
              - generic [ref=e169]:
                - generic [ref=e170]: Contact Phone
                - generic [ref=e172]:
                  - textbox [ref=e173]: +1 (555) 000-0000
                  - group
              - generic [ref=e175]:
                - generic [ref=e176]: Response Time
                - generic [ref=e178]:
                  - textbox [ref=e179]: Within 24 hours
                  - group
            - generic [ref=e180]:
              - generic [ref=e181]: Office Address
              - generic [ref=e183]:
                - textbox [ref=e184]: 100 Smith Street, Collingwood VIC 3066
                - group
            - generic [ref=e185]:
              - generic [ref=e187]:
                - generic [ref=e188]: Office Hours
                - generic [ref=e190]:
                  - textbox [ref=e191]: Mon-Fri from 8am to 5pm EST.
                  - group
              - generic [ref=e193]:
                - generic [ref=e194]: Map Embed URL
                - generic [ref=e195]:
                  - generic [ref=e196]:
                    - textbox [ref=e197]: https://www.google.com/maps?q=100+Smith+Street,+Collingwood+VIC+3066&output=embed
                    - group
                  - paragraph [ref=e198]
        - generic [ref=e200]:
          - generic [ref=e202]:
            - heading "Appearance" [level=6] [ref=e203]
            - paragraph [ref=e204]: Choose the default theme for your users.
          - generic [ref=e206]:
            - generic [ref=e207]: Interface Theme
            - generic [ref=e208]:
              - button "Light" [pressed] [ref=e209] [cursor=pointer]:
                - generic [ref=e212]: Light
              - button "Dark" [ref=e213] [cursor=pointer]:
                - generic [ref=e216]: Dark
              - button "System" [ref=e217] [cursor=pointer]:
                - generic [ref=e221]: System
        - generic [ref=e223]:
          - generic [ref=e225]:
            - heading "Payment Configuration" [level=6] [ref=e226]
            - paragraph [ref=e227]: Configure payment gateways and currency settings.
          - generic [ref=e229]:
            - generic [ref=e230]:
              - generic [ref=e231]:
                - generic [ref=e232]: Active Provider
                - button "Connect Now" [ref=e233] [cursor=pointer]
              - generic [ref=e235]:
                - combobox [ref=e236] [cursor=pointer]: Stripe
                - textbox: Stripe
                - img
                - group
            - generic [ref=e237]:
              - generic [ref=e239]:
                - generic [ref=e240]: Currency
                - generic [ref=e242]:
                  - combobox [ref=e243] [cursor=pointer]: USD ($)
                  - textbox: USD
                  - img
                  - group
              - generic [ref=e245]:
                - generic [ref=e246]: Tax Rate (%)
                - generic [ref=e248]:
                  - textbox [ref=e249]: "0.00"
                  - group
            - generic [ref=e250]:
              - generic [ref=e251]: Stripe Public Key
              - generic [ref=e253]:
                - textbox "pk_test_..." [ref=e254]
                - group
            - generic [ref=e255]:
              - generic [ref=e256]: Stripe Secret Key
              - generic [ref=e258]:
                - textbox "sk_test_..." [ref=e259]
                - group
        - generic [ref=e261]:
          - generic [ref=e262]:
            - generic [ref=e263]:
              - heading "Email Settings" [level=6] [ref=e264]
              - paragraph [ref=e265]: Configure SMTP for system emails.
            - switch [checked] [ref=e268] [cursor=pointer]
          - generic [ref=e272]:
            - generic [ref=e273]:
              - generic [ref=e275]:
                - generic [ref=e276]: SMTP Host
                - generic [ref=e278]:
                  - textbox [ref=e279]: smtp.mailtrap.io
                  - group
              - generic [ref=e281]:
                - generic [ref=e282]: Port
                - generic [ref=e284]:
                  - textbox [ref=e285]: "587"
                  - group
            - generic [ref=e286]:
              - generic [ref=e287]: Username
              - generic [ref=e289]:
                - textbox [ref=e290]
                - group
            - generic [ref=e291]:
              - generic [ref=e292]: Password
              - generic [ref=e294]:
                - textbox "************" [ref=e295]
                - group
            - button "Send Test Email" [ref=e297] [cursor=pointer]:
              - img [ref=e299]
              - text: Send Test Email
```

# Test source

```ts
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
  166 |     await expect(page.getByText(/courses|manage/i)).toBeVisible({ timeout: 5000 });
  167 |   });
  168 |
  169 |   test('admin can access system settings', async ({ page, app }) => {
  170 |     await app.loginAs(page, 'admin');
  171 |     await page.goto('/admin/settings');
  172 |
> 173 |     await expect(page.getByText(/settings|configuration/i)).toBeVisible({ timeout: 5000 });
      |                                                             ^ Error: expect(locator).toBeVisible() failed
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
  267 |   });
  268 | });
  269 |
  270 | test.describe('core user flows - discussions', () => {
  271 |   test('student can view discussions', async ({ page, app }) => {
  272 |     await app.loginAs(page, 'student');
  273 |     await page.goto('/courses/discussions');
```