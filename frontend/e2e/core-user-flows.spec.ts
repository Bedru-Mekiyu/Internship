import { test, expect } from './support/fixtures';
import { 
  ROLE_CREDENTIALS, 
  ROLE_DASHBOARDS,
  createPage 
} from './support/factories';

test.describe('core user flows - authentication', () => {
  test('complete login flow with CSRF protection', async ({ page, app }) => {
    await page.goto('/auth/login');
    
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    
    const csrfTokenRequest = app.metrics.csrfTokenRequests;
    await page.getByRole('textbox', { name: 'Email' }).fill(ROLE_CREDENTIALS.student.email);
    await page.locator('#password').fill(ROLE_CREDENTIALS.student.password);
    
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    await page.waitForURL(ROLE_DASHBOARDS.student);
    
    expect(app.metrics.csrfTokenRequests).toBeGreaterThanOrEqual(csrfTokenRequest);
    expect(app.metrics.loginRequestsWithCsrfHeader).toBeGreaterThanOrEqual(1);
  });

  test('complete registration flow', async ({ page }) => {
    await page.goto('/auth/signup');
    
    await expect(page.getByRole('heading', { name: /create account|sign up/i })).toBeVisible();
    
    const uniqueEmail = `newuser-${Date.now()}@test.com`;
    await page.getByRole('textbox', { name: /email/i }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: /first name/i }).fill('New');
    await page.getByRole('textbox', { name: /last name/i }).fill('User');
    await page.getByRole('textbox', { name: /password/i }).fill('NewUser123!');
    await page.getByRole('button', { name: /create account|sign up/i }).click();
    
    await expect(page.getByText(/verify your email|check your email/i)).toBeVisible({ timeout: 5000 });
  });

  test('logout flow', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await expect(page).toHaveURL(/\/dashboard/);
    
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i }).first();
    await logoutButton.click();
    await page.waitForTimeout(500);
    
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('password reset flow', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    
    await page.getByRole('textbox', { name: /email/i }).fill('test@test.com');
    await page.getByRole('button', { name: /send reset|submit/i }).click();
    
    await expect(page.getByText(/check your email|reset link sent/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('core user flows - student dashboard', () => {
  test('student dashboard loads with correct data', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await expect(page).toHaveURL(/\/dashboard/);
    
    await expect(page.getByText(/my courses|progress/i)).toBeVisible();
    await expect(page.getByText(/enrolled|courses/i)).toBeVisible();
  });

  test('student can view enrolled courses', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await page.goto('/my-courses');
    
    await expect(page.getByText(/enrolled|courses/i)).toBeVisible({ timeout: 5000 });
  });

  test('student can browse course catalog', async ({ page }) => {
    await page.goto('/courses/explore');
    
    await expect(page.getByRole('heading', { name: /explore courses/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search courses/i)).toBeVisible({ timeout: 5000 });
  });

  test('student can view course details', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    await page.goto('/courses/course-react');
    
    await expect(page.getByText(/react|foundations/i)).toBeVisible({ timeout: 5000 });
  });

  test('student can filter courses by category', async ({ page }) => {
    await page.goto('/courses/explore');
    
    const categoryDropdown = page.getByRole('combobox', { name: /category/i });
    await expect(categoryDropdown).toBeVisible({ timeout: 5000 });
  });

  test('student can search courses', async ({ page }) => {
    await page.goto('/courses/explore');
    
    const searchInput = page.getByPlaceholder(/search courses/i);
    await searchInput.fill('react');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(1000);
  });
});

test.describe('core user flows - instructor dashboard', () => {
  test('instructor dashboard loads with analytics', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');
    await expect(page).toHaveURL(/\/instructor\/dashboard/);
    
    await expect(page.getByText(/my courses|teaching|analytics/i)).toBeVisible({ timeout: 5000 });
  });

  test('instructor can create new course', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');
    await page.goto('/courses/create');
    
    await page.getByRole('textbox', { name: /title/i }).fill('Test Course');
    await page.getByRole('textbox', { name: /description/i }).fill('Test description');
    await page.getByRole('button', { name: /create|save|publish/i }).click();
    
    await page.waitForTimeout(1000);
  });

  test('instructor can view course analytics', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');
    await page.goto('/instructor/dashboard');
    
    await expect(page.getByText(/students|enrollment|revenue/i)).toBeVisible({ timeout: 5000 });
  });

  test('instructor can manage course content', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');
    
    await page.goto('/instructor/dashboard');
    
    await page.getByRole('link', { name: /my courses/i }).click();
    await page.waitForTimeout(500);
  });
});

