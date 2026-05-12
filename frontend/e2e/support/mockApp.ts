import { expect, type Page, type Route } from '@playwright/test';

export type AppRole = 'student' | 'instructor' | 'admin' | 'content_manager';

export type MockUser = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  avatar?: string;
};

type PageStatus = 'draft' | 'published' | 'archived';

type ManagedPage = {
  _id: string;
  title: string;
  slug: string;
  status: PageStatus;
  type?: string;
  content?: string;
  blocks?: unknown[];
};

type MediaEntry = {
  _id: string;
  filename: string;
  originalName?: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: string;
};

type CourseEntry = {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  slug: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  instructor: string;
  pricing?: {
    type?: 'free' | 'paid';
    amount?: number;
  };
  rating?: { average?: number; count?: number };
  enrollmentCount?: number;
  updatedAt?: string;
};

type MockState = {
  currentUser: MockUser | null;
  sessionActive: boolean;
  failRefresh: boolean;
  forceLoginNetworkError: boolean;
  mediaFailureMode: 'none' | 'server_error';
  csrfToken: string;
  pages: ManagedPage[];
  media: MediaEntry[];
  courses: CourseEntry[];
  createdCourseIds: string[];
  enrollRequests: string[];
};

type MockMetrics = {
  csrfTokenRequests: number;
  loginRequests: number;
  loginRequestsWithCsrfHeader: number;
};

const usersByRole: Record<AppRole, MockUser> = {
  student: {
    _id: 'user-student',
    email: 'student@learnspace.dev',
    firstName: 'Student',
    lastName: 'Tester',
    role: 'student',
  },
  instructor: {
    _id: 'user-instructor',
    email: 'instructor@learnspace.dev',
    firstName: 'Instructor',
    lastName: 'Tester',
    role: 'instructor',
  },
  admin: {
    _id: 'user-admin',
    email: 'admin@learnspace.dev',
    firstName: 'Admin',
    lastName: 'Tester',
    role: 'admin',
  },
  content_manager: {
    _id: 'user-content-manager',
    email: 'manager@learnspace.dev',
    firstName: 'Content',
    lastName: 'Manager',
    role: 'content_manager',
  },
};

const credentialsByRole: Record<AppRole, { email: string; password: string }> = {
  student: { email: 'student@learnspace.dev', password: 'Passw0rd!' },
  instructor: { email: 'instructor@learnspace.dev', password: 'Passw0rd!' },
  admin: { email: 'admin@learnspace.dev', password: 'Passw0rd!' },
  content_manager: { email: 'manager@learnspace.dev', password: 'Passw0rd!' },
};

const now = new Date('2026-01-15T10:00:00.000Z').toISOString();

function buildInitialState(): MockState {
  return {
    currentUser: null,
    sessionActive: false,
    failRefresh: false,
    forceLoginNetworkError: false,
    mediaFailureMode: 'none',
    csrfToken: 'playwright-csrf-token',
    pages: [
      {
        _id: 'page-1',
        title: 'Welcome Page',
        slug: 'welcome',
        status: 'published',
        type: 'page',
        content: '[]',
      },
      {
        _id: 'page-2',
        title: 'FAQ',
        slug: 'faq',
        status: 'draft',
        type: 'page',
        content: '[]',
      },
    ],
    media: [
      {
        _id: 'media-1',
        filename: 'hero-banner.png',
        originalName: 'hero-banner.png',
        mimetype: 'image/png',
        size: 1_000_000,
        url: 'https://cdn.learnspace.dev/media/hero-banner.png',
        createdAt: now,
      },
      {
        _id: 'media-2',
        filename: 'Guide.pdf',
        originalName: 'Guide.pdf',
        mimetype: 'application/pdf',
        size: 2_000_000,
        url: 'https://cdn.learnspace.dev/media/guide.pdf',
        createdAt: now,
      },
    ],
    courses: [
      {
        _id: 'course-react',
        title: 'React Foundations',
        description: 'Build modern React apps with confidence.',
        shortDescription: 'React fundamentals',
        slug: 'react-foundations',
        category: 'Development',
        level: 'beginner',
        instructor: 'Instructor Tester',
        pricing: { type: 'free', amount: 0 },
        rating: { average: 4.8, count: 124 },
        enrollmentCount: 1240,
        updatedAt: now,
      },
      {
        _id: 'course-design',
        title: 'UI Design Systems',
        description: 'Design polished, production-ready UI systems.',
        shortDescription: 'Design systems',
        slug: 'ui-design-systems',
        category: 'Design',
        level: 'intermediate',
        instructor: 'Instructor Tester',
        pricing: { type: 'paid', amount: 99 },
        rating: { average: 4.7, count: 64 },
        enrollmentCount: 640,
        updatedAt: now,
      },
      {
        _id: 'course-marketing',
        title: 'Growth Marketing Essentials',
        description: 'Drive measurable growth with modern funnels.',
        shortDescription: 'Marketing essentials',
        slug: 'growth-marketing-essentials',
        category: 'Marketing',
        level: 'advanced',
        instructor: 'Instructor Tester',
        pricing: { type: 'paid', amount: 129 },
        rating: { average: 4.6, count: 30 },
        enrollmentCount: 320,
        updatedAt: now,
      },
    ],
    createdCourseIds: [],
    enrollRequests: [],
  };
}

