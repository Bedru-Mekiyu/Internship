# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: real-auth.spec.ts >> real authentication flow >> logout clears session and redirects to login
- Location: e2e/real-auth.spec.ts:53:3

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /sign out|logout/i })

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
  2   |
  3   | test.describe('real authentication flow', () => {
  4   |   test('login with valid credentials redirects to role-appropriate dashboard', async ({ page, app }) => {
  5   |     await app.loginAs(page, 'student');
  6   |
  7   |     await expect(page).toHaveURL(/\/dashboard/);
  8   |     await expect(page.getByText('Student')).toBeVisible();
  9   |   });
  10  |
  11  |   test('login with valid admin credentials redirects to admin dashboard', async ({ page, app }) => {
  12  |     await app.loginAs(page, 'admin');
  13  |
  14  |     await expect(page).toHaveURL(/\/admin\/dashboard/);
  15  |   });
  16  |
  17  |   test('login with valid instructor credentials redirects to instructor dashboard', async ({ page, app }) => {
  18  |     await app.loginAs(page, 'instructor');
  19  |
  20  |     await expect(page).toHaveURL(/\/instructor\/dashboard/);
  21  |   });
  22  |
  23  |   test('login with valid content_manager credentials redirects to CMS', async ({ page, app }) => {
  24  |     await app.loginAs(page, 'content_manager');
  25  |
  26  |     await expect(page).toHaveURL(/\/cms\/content/);
  27  |   });
  28  |
  29  |   test('login with invalid credentials shows error message', async ({ page, app }) => {
  30  |     await app.loginWithCredentials(page, 'wrong@test.com', 'WrongPassword123!');
  31  |
  32  |     await expect(page.getByText('Invalid credentials')).toBeVisible();
  33  |     await expect(page).toHaveURL(/\/auth\/login/);
  34  |   });
  35  |
  36  |   test('login with wrong password shows error message', async ({ page, app }) => {
  37  |     await app.loginWithCredentials(page, 'student@learnspace.dev', 'WrongPassword');
  38  |
  39  |     await expect(page.getByText('Invalid credentials')).toBeVisible();
  40  |   });
  41  |
  42  |   test('session persists across page navigation', async ({ page, app }) => {
  43  |     await app.loginAs(page, 'student');
  44  |     await expect(page).toHaveURL(/\/dashboard/);
  45  |
  46  |     await page.goto('/courses/explore');
  47  |     await expect(page).toHaveURL(/\/courses\/explore/);
  48  |
  49  |     await page.goto('/dashboard');
  50  |     await expect(page).toHaveURL(/\/dashboard/);
  51  |   });
  52  |
  53  |   test('logout clears session and redirects to login', async ({ page, app }) => {
  54  |     await app.loginAs(page, 'student');
  55  |     await expect(page).toHaveURL(/\/dashboard/);
  56  |
> 57  |     await page.getByRole('button', { name: /sign out|logout/i }).click();
      |                                                                  ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  58  |
  59  |     await expect(page).toHaveURL(/\/auth\/login/);
  60  |   });
  61  |
  62  |   test('expired session redirects to login', async ({ page, app }) => {
  63  |     await app.loginAs(page, 'student');
  64  |     await expect(page).toHaveURL(/\/dashboard/);
  65  |
  66  |     app.setSessionActive(false);
  67  |     app.setRefreshFailure(true);
  68  |
  69  |     await page.goto('/dashboard');
  70  |     await expect(page).toHaveURL(/\/auth\/login/);
  71  |   });
  72  |
  73  |   test('network error during login shows error state', async ({ page, app }) => {
  74  |     app.setLoginNetworkFailure(true);
  75  |
  76  |     await page.goto('/auth/login');
  77  |     await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
  78  |     await page.locator('#password').fill('Passw0rd!');
  79  |     await page.getByRole('button', { name: 'Sign in' }).click();
  80  |
  81  |     await expect(page.getByText(/error|failed|network/i)).toBeVisible();
  82  |   });
  83  | });
  84  |
  85  | test.describe('authentication security', () => {
  86  |   test('protected route redirects unauthenticated user to login', async ({ page }) => {
  87  |     await page.goto('/dashboard');
  88  |     await expect(page).toHaveURL(/\/auth\/login/);
  89  |   });
  90  |
  91  |   test('redirect preserves intended destination', async ({ page }) => {
  92  |     await page.goto('/dashboard');
  93  |     await expect(page).toHaveURL(/\/auth\/login/);
  94  |
  95  |     await page.getByRole('textbox', { name: 'Email' }).fill('student@learnspace.dev');
  96  |     await page.locator('#password').fill('Passw0rd!');
  97  |     await page.getByRole('button', { name: 'Sign in' }).click();
  98  |
  99  |     await expect(page).toHaveURL(/\/dashboard/);
  100 |   });
  101 |
  102 |   test('CSRF token is requested before login', async ({ page, app }) => {
  103 |     await page.goto('/auth/login');
  104 |
  105 |     expect(app.metrics.csrfTokenRequests).toBeGreaterThanOrEqual(1);
  106 |   });
  107 |
  108 |   test('login request includes CSRF token header', async ({ page, app }) => {
  109 |     await app.loginWithCredentials(page, 'student@learnspace.dev', 'Passw0rd!');
  110 |
  111 |     expect(app.metrics.loginRequestsWithCsrfHeader).toBe(1);
  112 |   });
  113 | });
```