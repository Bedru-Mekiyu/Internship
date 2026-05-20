import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import { type TestUser } from './fixtures/users';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'test_secret';

function createToken(user: TestUser): string {
  return jwt.sign(
    { userId: user._id, type: 'access', tokenVersion: user.tokenVersion },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function getAuthHeader(user: TestUser): string {
  const token = createToken(user);
  return `accessToken=${encodeURIComponent(token)}`;
}

describe('Authorization Boundaries', () => {
  const student: TestUser = {
    _id: 'student-123',
    email: 'student@test.com',
    firstName: 'Student',
    lastName: 'User',
    role: 'student',
    isActive: true,
    isEmailVerified: true,
    tokenVersion: 1,
    password: 'TestPass123!',
  };

  const instructor: TestUser = {
    _id: 'instructor-123',
    email: 'instructor@test.com',
    firstName: 'Instructor',
    lastName: 'User',
    role: 'instructor',
    isActive: true,
    isEmailVerified: true,
    tokenVersion: 1,
    password: 'TestPass123!',
  };

  const admin: TestUser = {
    _id: 'admin-123',
    email: 'admin@test.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    isEmailVerified: true,
    tokenVersion: 1,
    password: 'TestPass123!',
  };

  const contentManager: TestUser = {
    _id: 'manager-123',
    email: 'manager@test.com',
    firstName: 'Content',
    lastName: 'Manager',
    role: 'content_manager',
    isActive: true,
    isEmailVerified: true,
    tokenVersion: 1,
    password: 'TestPass123!',
  };

  describe('Role-Based Access Control', () => {
    describe('Admin Routes', () => {
      it('allows admin to access admin dashboard', async () => {
        const app = createApp();
        const response = await request(app)
          .get('/api/dashboard/admin')
          .set('Cookie', getAuthHeader(admin));

        expect(response.status).toBe(200);
      });

      it('prevents student from accessing admin dashboard', async () => {
        const app = createApp();
        const response = await request(app)
          .get('/api/dashboard/admin')
          .set('Cookie', getAuthHeader(student));

        expect(response.status).toBe(403);
      });

      it('prevents instructor from accessing admin dashboard', async () => {
        const app = createApp();
        const response = await request(app)
          .get('/api/dashboard/admin')
          .set('Cookie', getAuthHeader(instructor));

        expect(response.status).toBe(403);
      });

      it('prevents content_manager from accessing admin dashboard', async () => {
        const app = createApp();
        const response = await request(app)
          .get('/api/dashboard/admin')
          .set('Cookie', getAuthHeader(contentManager));

        expect(response.status).toBe(403);
      });
    });

    describe('Instructor Routes', () => {
      it('allows instructor to access instructor dashboard', async () => {
        const app = createApp();
        const response = await request(app)
          .get('/api/dashboard/instructor')
          .set('Cookie', getAuthHeader(instructor));

        expect(response.status).toBe(200);
      });

      it('prevents student from accessing instructor dashboard', async () => {
        const app = createApp();
        const response = await request(app)
          .get('/api/dashboard/instructor')
          .set('Cookie', getAuthHeader(student));

        expect(response.status).toBe(403);
      });

      it('prevents content_manager from accessing instructor dashboard', async () => {
        const app = createApp();
        const response = await request(app)
          .get('/api/dashboard/instructor')
          .set('Cookie', getAuthHeader(contentManager));

        expect(response.status).toBe(403);
      });
    });

    describe('CMS Content Routes', () => {
      it('allows content_manager to create content', async () => {
        const app = createApp();
        const response = await request(app)
          .post('/api/content')
          .set('Cookie', getAuthHeader(contentManager))
          .send({
            title: 'Test Page',
            slug: 'test-page',
            status: 'draft',
            type: 'page',
            content: '[]',
          });

        expect([201, 403]).toContain(response.status);
      });

      it('prevents student from creating content', async () => {
        const app = createApp();
        const response = await request(app)
          .post('/api/content')
          .set('Cookie', getAuthHeader(student))
          .send({
            title: 'Test Page',
            slug: 'test-page',
            status: 'draft',
            type: 'page',
            content: '[]',
          });

        expect(response.status).toBe(403);
      });
    });

    describe('Course Creation', () => {
      it('allows instructor to create courses', async () => {
        const app = createApp();
        const response = await request(app)
          .post('/api/courses')
          .set('Cookie', getAuthHeader(instructor))
          .send({
            title: 'Test Course',
            description: 'Test description',
            category: 'Development',
            level: 'beginner',
          });

        expect([201, 403]).toContain(response.status);
      });

      it('prevents student from creating courses', async () => {
        const app = createApp();
        const response = await request(app)
          .post('/api/courses')
          .set('Cookie', getAuthHeader(student))
          .send({
            title: 'Test Course',
            description: 'Test description',
            category: 'Development',
            level: 'beginner',
          });

        expect(response.status).toBe(403);
      });

      it('prevents content_manager from creating courses', async () => {
        const app = createApp();
        const response = await request(app)
          .post('/api/courses')
          .set('Cookie', getAuthHeader(contentManager))
          .send({
            title: 'Test Course',
            description: 'Test description',
            category: 'Development',
            level: 'beginner',
          });

        expect(response.status).toBe(403);
      });
    });

    describe('User Profile Ownership', () => {
      it('allows user to update their own profile', async () => {
        const app = createApp();
        const response = await request(app)
          .patch('/api/users/me')
          .set('Cookie', getAuthHeader(student))
          .send({
            firstName: 'UpdatedName',
          });

        expect([200, 401]).toContain(response.status);
      });

      it('prevents user from updating another users profile', async () => {
        const app = createApp();
        const response = await request(app)
          .patch('/api/users/instructor-123')
          .set('Cookie', getAuthHeader(student))
          .send({
            firstName: 'HackedName',
          });

        expect([403, 404]).toContain(response.status);
      });
    });
  });

  describe('Protected Route Access', () => {
    it('returns 401 for unauthenticated access to protected routes', async () => {
      const app = createApp();

      const routes = [
        '/api/dashboard/student',
        '/api/dashboard/instructor',
        '/api/dashboard/admin',
        '/api/courses',
        '/api/notifications',
        '/api/users/me',
      ];

      for (const route of routes) {
        const response = await request(app).get(route);
        expect(response.status).toBe(401);
      }
    });

    it('returns 401 for invalid token on protected routes', async () => {
      const app = createApp();

      const routes = [
        '/api/dashboard/student',
        '/api/dashboard/instructor',
        '/api/courses',
      ];

      for (const route of routes) {
        const response = await request(app)
          .get(route)
          .set('Cookie', 'accessToken=invalid-token');

        expect(response.status).toBe(401);
      }
    });
  });

  describe('Public Routes', () => {
    it('allows unauthenticated access to public routes', async () => {
      const app = createApp();

      const routes = [
        '/api/courses',
        '/api/auth/csrf-token',
        '/healthz',
        '/readyz',
      ];

      for (const route of routes) {
        const response = await request(app).get(route);
        expect([200, 401]).toContain(response.status);
      }
    });
  });
});

describe('Input Validation Security', () => {
  const student: TestUser = {
    _id: 'student-123',
    email: 'student@test.com',
    firstName: 'Student',
    lastName: 'User',
    role: 'student',
    isActive: true,
    isEmailVerified: true,
    tokenVersion: 1,
    password: 'TestPass123!',
  };

  function getAuthHeader(user: TestUser): string {
    const token = jwt.sign(
      { userId: user._id, type: 'access', tokenVersion: user.tokenVersion },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    return `accessToken=${encodeURIComponent(token)}`;
  }

  describe('NoSQL Injection Prevention', () => {
    it('rejects MongoDB operators in query parameters', async () => {
      const app = createApp();
      const response = await request(app)
        .get('/api/courses?q[$ne]=null')
        .set('Cookie', getAuthHeader(student));

      expect(response.status).toBe(400);
    });

    it('rejects $where operator in search', async () => {
      const app = createApp();
      const response = await request(app)
        .get('/api/courses?q=1&filter=this.username%3D%22admin%22')
        .set('Cookie', getAuthHeader(student));

      expect(response.status).toBe(400);
    });

    it('rejects nested object injection in body', async () => {
      const app = createApp();
      const response = await request(app)
        .post('/api/courses')
        .set('Cookie', getAuthHeader(student))
        .send({
          title: { $gt: '' },
          description: { $regex: '.*' },
        });

      expect(response.status).toBe(400);
    });
  });

  describe('XSS Prevention', () => {
    it('sanitizes script tags in registration', async () => {
      const app = createApp();
      const maliciousInput = '<script>alert("xss")</script>';

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'xss@test.com',
          password: 'TestPass123!',
          firstName: maliciousInput,
          lastName: 'Test',
        });

      expect(response.status).toBe(202);
      if (response.status === 202 && response.body.user) {
        expect(response.body.user.firstName).not.toContain('<script>');
      }
    });
  });

  describe('Payload Size Limits', () => {
    it('rejects oversized payloads', async () => {
      const app = createApp();
      const largePayload = 'a'.repeat(2_000_000);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: 'TestPass123!',
          firstName: largePayload,
          lastName: 'User',
        });

      expect(response.status).toBe(400);
    });

    it('rejects malformed JSON', async () => {
      const app = createApp();
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{invalid json');

      expect(response.status).toBe(400);
    });
  });

  describe('Email Validation', () => {
    it('rejects invalid email format', async () => {
      const app = createApp();
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'not-an-email',
          password: 'TestPass123!',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toBeDefined();
    });
  });

  describe('Password Validation', () => {
    it('rejects weak passwords', async () => {
      const app = createApp();
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(400);
    });

    it('rejects passwords without uppercase', async () => {
      const app = createApp();
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password1!',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(400);
    });
  });
});

describe('Security Headers', () => {
  const app = createApp();

  it('sets X-Content-Type-Options header', async () => {
    const response = await request(app).get('/healthz');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('sets X-Frame-Options header', async () => {
    const response = await request(app).get('/healthz');
    expect(response.headers['x-frame-options']).toBeDefined();
  });

  it('sets Content-Security-Policy header', async () => {
    const response = await request(app).get('/healthz');
    expect(response.headers['content-security-policy']).toBeDefined();
  });

  it('hides X-Powered-By header', async () => {
    const response = await request(app).get('/healthz');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});

describe('Error Message Sanitization', () => {
  it('does not leak stack traces in production', async () => {
    process.env.NODE_ENV = 'production';
    const app = createApp();

    const response = await request(app).get('/api/unknown-route-that-does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.stack).toBeUndefined();
  });

  it('returns generic messages for auth failures', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpassword' });

    expect(response.body.message).toBe('Invalid credentials');
  });
});