# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-authorization.spec.ts >> authorization boundaries >> unauthenticated user cannot access protected routes
- Location: e2e/security-authorization.spec.ts:133:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
  navigated to "http://127.0.0.1:4173/profile"
============================================================
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
    - generic [ref=e25]:
      - paragraph [ref=e27]: "404"
      - generic [ref=e28]:
        - heading "Page not found" [level=4] [ref=e29]
        - paragraph [ref=e30]: The page "/profile" doesn't exist or has been moved.
      - generic [ref=e31]:
        - link "Go Home" [ref=e32] [cursor=pointer]:
          - /url: /
          - img [ref=e34]
          - text: Go Home
        - link "Get Help" [ref=e36] [cursor=pointer]:
          - /url: /help
          - img [ref=e38]
          - text: Get Help
      - paragraph [ref=e41]:
        - text: Need assistance?
        - link "Contact support" [ref=e42] [cursor=pointer]:
          - /url: /contact
  - contentinfo [ref=e43]:
    - generic [ref=e45]:
      - generic [ref=e46]:
        - paragraph [ref=e48]: LearnSpace
        - paragraph [ref=e49]: Empowering educators to share knowledge and build sustainable businesses online.
      - generic [ref=e50]:
        - paragraph [ref=e51]: Product
        - generic [ref=e52]:
          - link "Features" [ref=e53] [cursor=pointer]:
            - /url: /#features
          - link "Courses" [ref=e54] [cursor=pointer]:
            - /url: /courses/explore
          - link "Pricing" [ref=e55] [cursor=pointer]:
            - /url: /pricing
          - link "Testimonials" [ref=e56] [cursor=pointer]:
            - /url: /#testimonials
      - generic [ref=e57]:
        - paragraph [ref=e58]: Company
        - generic [ref=e59]:
          - link "About" [ref=e60] [cursor=pointer]:
            - /url: /about
          - link "Careers" [ref=e61] [cursor=pointer]:
            - /url: /careers
          - link "Blog" [ref=e62] [cursor=pointer]:
            - /url: /blog
          - link "Contact" [ref=e63] [cursor=pointer]:
            - /url: /contact
      - generic [ref=e64]:
        - paragraph [ref=e65]: Resources
        - generic [ref=e66]:
          - link "Help Center" [ref=e67] [cursor=pointer]:
            - /url: /help
          - link "Docs" [ref=e68] [cursor=pointer]:
            - /url: /docs
          - link "Community" [ref=e69] [cursor=pointer]:
            - /url: /community
          - link "Status" [ref=e70] [cursor=pointer]:
            - /url: /status
    - generic [ref=e73]:
      - paragraph [ref=e74]: © 2026 LearnSpace. All rights reserved.
      - generic [ref=e75]:
        - link "Privacy" [ref=e76] [cursor=pointer]:
          - /url: /privacy
        - link "Terms" [ref=e77] [cursor=pointer]:
          - /url: /terms
        - link "Cookies" [ref=e78] [cursor=pointer]:
          - /url: /cookies
