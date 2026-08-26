# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-user-flows.spec.ts >> core user flows - content management >> content manager can access media library
- Location: e2e/core-user-flows.spec.ts:262:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/media|files|upload/i)
Expected: visible
Error: strict mode violation: getByText(/media|files|upload/i) resolved to 8 elements:
    1) <p class="MuiTypography-root MuiTypography-body1 MuiTypography-noWrap css-ah3b2n">Media Library</p> aka getByRole('link', { name: 'Media Library' })
    2) <p class="MuiTypography-root MuiTypography-body2 css-1w9weqd">Media Library</p> aka getByRole('main').getByRole('paragraph').filter({ hasText: 'Media Library' })
    3) <h4 class="MuiTypography-root MuiTypography-h4 css-19k6vgi">Media Library</h4> aka getByRole('heading', { name: 'Media Library' })
    4) <p class="MuiTypography-root MuiTypography-body1 css-1q07bx">Manage and organize your media files. Upload imag…</p> aka getByText('Manage and organize your')
    5) <p class="MuiTypography-root MuiTypography-body1 css-m3u2lk">Loading media files...</p> aka getByText('Loading media files...')
    6) <button role="tab" tabindex="0" type="button" aria-selected="true" class="MuiButtonBase-root MuiTab-root MuiTab-textColorPrimary Mui-selected css-1eoz397">All Files</button> aka getByRole('tab', { name: 'All Files' })
    7) <button tabindex="0" type="button" class="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-sizeMedium MuiButton-colorPrimary MuiButton-disableElevation MuiButton-root MuiButton-contained MuiButton-sizeMedium MuiButton-colorPrimary MuiButton-disableElevation css-1i464y2">Upload Media</button> aka getByRole('button', { name: 'Upload Media' })
    8) <h6 class="MuiTypography-root MuiTypography-h6 css-1bo5alx">No files found</h6> aka getByRole('heading', { name: 'No files found' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/media|files|upload/i)

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
          - link "Content Manager" [ref=e30] [cursor=pointer]:
            - /url: /cms/content
            - img [ref=e32]
            - paragraph [ref=e35]: Content Manager
          - link "Page Builder" [ref=e36] [cursor=pointer]:
            - /url: /cms/pages
            - img [ref=e38]
            - paragraph [ref=e41]: Page Builder
          - link "Media Library" [ref=e42] [cursor=pointer]:
            - /url: /cms/media
            - img [ref=e44]
            - paragraph [ref=e47]: Media Library
      - generic [ref=e48]:
        - generic [ref=e49]: SETTINGS
        - list [ref=e50]:
          - link "Notifications" [ref=e51] [cursor=pointer]:
            - /url: /notifications
            - img [ref=e53]
            - paragraph [ref=e56]: Notifications
          - link "Messages 3" [ref=e57] [cursor=pointer]:
            - /url: /messages
            - img [ref=e59]
            - paragraph [ref=e62]: Messages
            - generic [ref=e63]: "3"
          - link "Profile" [ref=e64] [cursor=pointer]:
            - /url: /profile-settings
            - img [ref=e66]
            - paragraph [ref=e69]: Profile
    - generic [ref=e71]:
      - generic [ref=e72]: CM
      - generic [ref=e73]:
        - paragraph [ref=e74]: Content Manager
        - paragraph [ref=e75]: content manager
      - button "Log out" [ref=e76] [cursor=pointer]:
        - img [ref=e77]
  - main [ref=e79]:
    - generic [ref=e80]:
      - generic [ref=e81]:
        - link "Dashboard" [ref=e83] [cursor=pointer]:
          - /url: /admin/dashboard
        - generic [ref=e84]:
          - paragraph [ref=e85]: /
          - link "Content Manager" [ref=e86] [cursor=pointer]:
            - /url: /cms/content
        - generic [ref=e87]:
          - paragraph [ref=e88]: /
          - paragraph [ref=e89]: Media Library
      - generic [ref=e91]:
        - heading "Media Library" [level=4] [ref=e92]
        - paragraph [ref=e93]: Manage and organize your media files. Upload images, videos, and documents.
      - generic [ref=e94]:
        - generic [ref=e97]:
          - paragraph [ref=e98]: Loading media files...
          - tablist [ref=e101]:
            - tab "All Files" [selected] [ref=e102] [cursor=pointer]
            - tab "Images" [ref=e103] [cursor=pointer]
            - tab "Videos" [ref=e104] [cursor=pointer]
            - tab "Documents" [ref=e105] [cursor=pointer]
          - generic [ref=e107]:
            - generic [ref=e110]:
              - img [ref=e112]
              - textbox "Search files..." [ref=e114]
              - group
            - generic [ref=e116]:
              - paragraph [ref=e117]: "Sort: Newest"
              - generic [ref=e118]:
                - button [ref=e119] [cursor=pointer]:
                  - img [ref=e120]
                - button [ref=e122] [cursor=pointer]:
                  - img [ref=e123]
              - button "Upload Media" [ref=e125] [cursor=pointer]
        - generic [ref=e127]:
          - heading "No files found" [level=6] [ref=e128]
          - paragraph [ref=e129]: Try a different search term or switch to another tab.
```

# Test source

```ts
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
> 266 |     await expect(page.getByText(/media|files|upload/i)).toBeVisible({ timeout: 5000 });
      |                                                         ^ Error: expect(locator).toBeVisible() failed
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