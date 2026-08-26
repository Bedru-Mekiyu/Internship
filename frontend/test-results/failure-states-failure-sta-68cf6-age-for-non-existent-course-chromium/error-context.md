# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: failure-states.spec.ts >> failure states >> displays 404 page for non-existent course
- Location: e2e/failure-states.spec.ts:8:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /not found|404/i }).or(getByText(/course not found/i))
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: /not found|404/i }).or(getByText(/course not found/i))

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
      - alert [ref=e23]:
        - img [ref=e25]
        - generic [ref=e27]: "Unhandled API route: GET /api/courses/non-existent-course"
      - alert [ref=e28]:
        - img [ref=e30]
        - generic [ref=e32]: Course details are unavailable.
  - contentinfo [ref=e33]:
    - generic [ref=e35]:
      - generic [ref=e36]:
        - paragraph [ref=e38]: LearnSpace
        - paragraph [ref=e39]: Empowering educators to share knowledge and build sustainable businesses online.
      - generic [ref=e40]:
        - paragraph [ref=e41]: Product
        - generic [ref=e42]:
          - link "Features" [ref=e43] [cursor=pointer]:
            - /url: /#features
          - link "Courses" [ref=e44] [cursor=pointer]:
            - /url: /courses/explore
          - link "Pricing" [ref=e45] [cursor=pointer]:
            - /url: /pricing
          - link "Testimonials" [ref=e46] [cursor=pointer]:
            - /url: /#testimonials
      - generic [ref=e47]:
        - paragraph [ref=e48]: Company
        - generic [ref=e49]:
          - link "About" [ref=e50] [cursor=pointer]:
            - /url: /about
          - link "Careers" [ref=e51] [cursor=pointer]:
            - /url: /careers
          - link "Blog" [ref=e52] [cursor=pointer]:
            - /url: /blog
          - link "Contact" [ref=e53] [cursor=pointer]:
            - /url: /contact
      - generic [ref=e54]:
        - paragraph [ref=e55]: Resources
        - generic [ref=e56]:
          - link "Help Center" [ref=e57] [cursor=pointer]:
            - /url: /help
          - link "Docs" [ref=e58] [cursor=pointer]:
            - /url: /docs
          - link "Community" [ref=e59] [cursor=pointer]:
            - /url: /community
          - link "Status" [ref=e60] [cursor=pointer]:
            - /url: /status
    - generic [ref=e63]:
      - paragraph [ref=e64]: © 2026 LearnSpace. All rights reserved.
      - generic [ref=e65]:
        - link "Privacy" [ref=e66] [cursor=pointer]:
          - /url: /privacy
        - link "Terms" [ref=e67] [cursor=pointer]:
          - /url: /terms
        - link "Cookies" [ref=e68] [cursor=pointer]:
          - /url: /cookies
```

# Test source

```ts
  1  | import { test, expect } from './support/fixtures';
  2  |
  3  | test.describe('failure states', () => {
  4  |   test.beforeEach(async ({ page, app }) => {
  5  |     await app.loginAs(page, 'student');
  6  |   });
  7  |
  8  |   test('displays 404 page for non-existent course', async ({ page }) => {
  9  |     await page.goto('/courses/non-existent-course');
  10 |     await page.waitForLoadState('networkidle');
  11 |
  12 |     await expect(
  13 |       page.getByRole('heading', { name: /not found|404/i }).or(page.getByText(/course not found/i))
> 14 |     ).toBeVisible({ timeout: 10000 });
     |       ^ Error: expect(locator).toBeVisible() failed
  15 |   });
  16 |
  17 |   test('handles network error gracefully', async ({ page }) => {
  18 |     await page.route('**/api/**', route => route.abort('failed'));
  19 |
  20 |     await page.goto('/courses/explore');
  21 |     await page.waitForLoadState('networkidle');
  22 |
  23 |     await expect(
  24 |       page.getByText(/error|failed to load|network error/i)
  25 |     ).toBeVisible({ timeout: 10000 });
  26 |   });
  27 | });
```