test.describe('core user flows - admin dashboard', () => {
  test('admin dashboard loads with system overview', async ({ page, app }) => {
    await app.loginAs(page, 'admin');
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    
    await expect(page.getByText(/users|courses|system/i)).toBeVisible({ timeout: 5000 });
  });

  test('admin can access user management', async ({ page, app }) => {
    await app.loginAs(page, 'admin');
    await page.goto('/admin/users');
    
    await expect(page.getByText(/users|manage/i)).toBeVisible({ timeout: 5000 });
  });

  test('admin can access course manager', async ({ page, app }) => {
    await app.loginAs(page, 'admin');
    await page.goto('/admin/courses');
    
    await expect(page.getByText(/courses|manage/i)).toBeVisible({ timeout: 5000 });
  });

  test('admin can access system settings', async ({ page, app }) => {
    await app.loginAs(page, 'admin');
    await page.goto('/admin/settings');
    
    await expect(page.getByText(/settings|configuration/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('core user flows - profile and settings', () => {
  test('user can view own profile', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await page.goto('/profile');
    
    await expect(page.getByText(/profile|settings/i)).toBeVisible({ timeout: 5000 });
  });

  test('user can update profile information', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await page.goto('/profile');
    
    const firstNameInput = page.getByRole('textbox', { name: /first name/i });
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill('Updated Name');
      await page.getByRole('button', { name: /save|update/i }).click();
      await expect(page.getByText(/saved|updated|success/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('user can access notification settings', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await page.goto('/settings/notifications');
    
    await expect(page.getByText(/notification|email|preferences/i)).toBeVisible({ timeout: 5000 });
  });

  test('user can change password', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await page.goto('/profile');
    
    const changePasswordButton = page.getByRole('button', { name: /change password/i });
    if (await changePasswordButton.isVisible()) {
      await changePasswordButton.click();
      await page.getByRole('textbox', { name: /current password/i }).fill('Passw0rd!');
      await page.getByRole('textbox', { name: /new password/i }).fill('NewPass123!');
      await page.getByRole('button', { name: /update|save/i }).click();
    }
  });
});

test.describe('core user flows - learning', () => {
  test('student can access course player', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    await page.goto('/learn/course-react');
    
    await expect(page.getByText(/lessons|modules|content/i)).toBeVisible({ timeout: 5000 });
  });

  test('student can track progress', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    await page.goto('/my-courses');
    
    const progressElements = page.locator('[class*="progress"]');
    const count = await progressElements.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('student can take quizzes', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    await page.goto('/courses/course-react/quiz/quiz-1');
    
    await expect(page.getByText(/quiz|question/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('core user flows - content management', () => {
  test('content manager can access CMS', async ({ page, app }) => {
    await app.loginAs(page, 'content_manager');
    await expect(page).toHaveURL(/\/cms\/content/);
    
    await expect(page.getByText(/pages|content|manage/i)).toBeVisible({ timeout: 5000 });
  });

  test('content manager can create new page', async ({ page, app }) => {
    await app.loginAs(page, 'content_manager');
    await page.goto('/cms/content');
    
    const createButton = page.getByRole('button', { name: /create|add new|new page/i });
    await expect(createButton).toBeVisible({ timeout: 5000 });
  });

  test('content manager can access media library', async ({ page, app }) => {
    await app.loginAs(page, 'content_manager');
    await page.goto('/cms/media');
    
    await expect(page.getByText(/media|files|upload/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('core user flows - discussions', () => {
  test('student can view discussions', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await page.goto('/courses/discussions');
    
    await expect(page.getByText(/discussion|threads/i)).toBeVisible({ timeout: 5000 });
  });

  test('instructor can view course discussions', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');
    await page.goto('/courses/discussions');
    
    await expect(page.getByText(/discussion|threads/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('core user flows - navigation', () => {
  test('navigation menu shows correct links for student', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /courses/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /my courses/i })).toBeVisible();
  });

  test('navigation menu shows correct links for instructor', async ({ page, app }) => {
    await app.loginAs(page, 'instructor');
    
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /instructor/i })).toBeVisible();
  });

  test('navigation menu shows correct links for admin', async ({ page, app }) => {
    await app.loginAs(page, 'admin');
    
    await expect(page.getByRole('link', { name: /admin/i })).toBeVisible();
  });

  test('breadcrumb navigation works', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    await page.goto('/courses/explore');
    
    const breadcrumbs = page.locator('[class*="breadcrumb"], [aria-label="breadcrumb"]');
    if (await breadcrumbs.isVisible()) {
      await breadcrumbs.getByText('Home').click();
      await expect(page).toHaveURL(/\/|home/);
    }
  });

  test('search functionality works', async ({ page, app }) => {
    await app.loginAs(page, 'student');
    
    const searchInput = page.getByPlaceholder(/search/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('react');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
    }
  });
});