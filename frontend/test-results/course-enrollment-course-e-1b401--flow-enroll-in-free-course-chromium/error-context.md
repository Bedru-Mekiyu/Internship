# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: course-enrollment.spec.ts >> course enrollment flow >> enroll in free course
- Location: e2e/course-enrollment.spec.ts:22:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /enroll|start learning/i })
Expected: visible
Error: strict mode violation: getByRole('button', { name: /enroll|start learning/i }) resolved to 3 elements:
    1) <button tabindex="0" type="button" class="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-sizeSmall MuiButton-colorPrimary MuiButton-disableElevation MuiButton-root MuiButton-contained MuiButton-sizeSmall MuiButton-colorPrimary MuiButton-disableElevation css-1hthf85">Enroll</button> aka getByRole('button', { name: 'Enroll' }).first()
    2) <button tabindex="0" type="button" class="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-sizeSmall MuiButton-colorPrimary MuiButton-disableElevation MuiButton-root MuiButton-contained MuiButton-sizeSmall MuiButton-colorPrimary MuiButton-disableElevation css-1hthf85">Enroll</button> aka getByRole('button', { name: 'Enroll' }).nth(1)
    3) <button tabindex="0" type="button" class="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-sizeSmall MuiButton-colorPrimary MuiButton-disableElevation MuiButton-root MuiButton-contained MuiButton-sizeSmall MuiButton-colorPrimary MuiButton-disableElevation css-1hthf85">Enroll</button> aka getByRole('button', { name: 'Enroll' }).nth(2)

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('button', { name: /enroll|start learning/i })

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
      - generic [ref=e33]:
        - generic [ref=e35]:
          - generic [ref=e36]:
            - paragraph [ref=e38]: Filters
            - button "Reset all" [ref=e39] [cursor=pointer]
          - generic [ref=e40]:
            - generic [ref=e41]:
              - paragraph [ref=e42]: Category
              - generic [ref=e43]:
                - generic [ref=e44] [cursor=pointer]:
                  - generic [ref=e45]:
                    - checkbox "All Categories" [checked] [ref=e46]
                    - img [ref=e47]
                  - generic [ref=e49]: All Categories
                - generic [ref=e50] [cursor=pointer]:
                  - generic [ref=e51]:
                    - checkbox "Development" [ref=e52]
                    - img [ref=e53]
                  - generic [ref=e55]: Development
                - generic [ref=e56] [cursor=pointer]:
                  - generic [ref=e57]:
                    - checkbox "Design" [ref=e58]
                    - img [ref=e59]
                  - generic [ref=e61]: Design
                - generic [ref=e62] [cursor=pointer]:
                  - generic [ref=e63]:
                    - checkbox "Business" [ref=e64]
                    - img [ref=e65]
                  - generic [ref=e67]: Business
                - generic [ref=e68] [cursor=pointer]:
                  - generic [ref=e69]:
                    - checkbox "Marketing" [ref=e70]
                    - img [ref=e71]
                  - generic [ref=e73]: Marketing
                - generic [ref=e74] [cursor=pointer]:
                  - generic [ref=e75]:
                    - checkbox "Photography" [ref=e76]
                    - img [ref=e77]
                  - generic [ref=e79]: Photography
            - generic [ref=e80]:
              - paragraph [ref=e81]: Level
              - generic [ref=e82]:
                - generic [ref=e83] [cursor=pointer]:
                  - generic [ref=e84]:
                    - checkbox "Beginner" [ref=e85]
                    - img [ref=e86]
                  - generic [ref=e88]: Beginner
                - generic [ref=e89] [cursor=pointer]:
                  - generic [ref=e90]:
                    - checkbox "Intermediate" [ref=e91]
                    - img [ref=e92]
                  - generic [ref=e94]: Intermediate
                - generic [ref=e95] [cursor=pointer]:
                  - generic [ref=e96]:
                    - checkbox "Advanced" [ref=e97]
                    - img [ref=e98]
                  - generic [ref=e100]: Advanced
            - generic [ref=e101]:
              - paragraph [ref=e102]: Price
              - generic [ref=e103]:
                - generic [ref=e104] [cursor=pointer]:
                  - generic [ref=e105]:
                    - checkbox "Free" [ref=e106]
                    - img [ref=e107]
                  - generic [ref=e109]: Free
                - generic [ref=e110] [cursor=pointer]:
                  - generic [ref=e111]:
                    - checkbox "Paid" [ref=e112]
                    - img [ref=e113]
                  - generic [ref=e115]: Paid
        - generic [ref=e116]:
          - generic [ref=e117]:
            - paragraph [ref=e118]: Showing 3 of 3 courses
            - generic [ref=e119]:
              - paragraph [ref=e120]: "Sort by:"
              - generic [ref=e122]:
                - combobox [ref=e123] [cursor=pointer]: Most Popular
                - textbox: Most Popular
                - img
                - group
          - generic [ref=e124]:
            - generic [ref=e126]:
              - link [ref=e127] [cursor=pointer]:
                - /url: /courses/course-react
              - generic [ref=e134]:
                - generic [ref=e136]: DEVELOPMENT
                - link "React Foundations" [active] [ref=e137] [cursor=pointer]:
                  - /url: /courses/course-react
                - generic [ref=e138]:
                  - generic [ref=e139]: I
                  - paragraph [ref=e140]: Instructor Tester
                - generic [ref=e141]:
                  - img [ref=e142]
                  - paragraph [ref=e144]: "4.8"
                  - paragraph [ref=e145]: (124 reviews)
                - generic [ref=e146]:
                  - paragraph [ref=e147]: Free
                  - button "Enroll" [ref=e148] [cursor=pointer]
            - generic [ref=e150]:
              - link [ref=e151] [cursor=pointer]:
                - /url: /courses/course-design
              - generic [ref=e158]:
                - generic [ref=e160]: DESIGN
                - link "UI Design Systems" [ref=e161] [cursor=pointer]:
                  - /url: /courses/course-design
                - generic [ref=e162]:
                  - generic [ref=e163]: I
                  - paragraph [ref=e164]: Instructor Tester
                - generic [ref=e165]:
                  - img [ref=e166]
                  - paragraph [ref=e168]: "4.7"
                  - paragraph [ref=e169]: (64 reviews)
                - generic [ref=e170]:
                  - paragraph [ref=e171]: $99
                  - button "Enroll" [ref=e172] [cursor=pointer]
            - generic [ref=e174]:
              - link [ref=e175] [cursor=pointer]:
                - /url: /courses/course-marketing
              - generic [ref=e182]:
                - generic [ref=e184]: MARKETING
                - link "Growth Marketing Essentials" [ref=e185] [cursor=pointer]:
                  - /url: /courses/course-marketing
                - generic [ref=e186]:
                  - generic [ref=e187]: I
                  - paragraph [ref=e188]: Instructor Tester
                - generic [ref=e189]:
                  - img [ref=e190]
                  - paragraph [ref=e192]: "4.6"
                  - paragraph [ref=e193]: (30 reviews)
                - generic [ref=e194]:
                  - paragraph [ref=e195]: $129
                  - button "Enroll" [ref=e196] [cursor=pointer]
  - contentinfo [ref=e197]:
    - generic [ref=e199]:
      - generic [ref=e200]:
        - paragraph [ref=e202]: LearnSpace
        - paragraph [ref=e203]: Empowering educators to share knowledge and build sustainable businesses online.
      - generic [ref=e204]:
        - paragraph [ref=e205]: Product
        - generic [ref=e206]:
          - link "Features" [ref=e207] [cursor=pointer]:
            - /url: /#features
          - link "Courses" [ref=e208] [cursor=pointer]:
            - /url: /courses/explore
          - link "Pricing" [ref=e209] [cursor=pointer]:
            - /url: /pricing
          - link "Testimonials" [ref=e210] [cursor=pointer]:
            - /url: /#testimonials
      - generic [ref=e211]:
        - paragraph [ref=e212]: Company
        - generic [ref=e213]:
          - link "About" [ref=e214] [cursor=pointer]:
            - /url: /about
          - link "Careers" [ref=e215] [cursor=pointer]:
            - /url: /careers
          - link "Blog" [ref=e216] [cursor=pointer]:
            - /url: /blog
          - link "Contact" [ref=e217] [cursor=pointer]:
            - /url: /contact
      - generic [ref=e218]:
        - paragraph [ref=e219]: Resources
        - generic [ref=e220]:
          - link "Help Center" [ref=e221] [cursor=pointer]:
            - /url: /help
          - link "Docs" [ref=e222] [cursor=pointer]:
            - /url: /docs
          - link "Community" [ref=e223] [cursor=pointer]:
            - /url: /community
          - link "Status" [ref=e224] [cursor=pointer]:
            - /url: /status
    - generic [ref=e227]:
      - paragraph [ref=e228]: © 2026 LearnSpace. All rights reserved.
      - generic [ref=e229]:
        - link "Privacy" [ref=e230] [cursor=pointer]:
          - /url: /privacy
        - link "Terms" [ref=e231] [cursor=pointer]:
          - /url: /terms
        - link "Cookies" [ref=e232] [cursor=pointer]:
          - /url: /cookies
