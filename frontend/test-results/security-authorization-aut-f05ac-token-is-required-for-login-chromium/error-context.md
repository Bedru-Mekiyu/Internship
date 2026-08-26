# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-authorization.spec.ts >> authentication security >> csrf token is required for login
- Location: e2e/security-authorization.spec.ts:42:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/security error|csrf/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/security error|csrf/i)

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
                - generic [ref=e245]:
                  - generic [ref=e247]: Mon
                  - generic [ref=e249]: Tue
                  - generic [ref=e251]: Wed
              - generic [ref=e252]:
                - generic [ref=e253]:
                  - paragraph [ref=e254]: Streak
                  - paragraph [ref=e255]: —
                - generic [ref=e256]:
                  - paragraph [ref=e257]: Avg. completion
                  - paragraph [ref=e258]: 64%
  - generic [ref=e259]: Mon
```

# Test source

```ts
  1   | import { test, expect } from './support/fixtures';
  2   | import {
  3   |   assertProtectedRouteRedirects,
  4   |   expectToBeOnUrl,
  5   | } from './support/factories';
  6   |
  7   | test.describe('authentication security', () => {
  8   |   test('login with invalid credentials shows error without leaking info', async ({ page }) => {
  9   |     await page.goto('/auth/login');
  10  |
  11  |     await page.getByRole('textbox', { name: 'Email' }).fill('nonexistent@test.com');
  12  |     await page.locator('#password').fill('WrongPassword123!');
  13  |     await page.getByRole('button', { name: 'Sign in' }).click();
  14  |
  15  |     await expect(page.getByText('Invalid credentials')).toBeVisible();
  16  |     await expectToBeOnUrl(page, /\/auth\/login/);
  17  |   });
  18  |
  19  |   test('login with correct email but wrong password shows error', async ({ page }) => {
  20  |     await page.goto('/auth/login');
  21  |
  22  |     await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
  23  |     await page.locator('#password').fill('WrongPassword123!');
  24  |     await page.getByRole('button', { name: 'Sign in' }).click();
  25  |
  26  |     await expect(page.getByText('Invalid credentials')).toBeVisible();
  27  |   });
  28  |
  29  |   test('login rate limiting - multiple failed attempts', async ({ page }) => {
  30  |     await page.goto('/auth/login');
  31  |
  32  |     for (let i = 0; i < 3; i++) {
  33  |       await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
  34  |       await page.locator('#password').fill('WrongPassword123!');
  35  |       await page.getByRole('button', { name: 'Sign in' }).click();
  36  |       await page.waitForTimeout(200);
  37  |     }
  38  |
  39  |     await expect(page.getByText(/too many|rate limit|please try again/i)).toBeVisible();
  40  |   });
  41  |
  42  |   test('csrf token is required for login', async ({ page, app }) => {
  43  |     app.setSessionActive(false);
  44  |
  45  |     await page.goto('/auth/login');
  46  |     await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
  47  |     await page.locator('#password').fill('Passw0rd!');
  48  |
  49  |     await page.evaluate(() => {
  50  |       const tokenInput = document.querySelector('input[name="csrf"]') as HTMLInputElement;
  51  |       if (tokenInput) tokenInput.value = '';
  52  |     });
  53  |
  54  |     await page.getByRole('button', { name: 'Sign in' }).click();
> 55  |     await expect(page.getByText(/security error|csrf/i)).toBeVisible({ timeout: 5000 });
      |                                                          ^ Error: expect(locator).toBeVisible() failed
  56  |   });
  57  |
  58  |   test('session persists across page refreshes', async ({ page, app }) => {
  59  |     await app.loginAs(page, 'student');
  60  |     await expect(page).toHaveURL(/\/dashboard/);
  61  |
  62  |     await page.reload();
  63  |     await expect(page).toHaveURL(/\/dashboard/);
  64  |
  65  |     await page.goto('/profile');
  66  |     await expect(page).toHaveURL(/\/profile/);
  67  |   });
  68  |
  69  |   test('logout clears session completely', async ({ page, app }) => {
  70  |     await app.loginAs(page, 'student');
  71  |     await expect(page).toHaveURL(/\/dashboard/);
  72  |
  73  |     await page.click('[class*="logout"], button:has-text("Logout"), [aria-label="Logout"]');
  74  |     await page.waitForTimeout(500);
  75  |
  76  |     await page.goto('/dashboard');
  77  |     await expect(page).toHaveURL(/\/auth\/login/);
  78  |   });
  79  |
  80  |   test('expired access token triggers refresh', async ({ page, app }) => {
  81  |     await app.loginAs(page, 'student');
  82  |     await expect(page).toHaveURL(/\/dashboard/);
  83  |
  84  |     app.setRefreshFailure(true);
  85  |     await page.goto('/dashboard');
  86  |     await expect(page).toHaveURL(/\/auth\/login/);
  87  |   });
  88  | });
  89  |
  90  | test.describe('authorization boundaries', () => {
  91  |   test('student cannot access instructor dashboard', async ({ page, app }) => {
  92  |     await app.loginAs(page, 'student');
  93  |
  94  |     await page.goto('/instructor/dashboard');
  95  |     await expect(page).toHaveURL(/\/dashboard|403|access denied|unauthorized/i);
  96  |   });
  97  |
  98  |   test('student cannot access admin dashboard', async ({ page, app }) => {
  99  |     await app.loginAs(page, 'student');
  100 |
  101 |     await page.goto('/admin/dashboard');
  102 |     await expect(page).toHaveURL(/\/dashboard|403|access denied|unauthorized/i);
  103 |   });
  104 |
  105 |   test('instructor cannot access admin dashboard', async ({ page, app }) => {
  106 |     await app.loginAs(page, 'instructor');
  107 |
  108 |     await page.goto('/admin/dashboard');
  109 |     await expect(page).toHaveURL(/\/instructor|403|access denied|unauthorized/i);
  110 |   });
  111 |
  112 |   test('instructor cannot access user management', async ({ page, app }) => {
  113 |     await app.loginAs(page, 'instructor');
  114 |
  115 |     await page.goto('/admin/users');
  116 |     await expect(page).toHaveURL(/\/instructor|403/);
  117 |   });
  118 |
  119 |   test('content_manager cannot access admin routes', async ({ page, app }) => {
  120 |     await app.loginAs(page, 'content_manager');
  121 |
  122 |     await page.goto('/admin/dashboard');
  123 |     await expect(page).toHaveURL(/\/cms|403/);
  124 |   });
  125 |
  126 |   test('content_manager cannot access system settings', async ({ page, app }) => {
  127 |     await app.loginAs(page, 'content_manager');
  128 |
  129 |     await page.goto('/admin/settings');
  130 |     await expect(page).toHaveURL(/\/cms|403/);
  131 |   });
  132 |
  133 |   test('unauthenticated user cannot access protected routes', async ({ page }) => {
  134 |     await assertProtectedRouteRedirects(page, '/dashboard');
  135 |     await assertProtectedRouteRedirects(page, '/profile');
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
```