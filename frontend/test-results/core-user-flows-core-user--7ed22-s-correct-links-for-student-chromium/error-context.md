# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-user-flows.spec.ts >> core user flows - navigation >> navigation menu shows correct links for student
- Location: e2e/core-user-flows.spec.ts:287:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: /courses/i })
Expected: visible
Error: strict mode violation: getByRole('link', { name: /courses/i }) resolved to 2 elements:
    1) <a tabindex="0" href="/courses" data-discover="true" class="MuiButtonBase-root MuiListItemButton-root MuiListItemButton-gutters MuiListItemButton-root MuiListItemButton-gutters css-15qmyax">…</a> aka getByRole('link', { name: 'My Courses' })
    2) <a tabindex="0" data-discover="true" href="/courses/browse" aria-label="See all recommended courses" class="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-sizeMedium MuiButton-colorPrimary MuiButton-disableElevation MuiButton-root MuiButton-text MuiButton-sizeMedium MuiButton-colorPrimary MuiButton-disableElevation css-urjtdx">See all</a> aka getByRole('link', { name: 'See all recommended courses' })

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('link', { name: /courses/i })

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
    - main [ref=e92]:
      - generic [ref=e93]:
        - generic [ref=e95]:
          - heading "Welcome back, Student!" [level=4] [ref=e96]
          - paragraph [ref=e97]: Continue your learning journey, pick up where you left off, and track your progress.
        - generic [ref=e98]:
          - generic [ref=e99]:
            - generic [ref=e104]:
              - paragraph [ref=e105]: Enrolled courses
              - heading "3" [level=4] [ref=e106]
              - paragraph [ref=e107]: Total active enrollments
            - generic [ref=e112]:
              - paragraph [ref=e113]: Average progress
              - heading "64%" [level=4] [ref=e114]
              - paragraph [ref=e115]: Mean across enrollments
            - generic [ref=e120]:
              - paragraph [ref=e121]: Courses completed
              - heading "1" [level=4] [ref=e122]
              - paragraph [ref=e123]: Completed at 100%
            - generic [ref=e128]:
              - paragraph [ref=e129]: Certificates earned
              - heading "1" [level=4] [ref=e130]
              - paragraph [ref=e131]: Issued credentials
          - generic [ref=e132]:
            - generic [ref=e135]:
              - generic [ref=e137]:
                - heading "Continue Learning" [level=6] [ref=e138]
                - paragraph [ref=e139]: Active courses you can resume right now.
              - generic [ref=e140]:
                - generic [ref=e143]:
                  - generic [ref=e144]:
                    - heading "React Foundations" [level=6] [ref=e145]
                    - paragraph [ref=e146]: Instructor Tester
                  - application [ref=e150]
                  - generic [ref=e155]:
                    - generic [ref=e156]:
                      - paragraph [ref=e157]: 28% remaining
                      - paragraph [ref=e158]: 72%
                    - 'progressbar "React Foundations: 72% complete" [ref=e159]'
                    - link "Resume React Foundations" [ref=e161] [cursor=pointer]:
                      - /url: /courses/course-react/learn
                      - text: Resume Course
                - generic [ref=e164]:
                  - generic [ref=e165]:
                    - heading "UI Design Systems" [level=6] [ref=e166]
                    - paragraph [ref=e167]: Instructor Tester
                  - application [ref=e171]
                  - generic [ref=e176]:
                    - generic [ref=e177]:
                      - paragraph [ref=e178]: 58% remaining
                      - paragraph [ref=e179]: 42%
                    - 'progressbar "UI Design Systems: 42% complete" [ref=e180]'
                    - link "Resume UI Design Systems" [ref=e182] [cursor=pointer]:
                      - /url: /courses/course-design/learn
                      - text: Resume Course
            - generic [ref=e185]:
              - generic [ref=e186]:
                - heading "Recent Activity" [level=6] [ref=e187]
                - paragraph [ref=e188]: Your latest learning events.
              - generic [ref=e191]:
                - paragraph [ref=e192]: "Completed lesson: Components"
                - generic [ref=e193]: Completion · Today
          - generic [ref=e195]:
            - generic [ref=e196]:
              - generic [ref=e197]:
                - heading "Recommended Courses" [level=6] [ref=e198]
                - paragraph [ref=e199]: Fresh picks based on your activity and goals.
              - link "See all recommended courses" [ref=e200] [cursor=pointer]:
                - /url: /courses/browse
                - text: See all
            - generic [ref=e204]:
              - heading "Growth Marketing Essentials" [level=6] [ref=e205]
              - paragraph [ref=e206]: Advanced • 8h
              - link "Enroll in Growth Marketing Essentials" [ref=e207] [cursor=pointer]:
                - /url: /courses/browse
                - text: Enroll Now
          - generic [ref=e208]:
            - generic [ref=e211]:
              - generic [ref=e212]:
                - heading "Achievements & Badges" [level=6] [ref=e213]
                - paragraph [ref=e214]: Earned milestones from your learning journey.
              - generic [ref=e218]:
                - heading "Fast Starter" [level=6] [ref=e219]
                - paragraph [ref=e220]: Completed first module
            - generic [ref=e223]:
              - generic [ref=e224]:
                - heading "Momentum" [level=6] [ref=e225]
                - paragraph [ref=e226]: Your weekly learning activity.
              - application [ref=e230]:
                - generic [ref=e232]:
                  - generic [ref=e234]: Mon
                  - generic [ref=e236]: Tue
                  - generic [ref=e238]: Wed
              - generic [ref=e239]:
                - generic [ref=e240]:
                  - paragraph [ref=e241]: Streak
                  - paragraph [ref=e242]: —
                - generic [ref=e243]:
                  - paragraph [ref=e244]: Avg. completion
                  - paragraph [ref=e245]: 64%
  - generic [ref=e246]: Mon
```

# Test source

```ts
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
> 291 |     await expect(page.getByRole('link', { name: /courses/i })).toBeVisible();
      |                                                                ^ Error: expect(locator).toBeVisible() failed
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