```

# Test source

```ts
  1   | import { test, expect } from './support/fixtures';
  2   |
  3   | test.describe('course enrollment flow', () => {
  4   |   test.beforeEach(async ({ page, app }) => {
  5   |     await app.loginAs(page, 'student');
  6   |   });
  7   |
  8   |   test('browse courses and view course details', async ({ page }) => {
  9   |     await page.goto('/courses/explore');
  10  |     await page.waitForLoadState('networkidle');
  11  |
  12  |     await expect(page.getByRole('heading', { name: /explore courses/i })).toBeVisible({ timeout: 10000 });
  13  |
  14  |     const courseCard = page.getByText('React Foundations').first();
  15  |     await expect(courseCard).toBeVisible();
  16  |     await courseCard.click();
  17  |
  18  |     await expect(page.getByRole('heading', { name: /react foundations/i })).toBeVisible({ timeout: 10000 });
  19  |     await expect(page.getByText('Build modern React apps')).toBeVisible();
  20  |   });
  21  |
  22  |   test('enroll in free course', async ({ page }) => {
  23  |     await page.goto('/courses/explore');
  24  |     await page.waitForLoadState('networkidle');
  25  |
  26  |     const courseCard = page.getByText('React Foundations').first();
  27  |     await expect(courseCard).toBeVisible();
  28  |     await courseCard.click();
  29  |
  30  |     const enrollButton = page.getByRole('button', { name: /enroll|start learning/i });
> 31  |     await expect(enrollButton).toBeVisible({ timeout: 10000 });
      |                                ^ Error: expect(locator).toBeVisible() failed
  32  |     await enrollButton.click();
  33  |
  34  |     await expect(page.getByText(/enrollment successful|you are enrolled/i)).toBeVisible({ timeout: 15000 });
  35  |   });
  36  |
  37  |   test('course search returns matching results', async ({ page }) => {
  38  |     await page.goto('/courses/explore');
  39  |     await page.waitForLoadState('networkidle');
  40  |
  41  |     const searchBox = page.getByRole('textbox', { name: /search courses/i }).or(page.getByPlaceholder(/search/i));
  42  |     await expect(searchBox).toBeVisible({ timeout: 10000 });
  43  |     await searchBox.fill('React');
  44  |     await page.keyboard.press('Enter');
  45  |
  46  |     await page.waitForLoadState('networkidle');
  47  |     await expect(page.getByText('React Foundations')).toBeVisible({ timeout: 10000 });
  48  |   });
  49  |
  50  |   test('course filter by category works', async ({ page }) => {
  51  |     await page.goto('/courses/explore');
  52  |     await page.waitForLoadState('networkidle');
  53  |
  54  |     const categoryFilter = page.getByRole('combobox', { name: /category/i });
  55  |     await expect(categoryFilter).toBeVisible({ timeout: 10000 });
  56  |     await categoryFilter.selectOption('Development');
  57  |
  58  |     await page.waitForLoadState('networkidle');
  59  |     await expect(page.getByText('Development')).toBeVisible({ timeout: 10000 });
  60  |   });
  61  |
  62  |   test('course filter by level works', async ({ page }) => {
  63  |     await page.goto('/courses/explore');
  64  |     await page.waitForLoadState('networkidle');
  65  |
  66  |     const levelFilter = page.getByRole('combobox', { name: /level/i });
  67  |     await expect(levelFilter).toBeVisible({ timeout: 10000 });
  68  |     await levelFilter.selectOption('beginner');
  69  |
  70  |     await page.waitForLoadState('networkidle');
  71  |     await expect(page.getByText('React Foundations')).toBeVisible({ timeout: 10000 });
  72  |   });
  73  |
  74  |   test('access enrolled course content', async ({ page }) => {
  75  |     await page.goto('/my-courses');
  76  |     await page.waitForLoadState('networkidle');
  77  |
  78  |     const enrolledCourse = page.getByText('React Foundations').first();
  79  |     await expect(enrolledCourse).toBeVisible({ timeout: 10000 });
  80  |     await enrolledCourse.click();
  81  |
  82  |     await page.waitForURL(/\/learn\//, { timeout: 10000 });
  83  |   });
  84  |
  85  |   test('view my courses shows enrolled courses', async ({ page }) => {
  86  |     await page.goto('/my-courses');
  87  |     await page.waitForLoadState('networkidle');
  88  |
  89  |     await expect(
  90  |       page.getByRole('heading', { name: /my courses/i }).or(page.getByText('Enrolled Courses'))
  91  |     ).toBeVisible({ timeout: 10000 });
  92  |   });
  93  | });
  94  |
  95  | test.describe('course discovery for unauthenticated users', () => {
  96  |   test('explore courses page is accessible without login', async ({ page }) => {
  97  |     await page.goto('/courses/explore');
  98  |     await page.waitForLoadState('networkidle');
  99  |
  100 |     await expect(page.getByRole('heading', { name: /explore courses/i })).toBeVisible({ timeout: 10000 });
  101 |     await expect(page.getByText('React Foundations')).toBeVisible();
  102 |   });
  103 |
  104 |   test('course card shows key information', async ({ page }) => {
  105 |     await page.goto('/courses/explore');
  106 |     await page.waitForLoadState('networkidle');
  107 |
  108 |     await expect(page.getByText('React Foundations')).toBeVisible();
  109 |     await expect(page.getByText('Development')).toBeVisible();
  110 |     await expect(page.getByText('beginner')).toBeVisible();
  111 |   });
  112 | });
  113 |
  114 | test.describe('instructor course management', () => {
  115 |   test.beforeEach(async ({ page, app }) => {
  116 |     await app.loginAs(page, 'instructor');
  117 |   });
  118 |
  119 |   test('instructor can access course creation', async ({ page }) => {
  120 |     await page.goto('/courses/create');
  121 |     await page.waitForLoadState('networkidle');
  122 |
  123 |     await expect(
  124 |       page.getByRole('heading', { name: /create course/i }).or(page.getByText('New Course'))
  125 |     ).toBeVisible({ timeout: 10000 });
  126 |   });
  127 |
  128 |   test('instructor can view their courses', async ({ page }) => {
  129 |     await page.goto('/instructor/courses');
  130 |     await page.waitForLoadState('networkidle');
  131 |
```