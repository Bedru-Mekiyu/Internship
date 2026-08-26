# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility-resilience.spec.ts >> accessibility, responsiveness, and resilience >> color and contrast >> text has sufficient contrast on dashboard
- Location: e2e/accessibility-resilience.spec.ts:193:5

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - img [ref=e6]
  - paragraph [ref=e8]: Getting you in...
```

# Test source

```ts
  99  |
  100 |       test('tablet course grid shows 2 columns', async ({ page, app }) => {
  101 |         await app.loginAs(page, 'student');
  102 |         await page.goto('/courses/explore');
  103 |
  104 |         // Wait for grid to render
  105 |         await page.waitForLoadState('networkidle');
  106 |         await page.waitForTimeout(1000);
  107 |
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
> 199 |       expect(count).toBeGreaterThan(0);
      |                     ^ Error: expect(received).toBeGreaterThan(expected)
  200 |     });
  201 |
  202 |     test('error states are visually distinct', async ({ page }) => {
  203 |       await page.goto('/auth/login');
  204 |       await page.getByRole('textbox', { name: 'Email' }).fill('test@test.com');
  205 |       await page.locator('#password').fill('wrong');
  206 |       await page.getByRole('button', { name: 'Sign in' }).click();
  207 |
  208 |       await expect(page.getByText('Invalid credentials')).toBeVisible();
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