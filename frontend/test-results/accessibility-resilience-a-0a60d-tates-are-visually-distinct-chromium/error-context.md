# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility-resilience.spec.ts >> accessibility, responsiveness, and resilience >> color and contrast >> error states are visually distinct
- Location: e2e/accessibility-resilience.spec.ts:202:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Invalid credentials')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Invalid credentials')

```

# Page snapshot

```yaml
- generic [ref=e6]:
  - img [ref=e9]
  - generic [ref=e11]:
    - heading "Welcome back" [level=5] [ref=e12]
    - paragraph [ref=e13]: Enter your credentials to access your courses
  - generic [ref=e15]:
    - generic "Email address" [ref=e16]:
      - generic [ref=e17]: Email
      - generic [ref=e18]:
        - textbox "Email" [ref=e19]:
          - /placeholder: name@example.com
          - text: test@test.com
        - group:
          - generic: Email
    - button "Forgot password?" [ref=e21] [cursor=pointer]
    - generic [ref=e22]:
      - generic [ref=e23]: Password
      - generic [ref=e24]:
        - textbox "Password" [ref=e25]:
          - /placeholder: ••••••••
          - text: wrong
        - button "Show password" [ref=e27] [cursor=pointer]:
          - img [ref=e28]
        - group:
          - generic: Password
    - alert [ref=e30]:
      - img [ref=e32]
      - generic [ref=e34]: Unable to complete your request right now. Please try again.
    - button "Sign in" [ref=e35] [cursor=pointer]: Sign in
  - generic [ref=e37]: OR CONTINUE WITH
  - generic [ref=e38]:
    - button "GH GitHub" [ref=e39] [cursor=pointer]:
      - generic [ref=e40]: GH
      - text: GitHub
    - button "G Google" [ref=e41] [cursor=pointer]:
      - generic [ref=e42]: G
      - text: Google
  - paragraph [ref=e43]:
    - text: Don't have an account?
    - link "Sign up" [ref=e44] [cursor=pointer]:
      - /url: /auth/signup
```

# Test source

```ts
  108 |         const courseCards = page.locator('[class*="course-card"], [class*="CourseCard"]');
  109 |         const count = await courseCards.count();
  110 |         if (count > 0) {
  111 |           const firstCard = courseCards.first();
  112 |           const secondCard = courseCards.nth(1);
  113 |           const firstBox = await firstCard.boundingBox();
  114 |           const secondBox = await secondCard.boundingBox();
  115 |
  116 |           if (firstBox && secondBox) {
  117 |             // On tablet, they should be side by side (similar y position)
  118 |             expect(Math.abs(firstBox.y - secondBox.y)).toBeLessThan(100);
  119 |           }
  120 |         }
  121 |       });
  122 |     });
  123 |
  124 |   test.describe('desktop viewport (1920x1080)', () => {
  125 |     test.use({ viewport: { width: 1920, height: 1080 } });
  126 |
  127 |     test('desktop shows full navigation', async ({ page, app }) => {
  128 |       await app.loginAs(page, 'student');
  129 |
  130 |       // Wait for navigation to render
  131 |       await page.waitForLoadState('networkidle');
  132 |       await page.waitForTimeout(1000);
  133 |
  134 |       const navLinks = page.getByRole('link');
  135 |       const count = await navLinks.count();
  136 |       // Desktop nav should have at least some links (adjusted for CI environment)
  137 |       expect(count).toBeGreaterThanOrEqual(1);
  138 |     });
  139 |
  140 |     test('desktop course grid shows 3+ columns', async ({ page, app }) => {
  141 |       await app.loginAs(page, 'student');
  142 |       await page.goto('/courses/explore');
  143 |
  144 |       // Wait for grid to render
  145 |       await page.waitForLoadState('networkidle');
  146 |       await page.waitForTimeout(1000);
  147 |
  148 |       const courseCards = page.locator('[class*="course-card"], [class*="CourseCard"]');
  149 |       const count = await courseCards.count();
  150 |       // In CI, we may have fewer courses - just verify grid layout exists
  151 |       expect(count).toBeGreaterThanOrEqual(0);
  152 |     });
  153 |   });
  154 |
  155 |   test.describe('focus management', () => {
  156 |     test('modal traps focus inside', async ({ page, app }) => {
  157 |       await app.loginAs(page, 'student');
  158 |       await page.goto('/dashboard');
  159 |
  160 |       const openModalButton = page.getByRole('button', { name: /create|add|open/i }).first();
  161 |       if (await openModalButton.isVisible()) {
  162 |         await openModalButton.click();
  163 |
  164 |         const modal = page.locator('[role="dialog"]');
  165 |         if (await modal.isVisible()) {
  166 |           const focusableElements = page.locator('button, input, select, textarea, a[href]');
  167 |           const firstElement = focusableElements.first();
  168 |           await expect(firstElement).toBeFocused();
  169 |         }
  170 |       }
  171 |     });
  172 |
  173 |     test('focus returns to trigger after modal close', async ({ page, app }) => {
  174 |       await app.loginAs(page, 'student');
  175 |       await page.goto('/dashboard');
  176 |
  177 |       const triggerButton = page.getByRole('button', { name: /create|add/i }).first();
  178 |       if (await triggerButton.isVisible()) {
  179 |         const trigger = triggerButton;
  180 |         await trigger.click();
  181 |
  182 |         const closeButton = page.getByRole('button', { name: /close|cancel/i }).first();
  183 |         if (await closeButton.isVisible()) {
  184 |           await closeButton.click();
  185 |
  186 |           await expect(trigger).toBeFocused();
  187 |         }
  188 |       }
  189 |     });
  190 |   });
  191 |
  192 |   test.describe('color and contrast', () => {
  193 |     test('text has sufficient contrast on dashboard', async ({ page, app }) => {
  194 |       await app.loginAs(page, 'student');
  195 |       await page.goto('/dashboard');
  196 |
  197 |       const headings = page.getByRole('heading');
  198 |       const count = await headings.count();
  199 |       expect(count).toBeGreaterThan(0);
  200 |     });
  201 |
  202 |     test('error states are visually distinct', async ({ page }) => {
  203 |       await page.goto('/auth/login');
  204 |       await page.getByRole('textbox', { name: 'Email' }).fill('test@test.com');
  205 |       await page.locator('#password').fill('wrong');
  206 |       await page.getByRole('button', { name: 'Sign in' }).click();
  207 |
> 208 |       await expect(page.getByText('Invalid credentials')).toBeVisible();
      |                                                           ^ Error: expect(locator).toBeVisible() failed
  209 |
  210 |       const errorText = page.getByText('Invalid credentials');
  211 |       const color = await errorText.evaluate((el) => {
  212 |         return window.getComputedStyle(el).color;
  213 |       });
  214 |
  215 |       expect(color).toBeDefined();
  216 |     });
  217 | });
  218 | });
  219 |
```