const toRoleFromEmail = (email: string): AppRole | null => {
  const normalized = email.trim().toLowerCase();
  if (normalized === usersByRole.student.email) return 'student';
  if (normalized === usersByRole.instructor.email) return 'instructor';
  if (normalized === usersByRole.admin.email) return 'admin';
  if (normalized === usersByRole.content_manager.email) return 'content_manager';
  return null;
};

const json = async (route: Route, status: number, body: unknown, extraHeaders?: Record<string, string>) => {
  await route.fulfill({
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
};

const unauthorized = async (route: Route) => {
  await json(route, 401, { message: 'Your session has expired. Please sign in again.' });
};

const studentDashboardPayload = {
  totalCourses: 3,
  averageProgress: 64,
  completedCourses: 1,
  certificatesEarned: 1,
  enrolledCourses: [
    { courseId: 'course-react', title: 'React Foundations', status: 'in_progress', progress: 72 },
    { courseId: 'course-design', title: 'UI Design Systems', status: 'in_progress', progress: 42 },
  ],
  activityFeed: [
    { title: 'Completed lesson: Components', time: 'Today', type: 'Completion' as const },
  ],
  badges: [
    { name: 'Fast Starter', description: 'Completed first module', color: '#10B981', awardedAt: now },
  ],
  momentumData: [
    { label: 'Mon', value: 2 },
    { label: 'Tue', value: 3 },
    { label: 'Wed', value: 4 },
  ],
  recommendedCourses: [
    { courseId: 'course-marketing', title: 'Growth Marketing Essentials', meta: 'Advanced • 8h', tag: 'Popular', enrollmentCount: 320 },
  ],
};

const instructorDashboardPayload = {
  totalCourses: 2,
  totalStudents: 214,
  averageCompletionRate: 81,
  averageRating: 4.7,
  courses: [
    { _id: 'course-react', title: 'React Foundations', enrollmentCount: 1240, rating: { average: 4.8 }, revenue: 120000 },
  ],
  recentEnrollments: [
    { enrollmentId: 'enroll-1', student: 'Pat Doe', studentInitials: 'PD', course: 'React Foundations', date: '2026-01-12', status: 'Active' },
  ],
  engagementMetrics: [
    { label: 'Messages answered', value: 82 },
    { label: 'Assignment completion', value: 76 },
  ],
};

const adminDashboardPayload = {
  totalUsers: 420,
  totalCourses: 18,
  totalEnrollments: 1900,
  totalContent: 44,
  pendingApprovals: 2,
  revenueData: [
    { month: 'Jan', revenue: 22 },
    { month: 'Feb', revenue: 24 },
  ],
  courseDistribution: [
    { label: 'Development', count: 9, pct: 50, color: '#3B82F6' },
    { label: 'Design', count: 5, pct: 28, color: '#10B981' },
  ],
  recentEnrollments: [
    { enrollmentId: 'enroll-1', student: 'Pat Doe', studentInitials: 'PD', course: 'React Foundations', date: '2026-01-12', status: 'Active', color: '#3B82F6' },
  ],
};

export class MockApp {
  readonly state = buildInitialState();
  readonly metrics: MockMetrics = {
    csrfTokenRequests: 0,
    loginRequests: 0,
    loginRequestsWithCsrfHeader: 0,
  };

  async install(page: Page) {
    await page.route('**/api/**', async (route) => {
      const request = route.request();
      const method = request.method();
      const url = new URL(request.url());
      const path = url.pathname;

      if (path === '/api/auth/csrf-token' && method === 'GET') {
        this.metrics.csrfTokenRequests += 1;
        await json(route, 200, { csrfToken: this.state.csrfToken }, { 'Set-Cookie': `csrfToken=${this.state.csrfToken}; Path=/` });
        return;
      }

      if (path === '/api/auth/login' && method === 'POST') {
        if (this.state.forceLoginNetworkError) {
          await route.abort('failed');
          return;
        }

        this.metrics.loginRequests += 1;
        if (request.headers()['x-csrf-token']) {
          this.metrics.loginRequestsWithCsrfHeader += 1;
        }

        const payload = (request.postDataJSON() || {}) as { email?: string; password?: string };
        const role = toRoleFromEmail(String(payload.email || ''));
        const password = String(payload.password || '');

        if (String(payload.email || '').toLowerCase() === 'expired@learnspace.dev') {
          this.state.currentUser = usersByRole.student;
          this.state.sessionActive = false;
          await json(route, 200, { message: 'Login successful', user: this.state.currentUser });
          return;
        }

        if (!role || password !== 'Passw0rd!') {
          await json(route, 401, { message: 'Invalid credentials' });
          return;
        }

        this.state.currentUser = usersByRole[role];
        this.state.sessionActive = true;
        await json(route, 200, { message: 'Login successful', user: this.state.currentUser });
        return;
      }

      if (path === '/api/auth/me' && method === 'GET') {
        if (!this.state.sessionActive || !this.state.currentUser) {
          await unauthorized(route);
          return;
        }
        await json(route, 200, this.state.currentUser);
        return;
      }

      if (path === '/api/auth/refresh-token' && method === 'POST') {
        if (this.state.failRefresh || !this.state.currentUser) {
          await json(route, 401, { message: 'Refresh token invalid or expired' });
          return;
        }
        this.state.sessionActive = true;
        await json(route, 200, { accessToken: 'refreshed-token' });
        return;
      }

      if (path === '/api/auth/logout' && method === 'POST') {
        this.state.currentUser = null;
        this.state.sessionActive = false;
        await json(route, 200, { message: 'Logged out successfully' });
        return;
      }

      if (path === '/api/notifications/me/unread-count' && method === 'GET') {
        await json(route, 200, { unreadCount: 3 });
        return;
      }

      if (path === '/api/dashboard/student' && method === 'GET') {
        if (!this.state.sessionActive || !this.state.currentUser) {
          await unauthorized(route);
          return;
        }
        await json(route, 200, studentDashboardPayload);
        return;
      }

      if (path === '/api/dashboard/instructor' && method === 'GET') {
        if (!this.state.sessionActive || !this.state.currentUser) {
          await unauthorized(route);
          return;
        }
        await json(route, 200, instructorDashboardPayload);
        return;
      }

      if (path === '/api/dashboard/admin' && method === 'GET') {
        if (!this.state.sessionActive || !this.state.currentUser) {
          await unauthorized(route);
          return;
        }
        await json(route, 200, adminDashboardPayload);
        return;
      }

      if (path === '/api/payments/instructor/revenue' && method === 'GET') {
        await json(route, 200, {
          monthlyRevenue: [
            { month: 'Jan', revenue: 12 },
            { month: 'Feb', revenue: 13 },
          ],
        });
        return;
      }

      if (path === '/api/payments/admin/revenue' && method === 'GET') {
        await json(route, 200, {
          totalRevenue: 125000,
          monthlyRevenue: [
            { month: 'Jan', revenue: 20 },
            { month: 'Feb', revenue: 24 },
          ],
        });
        return;
      }

      if (path === '/api/courses' && method === 'GET') {
        await json(route, 200, this.state.courses);
        return;
      }

      if (path === '/api/courses' && method === 'POST') {
        if (!this.state.sessionActive || !this.state.currentUser) {
          await unauthorized(route);
          return;
        }

        const createdId = `course-created-${this.state.createdCourseIds.length + 1}`;
        this.state.createdCourseIds.push(createdId);
        await json(route, 201, { _id: createdId });
        return;
      }

      if (/^\/api\/courses\/[^/]+\/modules$/.test(path) && method === 'POST') {
        await json(route, 201, { _id: `module-${Date.now()}` });
        return;
      }

      if (/^\/api\/courses\/modules\/[^/]+\/lessons$/.test(path) && method === 'POST') {
        await json(route, 201, { message: 'Lesson created' });
        return;
      }

      if (/^\/api\/courses\/[^/]+\/enroll$/.test(path) && method === 'POST') {
        if (!this.state.sessionActive || !this.state.currentUser) {
          await unauthorized(route);
          return;
        }
        const [, , , courseId] = path.split('/');
        this.state.enrollRequests.push(courseId);
        await json(route, 200, { message: 'Enrollment successful' });
        return;
      }

      if (path === '/api/content' && method === 'GET') {
        await json(route, 200, this.state.pages);
        return;
      }

      if (path === '/api/content/manage' && method === 'GET') {
        if (!this.state.sessionActive || !this.state.currentUser) {
          await unauthorized(route);
          return;
        }
        await json(route, 200, this.state.pages);
        return;
      }

      if (path === '/api/content' && method === 'POST') {
        const payload = (request.postDataJSON() || {}) as Partial<ManagedPage>;
        const created: ManagedPage = {
          _id: `page-${this.state.pages.length + 1}`,
          title: payload.title || 'Untitled page',
          slug: payload.slug || `page-${this.state.pages.length + 1}`,
          status: (payload.status as PageStatus) || 'draft',
          type: payload.type || 'page',
          content: typeof payload.content === 'string' ? payload.content : '[]',
          blocks: Array.isArray(payload.blocks) ? payload.blocks : [],
        };
        this.state.pages = [created, ...this.state.pages];
        await json(route, 201, created);
        return;
      }

      if (/^\/api\/content\/[^/]+$/.test(path) && method === 'PUT') {
        const id = path.split('/').pop() || '';
        const payload = (request.postDataJSON() || {}) as Partial<ManagedPage>;
        this.state.pages = this.state.pages.map((page) => (
          page._id === id
            ? {
              ...page,
              ...payload,
              status: (payload.status as PageStatus | undefined) ?? page.status,
            }
            : page
        ));

        const updated = this.state.pages.find((page) => page._id === id);
        await json(route, 200, updated || { message: 'Not found' });
        return;
      }

      if (/^\/api\/content\/[^/]+$/.test(path) && method === 'DELETE') {
        const id = path.split('/').pop() || '';
        this.state.pages = this.state.pages.filter((page) => page._id !== id);
        await json(route, 200, { message: 'Deleted', id });
        return;
      }

      if (path === '/api/content/media' && method === 'GET') {
        if (!this.state.sessionActive || !this.state.currentUser) {
          await unauthorized(route);
          return;
        }
        if (this.state.mediaFailureMode === 'server_error') {
          await json(route, 500, { message: 'Media service is temporarily unavailable. Please try again.' });
          return;
        }

        await json(route, 200, this.state.media);
        return;
      }

      if (/^\/api\/content\/media\/[^/]+$/.test(path) && method === 'PATCH') {
        const id = path.split('/').pop() || '';
        const payload = (request.postDataJSON() || {}) as { originalName?: string };

        this.state.media = this.state.media.map((item) => (
          item._id === id
            ? {
              ...item,
              originalName: payload.originalName || item.originalName,
              filename: payload.originalName || item.filename,
            }
            : item
        ));

        const updated = this.state.media.find((item) => item._id === id);
        await json(route, 200, updated || { message: 'Not found' });
        return;
      }

      if (/^\/api\/content\/media\/[^/]+$/.test(path) && method === 'DELETE') {
        const id = path.split('/').pop() || '';
        this.state.media = this.state.media.filter((item) => item._id !== id);
        await json(route, 200, { message: 'Deleted', id });
        return;
      }

      if (path === '/api/content/upload' && method === 'POST') {
        const created: MediaEntry = {
          _id: `media-${this.state.media.length + 1}`,
          filename: 'upload.png',
          originalName: 'upload.png',
          mimetype: 'image/png',
          size: 300_000,
          url: 'https://cdn.learnspace.dev/media/upload.png',
          createdAt: now,
        };
        this.state.media = [created, ...this.state.media];
        await json(route, 201, created);
        return;
      }

      if (path === '/api/admin/users' && method === 'GET') {
        if (!this.state.sessionActive || !this.state.currentUser) {
          await unauthorized(route);
          return;
        }
        await json(route, 200, []);
        return;
      }

      if (path === '/api/users/me' && method === 'PATCH') {
        if (!this.state.currentUser) {
          await unauthorized(route);
          return;
        }
        const payload = (request.postDataJSON() || {}) as Partial<MockUser>;
        this.state.currentUser = { ...this.state.currentUser, ...payload };
        await json(route, 200, this.state.currentUser);
        return;
      }

      if (path === '/api/users/me/avatar' && method === 'POST') {
        await json(route, 200, { user: this.state.currentUser, avatar: 'https://cdn.learnspace.dev/avatar.png' });
        return;
      }

      if (path === '/api/users/me/password' && method === 'PATCH') {
        await json(route, 200, { message: 'Password updated successfully.' });
        return;
      }

      await json(route, 404, { message: `Unhandled API route: ${method} ${path}` });
    });
  }

  setSessionActive(active: boolean) {
    this.state.sessionActive = active;
  }

  setRefreshFailure(shouldFail: boolean) {
    this.state.failRefresh = shouldFail;
  }

  setLoginNetworkFailure(shouldFail: boolean) {
    this.state.forceLoginNetworkError = shouldFail;
  }

  setMediaFailureMode(mode: 'none' | 'server_error') {
    this.state.mediaFailureMode = mode;
  }

  async loginAs(page: Page, role: AppRole) {
    const creds = credentialsByRole[role];
    await this.loginWithCredentials(page, creds.email, creds.password);
  }

  async loginWithCredentials(page: Page, email: string, password: string) {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
  }
}

export const createMockApp = () => new MockApp();
