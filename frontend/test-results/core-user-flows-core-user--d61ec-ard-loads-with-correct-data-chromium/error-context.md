# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-user-flows.spec.ts >> core user flows - student dashboard >> student dashboard loads with correct data
- Location: e2e/core-user-flows.spec.ts:63:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/my courses|progress/i)
Expected: visible
Error: strict mode violation: getByText(/my courses|progress/i) resolved to 4 elements:
    1) <p class="MuiTypography-root MuiTypography-body1 MuiTypography-noWrap css-238799">My Courses</p> aka getByRole('link', { name: 'My Courses' })
    2) <p class="MuiTypography-root MuiTypography-body1 css-1q07bx">Continue your learning journey, pick up where you…</p> aka getByText('Continue your learning')
    3) <p class="MuiTypography-root MuiTypography-body2 css-7wqyn8">Average progress</p> aka getByText('Average progress')
    4) <p class="MuiTypography-root MuiTypography-body2 css-1w9weqd">No recent activity. Start learning to see your pr…</p> aka getByText('No recent activity. Start')

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/my courses|progress/i)

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
      - generic [ref=e94]:
        - heading "Welcome back, Student!" [level=4] [ref=e95]
        - paragraph [ref=e96]: Continue your learning journey, pick up where you left off, and track your progress.
      - generic [ref=e97]:
        - generic [ref=e98]:
          - generic [ref=e103]:
            - paragraph [ref=e104]: Enrolled courses
            - heading "3" [level=4] [ref=e105]
            - paragraph [ref=e106]: Total active enrollments
          - generic [ref=e111]:
            - paragraph [ref=e112]: Average progress
            - heading "64%" [level=4] [ref=e113]
            - paragraph [ref=e114]: Mean across enrollments
          - generic [ref=e119]:
            - paragraph [ref=e120]: Courses completed
            - heading "1" [level=4] [ref=e121]
            - paragraph [ref=e122]: Completed at 100%
          - generic [ref=e127]:
            - paragraph [ref=e128]: Certificates earned
            - heading "1" [level=4] [ref=e129]
            - paragraph [ref=e130]: Issued credentials
        - generic [ref=e131]:
          - generic [ref=e134]:
            - generic [ref=e136]:
              - heading "Continue Learning" [level=6] [ref=e137]
              - paragraph [ref=e138]: Active courses you can resume right now.
            - generic [ref=e139]:
              - generic [ref=e142]:
                - generic [ref=e143]:
                  - heading "React Foundations" [level=6] [ref=e144]
                  - paragraph [ref=e145]: Instructor Tester
                - generic [ref=e148]:
                  - generic [ref=e149]:
                    - paragraph [ref=e150]: 28% remaining
                    - paragraph [ref=e151]: 72%
                  - 'progressbar "React Foundations: 72% complete" [ref=e152]'
                  - link "Resume React Foundations" [ref=e154] [cursor=pointer]:
                    - /url: /courses/course-react/learn
                    - text: Resume Course
              - generic [ref=e157]:
                - generic [ref=e158]:
                  - heading "UI Design Systems" [level=6] [ref=e159]
                  - paragraph [ref=e160]: Instructor Tester
                - generic [ref=e163]:
                  - generic [ref=e164]:
                    - paragraph [ref=e165]: 58% remaining
                    - paragraph [ref=e166]: 42%
                  - 'progressbar "UI Design Systems: 42% complete" [ref=e167]'
                  - link "Resume UI Design Systems" [ref=e169] [cursor=pointer]:
                    - /url: /courses/course-design/learn
                    - text: Resume Course
          - generic [ref=e172]:
            - generic [ref=e173]:
              - heading "Recent Activity" [level=6] [ref=e174]
              - paragraph [ref=e175]: Your latest learning events.
            - generic [ref=e178]:
              - paragraph [ref=e179]: "Completed lesson: Components"
              - generic [ref=e180]: Completion · Today
        - generic [ref=e182]:
          - generic [ref=e183]:
            - generic [ref=e184]:
              - heading "Recommended Courses" [level=6] [ref=e185]
              - paragraph [ref=e186]: Fresh picks based on your activity and goals.
            - link "See all recommended courses" [ref=e187] [cursor=pointer]:
              - /url: /courses/browse
              - text: See all
          - generic [ref=e191]:
            - heading "Growth Marketing Essentials" [level=6] [ref=e192]
            - paragraph [ref=e193]: Advanced • 8h
            - link "Enroll in Growth Marketing Essentials" [ref=e194] [cursor=pointer]:
              - /url: /courses/browse
              - text: Enroll Now
        - generic [ref=e195]:
          - generic [ref=e198]:
            - generic [ref=e199]:
              - heading "Achievements & Badges" [level=6] [ref=e200]
              - paragraph [ref=e201]: Earned milestones from your learning journey.
            - generic [ref=e205]:
              - heading "Fast Starter" [level=6] [ref=e206]
              - paragraph [ref=e207]: Completed first module
          - generic [ref=e210]:
            - generic [ref=e211]:
              - heading "Momentum" [level=6] [ref=e212]
              - paragraph [ref=e213]: Your weekly learning activity.
            - generic [ref=e216]:
              - generic [ref=e217]:
                - paragraph [ref=e218]: Streak
                - paragraph [ref=e219]: —
              - generic [ref=e220]:
                - paragraph [ref=e221]: Avg. completion
                - paragraph [ref=e222]: 64%
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
  45  |     await logoutButton.click();
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
> 67  |     await expect(page.getByText(/my courses|progress/i)).toBeVisible();
      |                                                          ^ Error: expect(locator).toBeVisible() failed
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
  166 |     await expect(page.getByText(/courses|manage/i)).toBeVisible({ timeout: 5000 });
  167 |   });
```