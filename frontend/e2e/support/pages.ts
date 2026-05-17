import type { Page, Locator } from '@playwright/test';
import { expect } from './factories';

export class BasePage {
  constructor(protected page: Page) {}

  protected async navigate(path: string): Promise<void> {
    await this.page.goto(path);
  }

  protected async waitForUrl(pattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  protected getByRole(role: Parameters<typeof this.page.getByRole>[0], options?: Parameters<typeof this.page.getByRole>[1]): Locator {
    return this.page.getByRole(role, options);
  }

  protected getByText(text: string | RegExp, options?: Parameters<typeof this.page.getByText>[1]): Locator {
    return this.page.getByText(text, options);
  }

  protected getByPlaceholder(placeholder: string, options?: Parameters<typeof this.page.getByPlaceholder>[1]): Locator {
    return this.page.getByPlaceholder(placeholder, options);
  }

  protected locator(selector: string): Locator {
    return this.page.locator(selector);
  }
}

export class LoginPage extends BasePage {
  async navigate(): Promise<void> {
    await super.navigate('/auth/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.getByRole('textbox', { name: 'Email' }).fill(email);
    await this.locator('#password').fill(password);
    await this.getByRole('button', { name: 'Sign in' }).click();
  }

  async loginAsStudent(): Promise<void> {
    await this.login('student@learnspace.dev', 'Passw0rd!');
  }

  async loginAsInstructor(): Promise<void> {
    await this.login('instructor@learnspace.dev', 'Passw0rd!');
  }

  async loginAsAdmin(): Promise<void> {
    await this.login('admin@learnspace.dev', 'Passw0rd!');
  }

  async assertOnLoginPage(): Promise<void> {
    await expect(this.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  }

  async assertInvalidCredentials(): Promise<void> {
    await expect(this.getByText('Invalid credentials')).toBeVisible();
  }
}

export class DashboardPage extends BasePage {
  async navigate(): Promise<void> {
    await super.navigate('/dashboard');
  }

  async navigateAsStudent(): Promise<void> {
    await super.navigate('/dashboard');
  }

  async navigateAsInstructor(): Promise<void> {
    await super.navigate('/instructor/dashboard');
  }

  async navigateAsAdmin(): Promise<void> {
    await super.navigate('/admin/dashboard');
  }

  async navigateAsContentManager(): Promise<void> {
    await super.navigate('/cms/content');
  }

  async getUserName(): Promise<string> {
    const userElement = this.getByRole('banner').locator('[class*="user"], [class*="avatar"]').first();
    return userElement.textContent();
  }

  async logout(): Promise<void> {
    await this.getByRole('button', { name: /logout|sign out/i }).click();
  }

  async assertUserLoggedIn(): Promise<void> {
    await expect(this.getByRole('banner')).toBeVisible();
  }
}

export class CoursesPage extends BasePage {
  async navigate(): Promise<void> {
    await super.navigate('/courses/explore');
  }

  async searchForCourse(query: string): Promise<void> {
    await this.getByPlaceholder('Search courses').fill(query);
    await this.getByRole('button', { name: 'Search' }).click();
  }

  async getCourseCard(title: string): Promise<Locator> {
    return this.locator(`[class*="course"], [class*="card"]`).filter({ hasText: title });
  }

  async clickCourse(title: string): Promise<void> {
    await this.getByText(title).click();
  }

  async filterByCategory(category: string): Promise<void> {
    await this.getByRole('combobox', { name: /category/i }).selectOption(category);
  }

  async filterByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Promise<void> {
    await this.getByRole('combobox', { name: /level/i }).selectOption(level);
  }

  async assertCourseVisible(title: string): Promise<void> {
    await expect(this.getByText(title)).toBeVisible();
  }

  async assertCourseCount(count: number): Promise<void> {
    await expect(this.locator('[class*="course"], [class*="card"]')).toHaveCount(count);
  }
}

export class CourseDetailPage extends BasePage {
  private courseId: string;

  constructor(page: Page, courseId: string) {
    super(page);
    this.courseId = courseId;
  }

  async navigate(): Promise<void> {
    await super.navigate(`/courses/${this.courseId}`);
  }

  async enroll(): Promise<void> {
    await this.getByRole('button', { name: /enroll|buy now|get started/i }).click();
  }

  async startLearning(): Promise<void> {
    await this.getByRole('button', { name: /start learning|continue/i }).click();
  }

  async getPrice(): Promise<string> {
    const priceElement = this.locator('[class*="price"], [class*="cost"]').first();
    return priceElement.textContent();
  }

  async getInstructor(): Promise<string> {
    const instructorElement = this.getByText(/instructor|by/i).first();
    return instructorElement.textContent();
  }

  async assertEnrolled(): Promise<void> {
    await expect(this.getByRole('button', { name: /continue learning/i })).toBeVisible();
  }

  async assertNotEnrolled(): Promise<void> {
    await expect(this.getByRole('button', { name: /enroll|buy/i })).toBeVisible();
  }
}

export class CoursePlayerPage extends BasePage {
  private courseId: string;

  constructor(page: Page, courseId: string) {
    super(page);
    this.courseId = courseId;
  }

  async navigate(): Promise<void> {
    await super.navigate(`/learn/${this.courseId}`);
  }

  async selectLesson(lessonTitle: string): Promise<void> {
    await this.getByText(lessonTitle).click();
  }

  async completeLesson(): Promise<void> {
    await this.getByRole('button', { name: /mark complete|next lesson/i }).click();
  }

  async getProgress(): Promise<number> {
    const progressElement = this.locator('[class*="progress"]').first();
    const progressText = await progressElement.textContent();
    const match = progressText?.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  async assertLessonComplete(): Promise<void> {
    await expect(this.getByText(/completed|done/i)).toBeVisible();
  }
}

export class ProfileSettingsPage extends BasePage {
  async navigate(): Promise<void> {
    await super.navigate('/profile');
  }

  async updateFirstName(name: string): Promise<void> {
    await this.getByRole('textbox', { name: /first name/i }).fill(name);
  }

  async updateLastName(name: string): Promise<void> {
    await this.getByRole('textbox', { name: /last name/i }).fill(name);
  }

  async updateBio(bio: string): Promise<void> {
    await this.getByRole('textbox', { name: /bio/i }).fill(bio);
  }

  async saveChanges(): Promise<void> {
    await this.getByRole('button', { name: /save|update/i }).click();
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.getByRole('textbox', { name: /current password/i }).fill(currentPassword);
    await this.getByRole('textbox', { name: /new password/i }).fill(newPassword);
    await this.getByRole('button', { name: /change password|update password/i }).click();
  }

  async assertProfileUpdated(): Promise<void> {
    await expect(this.getByText(/successfully updated|saved/i)).toBeVisible();
  }
}

export class AdminDashboardPage extends BasePage {
  async navigate(): Promise<void> {
    await super.navigate('/admin/dashboard');
  }

  async getTotalUsers(): Promise<number> {
    const statElement = this.locator('[class*="stat"], [class*="metric"]').filter({ hasText: /users/i }).first();
    const text = await statElement.textContent();
    const match = text?.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  async getTotalCourses(): Promise<number> {
    const statElement = this.locator('[class*="stat"], [class*="metric"]').filter({ hasText: /courses/i }).first();
    const text = await statElement.textContent();
    const match = text?.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  async navigateToUserManagement(): Promise<void> {
    await this.getByRole('link', { name: /user management/i }).click();
  }

  async navigateToCourseManager(): Promise<void> {
    await this.getByRole('link', { name: /course manager|manage courses/i }).click();
  }

  async navigateToSystemSettings(): Promise<void> {
    await this.getByRole('link', { name: /system settings/i }).click();
  }

  async assertOnAdminDashboard(): Promise<void> {
    await expect(this.getByRole('heading', { name: /admin dashboard/i })).toBeVisible();
  }
}

export class CMSContentPage extends BasePage {
  async navigate(): Promise<void> {
    await super.navigate('/cms/content');
  }

  async createPage(title: string): Promise<void> {
    await this.getByRole('button', { name: /create|add new/i }).click();
    await this.getByRole('textbox', { name: /title/i }).fill(title);
    await this.getByRole('button', { name: /save|publish/i }).click();
  }

  async editPage(pageTitle: string): Promise<void> {
    await this.locator('[class*="page"], [class*="item"]').filter({ hasText: pageTitle }).click();
    await this.getByRole('button', { name: /edit/i }).click();
  }

  async deletePage(pageTitle: string): Promise<void> {
    await this.locator('[class*="page"], [class*="item"]').filter({ hasText: pageTitle }).hover();
    await this.getByRole('button', { name: /delete/i }).click();
    await this.getByRole('button', { name: /confirm|yes/i }).click();
  }

  async publishPage(pageTitle: string): Promise<void> {
    await this.editPage(pageTitle);
    await this.getByRole('combobox', { name: /status/i }).selectOption('published');
    await this.getByRole('button', { name: /save|publish/i }).click();
  }

  async assertPageExists(title: string): Promise<void> {
    await expect(this.getByText(title)).toBeVisible();
  }

  async assertPageNotExists(title: string): Promise<void> {
    await expect(this.getByText(title)).not.toBeVisible();
  }
}

export class DiscussionsPage extends BasePage {
  private courseId?: string;

  constructor(page: Page, courseId?: string) {
    super(page);
    this.courseId = courseId;
  }

  async navigate(): Promise<void> {
    if (this.courseId) {
      await super.navigate(`/courses/${this.courseId}/discussions`);
    } else {
      await super.navigate('/courses/discussions');
    }
  }

  async createDiscussion(title: string, content: string): Promise<void> {
    await this.getByRole('button', { name: /new thread|start discussion/i }).click();
    await this.getByRole('textbox', { name: /title/i }).fill(title);
    await this.getByRole('textbox', { name: /content|message/i }).fill(content);
    await this.getByRole('button', { name: /post|submit/i }).click();
  }

  async replyToDiscussion(discussionTitle: string, reply: string): Promise<void> {
    await this.locator('[class*="discussion"]').filter({ hasText: discussionTitle }).click();
    await this.getByRole('textbox', { name: /reply/i }).fill(reply);
    await this.getByRole('button', { name: /post reply|submit/i }).click();
  }

  async searchDiscussions(query: string): Promise<void> {
    await this.getByPlaceholder('Search discussions').fill(query);
  }

  async filterByCategory(category: string): Promise<void> {
    await this.getByRole('combobox', { name: /category/i }).selectOption(category);
  }

  async assertDiscussionExists(title: string): Promise<void> {
    await expect(this.getByText(title)).toBeVisible();
  }
}

export class NotificationsPage extends BasePage {
  async navigate(): Promise<void> {
    await super.navigate('/notifications');
  }

  async getUnreadCount(): Promise<number> {
    const badgeElement = this.locator('[class*="badge"], [class*="count"]').first();
    const text = await badgeElement.textContent();
    return text ? parseInt(text, 10) : 0;
  }

  async markAllAsRead(): Promise<void> {
    await this.getByRole('button', { name: /mark all read|clear all/i }).click();
  }

  async clickNotification(title: string): Promise<void> {
    await this.locator('[class*="notification"]').filter({ hasText: title }).click();
  }

  async assertNotificationVisible(title: string): Promise<void> {
    await expect(this.locator('[class*="notification"]').filter({ hasText: title })).toBeVisible();
  }

  async assertUnreadCount(count: number): Promise<void> {
    await expect(this.getByText(`${count}`)).toBeVisible();
  }
}

export class QuizPage extends BasePage {
  private courseId: string;
  private quizId: string;

  constructor(page: Page, courseId: string, quizId: string) {
    super(page);
    this.courseId = courseId;
    this.quizId = quizId;
  }

  async navigate(): Promise<void> {
    await super.navigate(`/courses/${this.courseId}/quiz/${this.quizId}`);
  }

  async startQuiz(): Promise<void> {
    await this.getByRole('button', { name: /start|begin/i }).click();
  }

  async answerQuestion(questionIndex: number, answer: string): Promise<void> {
    const questionLocator = this.locator('[class*="question"]').nth(questionIndex);
    await questionLocator.getByRole('radio', { name: answer }).check();
  }

  async submitQuiz(): Promise<void> {
    await this.getByRole('button', { name: /submit|finish/i }).click();
  }

  async getScore(): Promise<number> {
    const scoreElement = this.locator('[class*="score"], [class*="result"]').first();
    const text = await scoreElement.textContent();
    const match = text?.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  async assertQuizPassed(): Promise<void> {
    await expect(this.getByText(/passed|congratulations/i)).toBeVisible();
  }

  async assertQuizFailed(): Promise<void> {
    await expect(this.getByText(/failed|try again/i)).toBeVisible();
  }
}

export const createPage = {
  login: (page: Page) => new LoginPage(page),
  dashboard: (page: Page) => new DashboardPage(page),
  courses: (page: Page) => new CoursesPage(page),
  courseDetail: (page: Page, courseId: string) => new CourseDetailPage(page, courseId),
  coursePlayer: (page: Page, courseId: string) => new CoursePlayerPage(page, courseId),
  profileSettings: (page: Page) => new ProfileSettingsPage(page),
  adminDashboard: (page: Page) => new AdminDashboardPage(page),
  cmsContent: (page: Page) => new CMSContentPage(page),
  discussions: (page: Page, courseId?: string) => new DiscussionsPage(page, courseId),
  notifications: (page: Page) => new NotificationsPage(page),
  quiz: (page: Page, courseId: string, quizId: string) => new QuizPage(page, courseId, quizId),
};