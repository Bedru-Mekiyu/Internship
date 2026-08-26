# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: failure-states.spec.ts >> failure states >> handles network error gracefully
- Location: e2e/failure-states.spec.ts:17:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/error|failed to load|network error/i)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/error|failed to load|network error/i)

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
  14 |     ).toBeVisible({ timeout: 10000 });
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
> 25 |     ).toBeVisible({ timeout: 10000 });
     |       ^ Error: expect(locator).toBeVisible() failed
  26 |   });
  27 | });
```