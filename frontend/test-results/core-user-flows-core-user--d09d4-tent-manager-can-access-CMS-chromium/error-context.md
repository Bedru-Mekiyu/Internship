# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-user-flows.spec.ts >> core user flows - content management >> content manager can access CMS
- Location: e2e/core-user-flows.spec.ts:247:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/pages|content|manage/i)
Expected: visible
Error: strict mode violation: getByText(/pages|content|manage/i) resolved to 7 elements:
    1) <p class="MuiTypography-root MuiTypography-body1 MuiTypography-noWrap css-ah3b2n">Content Manager</p> aka getByRole('link', { name: 'Content Manager' })
    2) <p class="MuiTypography-root MuiTypography-body1 MuiTypography-noWrap css-9ty7ay">Content Manager</p> aka getByText('Content Manager').nth(1)
    3) <p class="MuiTypography-root MuiTypography-body1 MuiTypography-noWrap css-11ujuki">content manager</p> aka getByText('content manager', { exact: true })
    4) <h4 class="MuiTypography-root MuiTypography-h4 css-19k6vgi">Content Manager</h4> aka getByRole('heading', { name: 'Content Manager' })
    5) <p class="MuiTypography-root MuiTypography-body1 css-1q07bx">Manage CMS pages and maintain structured learning…</p> aka getByText('Manage CMS pages and maintain')
    6) <span class="MuiTypography-root MuiTypography-caption MuiTypography-noWrap css-1swriz">/pages/welcome</span> aka getByText('/pages/welcome')
    7) <span class="MuiTypography-root MuiTypography-caption MuiTypography-noWrap css-1swriz">/pages/faq</span> aka getByText('/pages/faq')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/pages|content|manage/i)

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
  - main [ref=e80]:
    - generic [ref=e82]:
      - generic [ref=e83]:
        - generic [ref=e84]:
          - heading "Content Manager" [level=4] [ref=e85]
          - paragraph [ref=e86]: Manage CMS pages and maintain structured learning content across the platform.
        - button "New page" [ref=e87] [cursor=pointer]
      - generic [ref=e91]:
        - generic [ref=e93]:
          - img [ref=e95]
          - textbox "Search by title or slug..." [ref=e97]
          - group
        - tablist [ref=e100]:
          - tab "All" [selected] [ref=e101] [cursor=pointer]
          - tab "Published" [ref=e102] [cursor=pointer]
          - tab "Draft" [ref=e103] [cursor=pointer]
          - tab "Archived" [ref=e104] [cursor=pointer]
      - generic [ref=e106]:
        - generic [ref=e110]:
          - generic [ref=e111]:
            - generic [ref=e112]:
              - heading "Welcome Page" [level=6] [ref=e113]
              - generic [ref=e114]: /pages/welcome
            - button "More actions" [ref=e116] [cursor=pointer]:
              - img [ref=e117]
          - generic [ref=e119]:
            - generic [ref=e120]: PUBLISHED
            - button "Edit" [ref=e121] [cursor=pointer]
        - generic [ref=e125]:
          - generic [ref=e126]:
            - generic [ref=e127]:
              - heading "FAQ" [level=6] [ref=e128]
              - generic [ref=e129]: /pages/faq
            - button "More actions" [ref=e131] [cursor=pointer]:
              - img [ref=e132]
          - generic [ref=e134]:
            - generic [ref=e135]: DRAFT
            - button "Edit" [ref=e136] [cursor=pointer]
```

# Test source

```ts
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
> 251 |     await expect(page.getByText(/pages|content|manage/i)).toBeVisible({ timeout: 5000 });
      |                                                           ^ Error: expect(locator).toBeVisible() failed
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
  302 |   test('navigation menu shows correct links for admin', async ({ page, app }) => {
  303 |     await app.loginAs(page, 'admin');
  304 |
  305 |     await expect(page.getByRole('link', { name: /admin/i })).toBeVisible();
  306 |   });
  307 |
  308 |   test('breadcrumb navigation works', async ({ page, app }) => {
  309 |     await app.loginAs(page, 'student');
  310 |     await page.goto('/courses/explore');
  311 |
  312 |     const breadcrumbs = page.locator('[class*="breadcrumb"], [aria-label="breadcrumb"]');
  313 |     if (await breadcrumbs.isVisible()) {
  314 |       await breadcrumbs.getByText('Home').click();
  315 |       await expect(page).toHaveURL(/\/|home/);
  316 |     }
  317 |   });
  318 |
  319 |   test('search functionality works', async ({ page, app }) => {
  320 |     await app.loginAs(page, 'student');
  321 |
  322 |     const searchInput = page.getByPlaceholder(/search/i).first();
  323 |     if (await searchInput.isVisible()) {
  324 |       await searchInput.fill('react');
  325 |       await searchInput.press('Enter');
  326 |       await page.waitForTimeout(1000);
  327 |     }
  328 |   });
  329 | });
```