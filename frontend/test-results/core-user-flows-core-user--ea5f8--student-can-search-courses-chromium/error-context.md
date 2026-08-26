# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-user-flows.spec.ts >> core user flows - student dashboard >> student can search courses
- Location: e2e/core-user-flows.spec.ts:100:3

# Error details

```
TimeoutError: locator.fill: Timeout 15000ms exceeded.
Call log:
  - waiting for getByPlaceholder(/search courses/i)

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to main content" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e5]:
    - generic [ref=e6]:
      - link "LearnSpace" [ref=e7] [cursor=pointer]:
        - /url: /
        - img [ref=e9]
        - heading "LearnSpace" [level=6] [ref=e11]
      - generic [ref=e12]:
        - link "Features" [ref=e13] [cursor=pointer]:
          - /url: /#features
        - link "Courses" [ref=e14] [cursor=pointer]:
          - /url: /courses/explore
        - link "Pricing" [ref=e15] [cursor=pointer]:
          - /url: /pricing
        - link "About" [ref=e16] [cursor=pointer]:
          - /url: /about
      - generic [ref=e17]:
        - link "Log in" [ref=e18] [cursor=pointer]:
          - /url: /auth/login
        - link "Get Started" [ref=e19] [cursor=pointer]:
          - /url: /auth/signup
  - main [ref=e20]:
    - generic [ref=e22]:
      - generic [ref=e23]:
        - generic [ref=e24]:
          - heading "Explore Courses" [level=1] [ref=e25]
          - paragraph [ref=e26]: Discover new skills with our expert-led video tutorials.
        - generic [ref=e28]:
          - img [ref=e30]
          - textbox "Search for courses..." [ref=e32]
          - group
      - alert [ref=e33]:
        - img [ref=e35]
        - generic [ref=e37]: Showing sample courses—check back soon for our full catalog
      - generic [ref=e38]:
        - generic [ref=e40]:
          - generic [ref=e41]:
            - paragraph [ref=e43]: Filters
            - button "Reset all" [ref=e44] [cursor=pointer]
          - generic [ref=e45]:
            - generic [ref=e46]:
              - paragraph [ref=e47]: Category
              - generic [ref=e48]:
                - generic [ref=e49] [cursor=pointer]:
                  - generic [ref=e50]:
                    - checkbox "All Categories" [checked] [ref=e51]
                    - img [ref=e52]
                  - generic [ref=e54]: All Categories
                - generic [ref=e55] [cursor=pointer]:
                  - generic [ref=e56]:
                    - checkbox "Development" [ref=e57]
                    - img [ref=e58]
                  - generic [ref=e60]: Development
                - generic [ref=e61] [cursor=pointer]:
                  - generic [ref=e62]:
                    - checkbox "Design" [ref=e63]
                    - img [ref=e64]
                  - generic [ref=e66]: Design
                - generic [ref=e67] [cursor=pointer]:
                  - generic [ref=e68]:
                    - checkbox "Business" [ref=e69]
                    - img [ref=e70]
                  - generic [ref=e72]: Business
                - generic [ref=e73] [cursor=pointer]:
                  - generic [ref=e74]:
                    - checkbox "Marketing" [ref=e75]
                    - img [ref=e76]
                  - generic [ref=e78]: Marketing
                - generic [ref=e79] [cursor=pointer]:
                  - generic [ref=e80]:
                    - checkbox "Photography" [ref=e81]
                    - img [ref=e82]
                  - generic [ref=e84]: Photography
            - generic [ref=e85]:
              - paragraph [ref=e86]: Level
              - generic [ref=e87]:
                - generic [ref=e88] [cursor=pointer]:
                  - generic [ref=e89]:
                    - checkbox "Beginner" [ref=e90]
                    - img [ref=e91]
                  - generic [ref=e93]: Beginner
                - generic [ref=e94] [cursor=pointer]:
                  - generic [ref=e95]:
                    - checkbox "Intermediate" [ref=e96]
                    - img [ref=e97]
                  - generic [ref=e99]: Intermediate
                - generic [ref=e100] [cursor=pointer]:
                  - generic [ref=e101]:
                    - checkbox "Advanced" [ref=e102]
                    - img [ref=e103]
                  - generic [ref=e105]: Advanced
            - generic [ref=e106]:
              - paragraph [ref=e107]: Price
              - generic [ref=e108]:
                - generic [ref=e109] [cursor=pointer]:
                  - generic [ref=e110]:
                    - checkbox "Free" [ref=e111]
                    - img [ref=e112]
                  - generic [ref=e114]: Free
                - generic [ref=e115] [cursor=pointer]:
                  - generic [ref=e116]:
                    - checkbox "Paid" [ref=e117]
                    - img [ref=e118]
                  - generic [ref=e120]: Paid
        - generic [ref=e121]:
          - generic [ref=e122]:
            - paragraph [ref=e123]: Showing 9 of 9 courses
            - generic [ref=e124]:
              - paragraph [ref=e125]: "Sort by:"
              - generic [ref=e127]:
                - combobox [ref=e128] [cursor=pointer]: Most Popular
                - textbox: Most Popular
                - img
                - group
          - generic [ref=e129]:
            - generic [ref=e131]:
              - link [ref=e132] [cursor=pointer]:
                - /url: /courses/demo-python-data
              - generic [ref=e133]:
                - generic [ref=e135]: DEVELOPMENT
                - link "Python for Data Science" [ref=e136] [cursor=pointer]:
                  - /url: /courses/demo-python-data
                - generic [ref=e137]:
                  - generic [ref=e138]: K
                  - paragraph [ref=e139]: Kemi Tanaka
                - generic [ref=e140]:
                  - img [ref=e141]
                  - paragraph [ref=e143]: "4.9"
                  - paragraph [ref=e144]: (4,200 reviews)
                - generic [ref=e145]:
                  - paragraph [ref=e146]: $95
                  - button "Enroll" [ref=e147] [cursor=pointer]
            - generic [ref=e149]:
              - link [ref=e150] [cursor=pointer]:
                - /url: /courses/demo-digital-marketing
              - generic [ref=e151]:
                - generic [ref=e153]: BUSINESS
                - link "Digital Marketing Strategy" [ref=e154] [cursor=pointer]:
                  - /url: /courses/demo-digital-marketing
                - generic [ref=e155]:
                  - generic [ref=e156]: M
                  - paragraph [ref=e157]: Maria Garcia
                - generic [ref=e158]:
                  - img [ref=e159]
                  - paragraph [ref=e161]: "4.7"
                  - paragraph [ref=e162]: (3,500 reviews)
                - generic [ref=e163]:
                  - paragraph [ref=e164]: $49
                  - button "Enroll" [ref=e165] [cursor=pointer]
            - generic [ref=e167]:
              - link [ref=e168] [cursor=pointer]:
                - /url: /courses/demo-ui-ux
              - generic [ref=e169]:
                - generic [ref=e171]: DESIGN
                - link "UI/UX Design Masterclass" [ref=e172] [cursor=pointer]:
                  - /url: /courses/demo-ui-ux
                - generic [ref=e173]:
                  - generic [ref=e174]: S
                  - paragraph [ref=e175]: Sarah Jones
                - generic [ref=e176]:
                  - img [ref=e177]
                  - paragraph [ref=e179]: "4.8"
                  - paragraph [ref=e180]: (2,100 reviews)
                - generic [ref=e181]:
                  - paragraph [ref=e182]: $65
                  - button "Enroll" [ref=e183] [cursor=pointer]
            - generic [ref=e185]:
              - link [ref=e186] [cursor=pointer]:
                - /url: /courses/demo-full-stack
              - generic [ref=e187]:
                - generic [ref=e189]: DEVELOPMENT
                - link "Full-Stack Web Bootcamp 2024" [ref=e190] [cursor=pointer]:
                  - /url: /courses/demo-full-stack
                - generic [ref=e191]:
                  - generic [ref=e192]: A
                  - paragraph [ref=e193]: Alex Chen
                - generic [ref=e194]:
                  - img [ref=e195]
                  - paragraph [ref=e197]: "4.9"
                  - paragraph [ref=e198]: (1,200 reviews)
                - generic [ref=e199]:
                  - paragraph [ref=e200]: $89
                  - button "Enroll" [ref=e201] [cursor=pointer]
            - generic [ref=e203]:
              - link [ref=e204] [cursor=pointer]:
                - /url: /courses/demo-illustrator
              - generic [ref=e205]:
                - generic [ref=e207]: DESIGN
                - link "Adobe Illustrator Essentials" [ref=e208] [cursor=pointer]:
                  - /url: /courses/demo-illustrator
                - generic [ref=e209]:
                  - generic [ref=e210]: O
                  - paragraph [ref=e211]: Omar Farooq
                - generic [ref=e212]:
                  - img [ref=e213]
                  - paragraph [ref=e215]: "4.8"
                  - paragraph [ref=e216]: (1,100 reviews)
                - generic [ref=e217]:
                  - paragraph [ref=e218]: $59
                  - button "Enroll" [ref=e219] [cursor=pointer]
            - generic [ref=e221]:
              - link [ref=e222] [cursor=pointer]:
                - /url: /courses/demo-agile
              - generic [ref=e223]:
                - generic [ref=e225]: BUSINESS
                - link "Agile Project Management" [ref=e226] [cursor=pointer]:
                  - /url: /courses/demo-agile
                - generic [ref=e227]:
                  - generic [ref=e228]: D
                  - paragraph [ref=e229]: David Okafor
                - generic [ref=e230]:
                  - img [ref=e231]
                  - paragraph [ref=e233]: "4.6"
                  - paragraph [ref=e234]: (900 reviews)
                - generic [ref=e235]:
                  - paragraph [ref=e236]: $79
                  - button "Enroll" [ref=e237] [cursor=pointer]
            - generic [ref=e239]:
              - link [ref=e240] [cursor=pointer]:
                - /url: /courses/demo-machine-learning
              - generic [ref=e241]:
                - generic [ref=e243]: DEVELOPMENT
                - link "Intro to Machine Learning" [ref=e244] [cursor=pointer]:
                  - /url: /courses/demo-machine-learning
                - generic [ref=e245]:
                  - generic [ref=e246]: P
                  - paragraph [ref=e247]: Priya Patel
                - generic [ref=e248]:
                  - img [ref=e249]
                  - paragraph [ref=e251]: "4.9"
                  - paragraph [ref=e252]: (790 reviews)
                - generic [ref=e253]:
                  - paragraph [ref=e254]: $120
                  - button "Enroll" [ref=e255] [cursor=pointer]
            - generic [ref=e257]:
              - link [ref=e258] [cursor=pointer]:
                - /url: /courses/demo-copywriting
              - generic [ref=e259]:
                - generic [ref=e261]: MARKETING
                - link "Copywriting Secrets" [ref=e262] [cursor=pointer]:
                  - /url: /courses/demo-copywriting
                - generic [ref=e263]:
                  - generic [ref=e264]: J
                  - paragraph [ref=e265]: James Wilson
                - generic [ref=e266]:
                  - img [ref=e267]
                  - paragraph [ref=e269]: "4.7"
                  - paragraph [ref=e270]: (600 reviews)
                - generic [ref=e271]:
                  - paragraph [ref=e272]: $45
                  - button "Enroll" [ref=e273] [cursor=pointer]
            - generic [ref=e275]:
              - link [ref=e276] [cursor=pointer]:
                - /url: /courses/demo-dslr
              - generic [ref=e277]:
                - generic [ref=e279]: PHOTOGRAPHY
                - link "Mastering DSLR Photography" [ref=e280] [cursor=pointer]:
                  - /url: /courses/demo-dslr
                - generic [ref=e281]:
                  - generic [ref=e282]: E
                  - paragraph [ref=e283]: Emma Wilson
                - generic [ref=e284]:
                  - img [ref=e285]
                  - paragraph [ref=e287]: "4.8"
                  - paragraph [ref=e288]: (580 reviews)
                - generic [ref=e289]:
                  - paragraph [ref=e290]: $55
                  - button "Enroll" [ref=e291] [cursor=pointer]
  - contentinfo [ref=e292]:
    - generic [ref=e294]:
      - generic [ref=e295]:
        - paragraph [ref=e297]: LearnSpace
        - paragraph [ref=e298]: Empowering educators to share knowledge and build sustainable businesses online.
      - generic [ref=e299]:
        - paragraph [ref=e300]: Product
        - generic [ref=e301]:
          - link "Features" [ref=e302] [cursor=pointer]:
            - /url: /#features
          - link "Courses" [ref=e303] [cursor=pointer]:
            - /url: /courses/explore
          - link "Pricing" [ref=e304] [cursor=pointer]:
            - /url: /pricing
          - link "Testimonials" [ref=e305] [cursor=pointer]:
            - /url: /#testimonials
      - generic [ref=e306]:
        - paragraph [ref=e307]: Company
        - generic [ref=e308]:
          - link "About" [ref=e309] [cursor=pointer]:
            - /url: /about
          - link "Careers" [ref=e310] [cursor=pointer]:
            - /url: /careers
          - link "Blog" [ref=e311] [cursor=pointer]:
            - /url: /blog
          - link "Contact" [ref=e312] [cursor=pointer]:
            - /url: /contact
      - generic [ref=e313]:
        - paragraph [ref=e314]: Resources
        - generic [ref=e315]:
          - link "Help Center" [ref=e316] [cursor=pointer]:
            - /url: /help
          - link "Docs" [ref=e317] [cursor=pointer]:
            - /url: /docs
          - link "Community" [ref=e318] [cursor=pointer]:
            - /url: /community
          - link "Status" [ref=e319] [cursor=pointer]:
            - /url: /status
    - generic [ref=e322]:
      - paragraph [ref=e323]: © 2026 LearnSpace. All rights reserved.
      - generic [ref=e324]:
        - link "Privacy" [ref=e325] [cursor=pointer]:
          - /url: /privacy
        - link "Terms" [ref=e326] [cursor=pointer]:
          - /url: /terms
        - link "Cookies" [ref=e327] [cursor=pointer]:
          - /url: /cookies
```

# Test source

```ts
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
> 104 |     await searchInput.fill('react');
      |                       ^ TimeoutError: locator.fill: Timeout 15000ms exceeded.
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
  201 |     await expect(page.getByText(/notification|email|preferences/i)).toBeVisible({ timeout: 5000 });
  202 |   });
  203 |
  204 |   test('user can change password', async ({ page, app }) => {
```