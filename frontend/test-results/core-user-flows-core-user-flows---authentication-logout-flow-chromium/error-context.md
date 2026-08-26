# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-user-flows.spec.ts >> core user flows - authentication >> logout flow
- Location: e2e/core-user-flows.spec.ts:40:3

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /logout|sign out/i }).first()

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
  3   |   ROLE_CREDENTIALS,
  4   |   ROLE_DASHBOARDS,
  5   | } from './support/factories';
  6   |
  7   | test.describe('core user flows - authentication', () => {
  8   |   test('complete login flow with CSRF protection', async ({ page, app }) => {
  9   |     await page.goto('/auth/login');
  10  |
  11  |     await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  12  |
  13  |     const csrfTokenRequest = app.metrics.csrfTokenRequests;
  14  |     await page.getByRole('textbox', { name: 'Email' }).fill(ROLE_CREDENTIALS.student.email);
  15  |     await page.locator('#password').fill(ROLE_CREDENTIALS.student.password);
  16  |
  17  |     await page.getByRole('button', { name: 'Sign in' }).click();
  18  |
  19  |     await page.waitForURL(ROLE_DASHBOARDS.student);
  20  |
  21  |     expect(app.metrics.csrfTokenRequests).toBeGreaterThanOrEqual(csrfTokenRequest);
  22  |     expect(app.metrics.loginRequestsWithCsrfHeader).toBeGreaterThanOrEqual(1);
  23  |   });
  24  |
  25  |   test('complete registration flow', async ({ page }) => {
  26  |     await page.goto('/auth/signup');
  27  |
  28  |     await expect(page.getByRole('heading', { name: /create account|sign up/i })).toBeVisible();
  29  |
  30  |     const uniqueEmail = `newuser-${Date.now()}@test.com`;
  31  |     await page.getByRole('textbox', { name: /email/i }).fill(uniqueEmail);
  32  |     await page.getByRole('textbox', { name: /first name/i }).fill('New');
  33  |     await page.getByRole('textbox', { name: /last name/i }).fill('User');
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
> 45  |     await logoutButton.click();
      |                        ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
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
```