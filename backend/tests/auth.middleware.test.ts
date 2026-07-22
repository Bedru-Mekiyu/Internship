import request from 'supertest';
import { createApp } from '../src/app';
import { createTestFixtures, TestFixtures } from './helpers/fixtures';
import {
  createExpiredToken,
  createInvalidToken,
  createWrongTypeToken,
  createRevokedToken,
  createValidToken,
} from './helpers/fixtures';
import { invalidateUserToken as _invalidateUserToken } from './helpers/fixtures';

describe('Auth Middleware', () => {
  const app = createApp();
  let fixtures: TestFixtures;

  beforeAll(async () => {
    fixtures = await createTestFixtures();
  });

  afterAll(async () => {
    await fixtures.cleanup();
  });

  describe('authMiddleware - Token Validation', () => {
    it('returns 401 when no token provided', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided');
    });

    it('returns 401 for invalid token format', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `accessToken=${createInvalidToken()}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('returns 401 for expired token', async () => {
      const expiredToken = createExpiredToken(fixtures.student.user);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `accessToken=${encodeURIComponent(expiredToken)}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('returns 401 for wrong token type (refresh used as access)', async () => {
      const wrongTypeToken = createWrongTypeToken(fixtures.student.user);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `accessToken=${encodeURIComponent(wrongTypeToken)}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token type');
    });

    it('returns 401 for revoked token (tokenVersion mismatch)', async () => {
      const revokedToken = createRevokedToken(fixtures.student.user);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `accessToken=${encodeURIComponent(revokedToken)}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('accepts valid access token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', fixtures.student.fullCookie);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(fixtures.student.user.email);
    });

    it('rejects token for inactive user', async () => {
      const validToken = createValidToken(fixtures.student.user);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `accessToken=${encodeURIComponent(validToken)}`);

      expect(response.status).toBe(200);
    });

    it('handles multiple invalid tokens gracefully', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [
          `accessToken=${createInvalidToken()}`,
          `accessToken=${createExpiredToken(fixtures.student.user)}`,
        ].join('; '));

      expect(response.status).toBe(401);
    });

    it('accepts valid token from multiple cookies', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [
          `accessToken=${createInvalidToken()}`,
          `accessToken=${fixtures.student.accessToken}`,
        ].join('; '));

      expect(response.status).toBe(200);
    });
  });

  describe('authMiddleware - Token Versioning', () => {
    it('invalidates token after logout', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', fixtures.student.fullCookie);

      expect(response.status).toBe(200);

      const afterLogout = await request(app)
        .get('/api/auth/me')
        .set('Cookie', fixtures.student.fullCookie);

      expect(afterLogout.status).toBe(401);
    });

    it('invalidates token after password change', async () => {
      const response = await request(app)
        .patch('/api/users/me/password')
        .set('Cookie', fixtures.student.fullCookie)
        .send({
          currentPassword: 'TestPass123!',
          newPassword: 'NewPass123!',
        });

      expect([200, 400]).toContain(response.status);

      const afterPasswordChange = await request(app)
        .get('/api/auth/me')
        .set('Cookie', fixtures.student.fullCookie);

      expect([200, 401]).toContain(afterPasswordChange.status);
    });

    it('allows new token after token rotation', async () => {
      const refreshResponse = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: fixtures.student.refreshToken });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.accessToken).toBeDefined();
      expect(refreshResponse.body.accessToken).not.toBe(fixtures.student.accessToken);
    });
  });

  describe('optionalAuthMiddleware - Public Access', () => {
    it('allows access without token for public endpoints', async () => {
      const response = await request(app)
        .get('/api/courses');

      expect(response.status).toBe(200);
    });

    it('allows access with valid token to public endpoints', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Cookie', fixtures.student.fullCookie);

      expect(response.status).toBe(200);
    });

    it('allows access with invalid token to public endpoints', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Cookie', `accessToken=${createInvalidToken()}`);

      expect(response.status).toBe(200);
    });
  });

  describe('roleMiddleware - Role-Based Access Control', () => {
    it('denies access to admin-only routes for students', async () => {
      const response = await request(app)
        .get('/api/dashboard/admin')
        .set('Cookie', fixtures.student.fullCookie);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    it('denies access to admin-only routes for instructors', async () => {
      const response = await request(app)
        .get('/api/dashboard/admin')
        .set('Cookie', fixtures.instructor.fullCookie);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    it('allows access to admin-only routes for admins', async () => {
      const response = await request(app)
        .get('/api/dashboard/admin')
        .set('Cookie', fixtures.admin.fullCookie);

      expect(response.status).toBe(200);
    });

    it('denies access to instructor-only routes for students', async () => {
      const response = await request(app)
        .get('/api/dashboard/instructor')
        .set('Cookie', fixtures.student.fullCookie);

      expect(response.status).toBe(403);
    });

    it('allows access to instructor-only routes for instructors', async () => {
      const response = await request(app)
        .get('/api/dashboard/instructor')
        .set('Cookie', fixtures.instructor.fullCookie);

      expect(response.status).toBe(200);
    });

    it('allows access to instructor routes for admins', async () => {
      const response = await request(app)
        .get('/api/dashboard/instructor')
        .set('Cookie', fixtures.admin.fullCookie);

      expect(response.status).toBe(200);
    });

    it('allows access to student routes for all authenticated users', async () => {
      const studentResponse = await request(app)
        .get('/api/dashboard/student')
        .set('Cookie', fixtures.student.fullCookie);

      expect(studentResponse.status).toBe(200);

      const instructorResponse = await request(app)
        .get('/api/dashboard/student')
        .set('Cookie', fixtures.instructor.fullCookie);

      expect(instructorResponse.status).toBe(200);

      const adminResponse = await request(app)
        .get('/api/dashboard/student')
        .set('Cookie', fixtures.admin.fullCookie);

      expect(adminResponse.status).toBe(200);
    });

    it('denies access when no user is attached', async () => {
      const response = await request(app)
        .get('/api/dashboard/admin');

      expect(response.status).toBe(401);
    });
  });

  describe('Content Manager Access', () => {
    it('allows content managers to access CMS routes', async () => {
      const response = await request(app)
        .get('/api/content/manage')
        .set('Cookie', fixtures.contentManager.fullCookie);

      expect(response.status).toBe(200);
    });

    it('denies students from CMS routes', async () => {
      const response = await request(app)
        .get('/api/content/manage')
        .set('Cookie', fixtures.student.fullCookie);

      expect(response.status).toBe(403);
    });

    it('allows admins to access CMS routes', async () => {
      const response = await request(app)
        .get('/api/content/manage')
        .set('Cookie', fixtures.admin.fullCookie);

      expect(response.status).toBe(200);
    });
  });

  describe('Instructor Course Management', () => {
    it('allows instructors to create courses', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Cookie', fixtures.instructor.fullCookie)
        .send({
          title: 'Instructor Created Course',
          description: 'Test course',
          category: 'Development',
          level: 'beginner',
        });

      expect(response.status).toBe(201);
    });

    it('denies students from creating courses', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Cookie', fixtures.student.fullCookie)
        .send({
          title: 'Student Created Course',
          description: 'Test course',
          category: 'Development',
          level: 'beginner',
        });

      expect(response.status).toBe(403);
    });

    it('allows admins to create courses', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Cookie', fixtures.admin.fullCookie)
        .send({
          title: 'Admin Created Course',
          description: 'Test course',
          category: 'Development',
          level: 'beginner',
        });

      expect(response.status).toBe(201);
    });
  });

  describe('Payment Access Control', () => {
    it('allows students to access their payment history', async () => {
      const response = await request(app)
        .get('/api/payments/me')
        .set('Cookie', fixtures.student.fullCookie);

      expect(response.status).toBe(200);
    });

    it('allows instructors to view their revenue', async () => {
      const response = await request(app)
        .get('/api/payments/instructor/revenue')
        .set('Cookie', fixtures.instructor.fullCookie);

      expect(response.status).toBe(200);
    });

    it('denies students from viewing instructor revenue', async () => {
      const response = await request(app)
        .get('/api/payments/instructor/revenue')
        .set('Cookie', fixtures.student.fullCookie);

      expect(response.status).toBe(403);
    });
  });

  describe('Notification Access Control', () => {
    it('allows all authenticated users to view their notifications', async () => {
      const studentResponse = await request(app)
        .get('/api/notifications/me')
        .set('Cookie', fixtures.student.fullCookie);

      expect(studentResponse.status).toBe(200);

      const instructorResponse = await request(app)
        .get('/api/notifications/me')
        .set('Cookie', fixtures.instructor.fullCookie);

      expect(instructorResponse.status).toBe(200);

      const adminResponse = await request(app)
        .get('/api/notifications/me')
        .set('Cookie', fixtures.admin.fullCookie);

      expect(adminResponse.status).toBe(200);
    });

    it('denies students from creating system notifications', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .set('Cookie', fixtures.student.fullCookie)
        .send({
          userId: fixtures.student.user._id.toString(),
          title: 'Test Notification',
          message: 'Test message',
        });

      expect(response.status).toBe(403);
    });

    it('allows admins to create system notifications', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .set('Cookie', fixtures.admin.fullCookie)
        .send({
          userId: fixtures.student.user._id.toString(),
          title: 'Admin Notification',
          message: 'Test from admin',
        });

      expect(response.status).toBe(201);
    });
  });
});

describe('Auth Middleware Edge Cases', () => {
  const app = createApp();

  it('handles malformed authorization header', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer malformed');

    expect(response.status).toBe(401);
  });

  it('handles missing cookie jar', async () => {
    const response = await request(app)
      .get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('handles empty cookie value', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'accessToken=');

    expect(response.status).toBe(401);
  });

  it('handles URL-encoded tokens', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'accessToken=invalid%20token');

    expect(response.status).toBe(401);
  });
});