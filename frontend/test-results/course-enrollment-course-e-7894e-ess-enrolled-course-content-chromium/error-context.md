# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: course-enrollment.spec.ts >> course enrollment flow >> access enrolled course content
- Location: e2e/course-enrollment.spec.ts:74:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
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
      - link "Explore Courses" [ref=e19] [cursor=pointer]:
        - /url: /courses/browse
  - generic [ref=e21]:
    - generic [ref=e23]:
      - img [ref=e25]
      - paragraph [ref=e27]: LearnSpace
    - generic [ref=e28]:
      - generic [ref=e29]:
        - generic [ref=e30]: MAIN MENU
        - list [ref=e31]:
          - link "Dashboard" [ref=e32] [cursor=pointer]:
            - /url: /dashboard
            - img [ref=e34]
            - paragraph [ref=e37]: Dashboard
          - link "My Courses" [ref=e38] [cursor=pointer]:
            - /url: /courses
            - img [ref=e40]
            - paragraph [ref=e43]: My Courses
          - link "Schedule" [ref=e44] [cursor=pointer]:
            - /url: /activity
            - img [ref=e46]
            - paragraph [ref=e49]: Schedule
          - link "Messages 3" [ref=e50] [cursor=pointer]:
            - /url: /messages
            - img [ref=e52]
            - paragraph [ref=e55]: Messages
            - generic [ref=e56]: "3"
          - link "Achievements" [ref=e57] [cursor=pointer]:
            - /url: /certificates
            - img [ref=e59]
            - paragraph [ref=e62]: Achievements
      - generic [ref=e63]:
        - generic [ref=e64]: SETTINGS
        - list [ref=e65]:
          - link "Profile" [ref=e66] [cursor=pointer]:
            - /url: /profile-settings
            - img [ref=e68]
            - paragraph [ref=e71]: Profile
          - link "Preferences" [ref=e72] [cursor=pointer]:
            - /url: /settings/notifications
            - img [ref=e74]
            - paragraph [ref=e77]: Preferences
          - link "Help Center" [ref=e78] [cursor=pointer]:
            - /url: /help
            - img [ref=e80]
            - paragraph [ref=e83]: Help Center
    - generic [ref=e85]:
      - generic [ref=e86]: ST
      - generic [ref=e87]:
        - paragraph [ref=e88]: Student Tester
        - paragraph [ref=e89]: student
      - button "Log out" [ref=e90] [cursor=pointer]:
        - img [ref=e91]
  - main [ref=e93]:
    - generic [ref=e95]:
      - generic [ref=e97]:
        - heading "Courses" [level=4] [ref=e98]
        - paragraph [ref=e99]: Track enrollments, review progress, and move from each course overview into lesson delivery.
      - generic [ref=e101]:
        - tablist [ref=e105]:
          - tab "All" [selected] [ref=e106] [cursor=pointer]
          - tab "In Progress" [ref=e107] [cursor=pointer]
          - tab "Completed" [ref=e108] [cursor=pointer]
          - tab "Wishlist" [ref=e109] [cursor=pointer]
        - generic [ref=e111]:
          - generic [ref=e114]:
            - img [ref=e116]
            - textbox "Search by course or instructor" [ref=e118]
            - group
          - generic [ref=e120]:
            - combobox [ref=e121] [cursor=pointer]: All Categories
            - textbox: All Categories
            - img
            - group
          - generic [ref=e123]:
            - combobox [ref=e124] [cursor=pointer]: Recently Accessed
            - textbox: Recently Accessed
            - img
            - group
      - generic [ref=e125]:
        - generic [ref=e130]:
          - generic [ref=e131]:
            - heading "React Foundations" [level=6] [ref=e132]
            - paragraph [ref=e133]: Instructor Tester
          - generic [ref=e134]:
            - generic [ref=e135]: Development
            - generic [ref=e136]: Last accessed 1/15/2026
          - generic [ref=e137]:
            - generic [ref=e138]:
              - paragraph [ref=e139]: Progress
              - paragraph [ref=e140]: 72%
            - progressbar [ref=e141]
          - button "View Details" [ref=e143] [cursor=pointer]
        - generic [ref=e148]:
          - generic [ref=e149]:
            - heading "UI Design Systems" [level=6] [ref=e150]
            - paragraph [ref=e151]: Instructor Tester
          - generic [ref=e152]:
            - generic [ref=e153]: Design
            - generic [ref=e154]: Last accessed 1/15/2026
          - generic [ref=e155]:
            - generic [ref=e156]:
              - paragraph [ref=e157]: Progress
              - paragraph [ref=e158]: 42%
            - progressbar [ref=e159]
          - button "View Details" [ref=e161] [cursor=pointer]
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
  31  |     await expect(enrollButton).toBeVisible({ timeout: 10000 });
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
> 82  |     await page.waitForURL(/\/learn\//, { timeout: 10000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
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
  132 |     await expect(
  133 |       page.getByRole('heading', { name: /my courses|your courses/i }).or(page.getByText('Instructor Courses'))
  134 |     ).toBeVisible({ timeout: 10000 });
  135 |   });
  136 | });
```