```

# Test source

```ts
  29  |   _id: string;
  30  |   userId: string;
  31  |   courseId: string;
  32  |   progress: number;
  33  |   status: 'enrolled' | 'completed';
  34  |   enrolledAt: string;
  35  | }
  36  |
  37  | export interface TestDiscussion {
  38  |   _id: string;
  39  |   courseId: string;
  40  |   userId: string;
  41  |   title: string;
  42  |   content: string;
  43  |   createdAt: string;
  44  |   replies: TestReply[];
  45  | }
  46  |
  47  | export interface TestReply {
  48  |   _id: string;
  49  |   userId: string;
  50  |   content: string;
  51  |   createdAt: string;
  52  | }
  53  |
  54  | const generateId = (prefix: string): string => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  55  |
  56  | export const createTestUser = (overrides?: Partial<TestUser>): TestUser => ({
  57  |   _id: generateId('user'),
  58  |   email: 'test@example.com',
  59  |   firstName: 'Test',
  60  |   lastName: 'User',
  61  |   role: 'student',
  62  |   ...overrides,
  63  | });
  64  |
  65  | export const createTestCourse = (overrides?: Partial<TestCourse>): TestCourse => ({
  66  |   _id: generateId('course'),
  67  |   title: 'Test Course',
  68  |   description: 'Test course description',
  69  |   slug: 'test-course',
  70  |   category: 'Development',
  71  |   level: 'beginner',
  72  |   instructor: createTestUser({ role: 'instructor' }),
  73  |   pricing: { type: 'free', amount: 0 },
  74  |   rating: { average: 4.5, count: 10 },
  75  |   enrollmentCount: 0,
  76  |   ...overrides,
  77  | });
  78  |
  79  | export const createTestEnrollment = (overrides?: Partial<TestEnrollment>): TestEnrollment => ({
  80  |   _id: generateId('enrollment'),
  81  |   userId: generateId('user'),
  82  |   courseId: generateId('course'),
  83  |   progress: 0,
  84  |   status: 'enrolled',
  85  |   enrolledAt: new Date().toISOString(),
  86  |   ...overrides,
  87  | });
  88  |
  89  | export const createTestDiscussion = (overrides?: Partial<TestDiscussion>): TestDiscussion => ({
  90  |   _id: generateId('discussion'),
  91  |   courseId: generateId('course'),
  92  |   userId: generateId('user'),
  93  |   title: 'Test Discussion',
  94  |   content: 'Test discussion content',
  95  |   createdAt: new Date().toISOString(),
  96  |   replies: [],
  97  |   ...overrides,
  98  | });
  99  |
  100 | export const ROLE_CREDENTIALS: Record<TestUserRole, { email: string; password: string }> = {
  101 |   student: { email: 'student@learnspace.dev', password: 'Passw0rd!' },
  102 |   instructor: { email: 'instructor@learnspace.dev', password: 'Passw0rd!' },
  103 |   admin: { email: 'admin@learnspace.dev', password: 'Passw0rd!' },
  104 |   content_manager: { email: 'manager@learnspace.dev', password: 'Passw0rd!' },
  105 | };
  106 |
  107 | export const ROLE_DASHBOARDS: Record<TestUserRole, string> = {
  108 |   student: '/dashboard',
  109 |   instructor: '/instructor/dashboard',
  110 |   admin: '/admin/dashboard',
  111 |   content_manager: '/cms/content',
  112 | };
  113 |
  114 | export const navigateToRoleDashboard = async (page: Page, role: TestUserRole): Promise<void> => {
  115 |   await page.goto(ROLE_DASHBOARDS[role]);
  116 | };
  117 |
  118 | export const loginAsRole = async (page: Page, role: TestUserRole): Promise<void> => {
  119 |   const creds = ROLE_CREDENTIALS[role];
  120 |   await page.goto('/auth/login');
  121 |   await page.getByRole('textbox', { name: 'Email' }).fill(creds.email);
  122 |   await page.locator('#password').fill(creds.password);
  123 |   await page.getByRole('button', { name: 'Sign in' }).click();
  124 |   await page.waitForURL(ROLE_DASHBOARDS[role]);
  125 | };
  126 |
  127 | export const assertProtectedRouteRedirects = async (page: Page, route: string): Promise<void> => {
  128 |   await page.goto(route);
> 129 |   await page.waitForURL(/\/auth\/login/);
      |              ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  130 |   await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  131 | };
  132 |
  133 | export const waitForApiResponse = async (
  134 |   page: Page,
  135 |   urlPattern: string | RegExp,
  136 |   options?: { timeout?: number }
  137 | ): Promise<void> => {
  138 |   await page.waitForResponse(urlPattern, { timeout: options?.timeout ?? 10000 });
  139 | };
  140 |
  141 | export const assertElementVisible = async (
  142 |   page: Page,
  143 |   selector: string,
  144 |   options?: { timeout?: number; visible?: boolean }
  145 | ): Promise<void> => {
  146 |   const element = page.locator(selector);
  147 |   if (options?.visible === false) {
  148 |     await expect(element).not.toBeVisible({ timeout: options?.timeout ?? 5000 });
  149 |   } else {
  150 |     await expect(element).toBeVisible({ timeout: options?.timeout ?? 5000 });
  151 |   }
  152 | };
  153 |
  154 | export const fillFormField = async (
  155 |   page: Page,
  156 |   fieldLabel: string,
  157 |   value: string
  158 | ): Promise<void> => {
  159 |   await page.getByRole('textbox', { name: fieldLabel }).fill(value);
  160 | };
  161 |
  162 | export const submitForm = async (page: Page, buttonName: string): Promise<void> => {
  163 |   await page.getByRole('button', { name: buttonName }).click();
  164 | };
  165 |
  166 | export const expectToBeOnUrl = async (page: Page, pattern: string | RegExp): Promise<void> => {
  167 |   await expect(page).toHaveURL(pattern);
  168 | };
```