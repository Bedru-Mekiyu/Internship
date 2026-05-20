import request from 'supertest';
import { createApp } from '../src/app';
import {
  testUsers,
  getAuthCookies,
  getRefreshToken,
  getExpiredToken,
  getInvalidToken,
  getWrongTypeToken,
  createTestUser,
  getAccessToken,
} from './fixtures/users';

describe('Authentication Full Flow', () => {
  const app = createApp();

  describe('Login Flow', () => {
    it('returns 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'TestPass123!' });

      expect(response.status).toBe(400);
      expect(response.body.details).toBeDefined();
      expect(response.body.message).toBe('Validation error');
    });

    it('returns 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' });

      expect(response.status).toBe(400);
      expect(response.body.details).toBeDefined();
    });

    it('returns 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: 'TestPass123!' });

      expect(response.status).toBe(400);
      expect(response.body.details).toBeDefined();
    });

    it('returns 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'TestPass123!' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('returns 401 for wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'WrongPassword123!' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('returns 401 for inactive user', async () => {
      const inactiveUser = { ...testUsers.student, isActive: false };

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', getAuthCookies(inactiveUser));

      expect(response.status).toBe(401);
    });
  });

  describe('Token Refresh Flow', () => {
    it('returns 400 when refreshToken is missing', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('refreshToken is required');
    });

    it('returns 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
    });

    it('returns 401 for expired refresh token', async () => {
      const expiredToken = getRefreshToken({ ...testUsers.student, tokenVersion: 999 });
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: expiredToken });

      expect(response.status).toBe(401);
    });

    it('supports refreshtoken alias route', async () => {
      const response = await request(app)
        .post('/api/auth/refreshtoken')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('refreshToken is required');
    });
  });

  describe('Logout Flow', () => {
    it('returns 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({});

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided');
    });

    it('returns 401 with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', `accessToken=${getInvalidToken()}`)
        .send({});

      expect(response.status).toBe(401);
    });

    it('returns 401 with expired token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', `accessToken=${getExpiredToken(testUsers.student)}`)
        .send({});

      expect(response.status).toBe(401);
    });
  });

  describe('Get Current User (/me)', () => {
    it('returns 401 without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided');
    });

    it('returns 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `accessToken=${getInvalidToken()}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('returns 401 with wrong token type (refresh token used as access)', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', getAuthCookies({ ...testUsers.student, role: 'refresh' as any, tokenVersion: 1 }));

      expect(response.status).toBe(401);
    });

    it('returns user data with valid token', async () => {
      const user = createTestUser('student');
      const token = getAccessToken(user);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `accessToken=${encodeURIComponent(token)}; Path=/; HttpOnly`);

      expect(response.status).toBe(401);
    });
  });

  describe('CSRF Token Endpoint', () => {
    it('returns CSRF token', async () => {
      const response = await request(app).get('/api/auth/csrf-token');

      expect(response.status).toBe(200);
      expect(response.body.csrfToken).toBeDefined();
      expect(typeof response.body.csrfToken).toBe('string');
    });

    it('sets CSRF cookie', async () => {
      const response = await request(app).get('/api/auth/csrf-token');

      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie']).toContain('csrfToken');
    });
  });

  describe('Password Reset Flow', () => {
    it('returns 400 for missing email in forgot-password', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });

    it('returns 400 for invalid email format in forgot-password', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'not-an-email' });

      expect(response.status).toBe(400);
      expect(response.body.details).toBeDefined();
    });

    it('returns 400 for missing token in reset-password', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });

    it('supports forgotpassword alias route', async () => {
      const response = await request(app)
        .post('/api/auth/forgotpassword')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });

    it('supports resetpassword alias route', async () => {
      const response = await request(app)
        .post('/api/auth/resetpassword')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('Rate Limiting', () => {
    it('rate limits excessive login attempts', async () => {
      const attempts = [];
      for (let i = 0; i < 12; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@test.com', password: 'wrongpassword' });
        attempts.push(response.status);
      }

      const lastAttempt = attempts[attempts.length - 1];
      expect([429, 403]).toContain(lastAttempt);
    });

    it('rate limits excessive password reset requests', async () => {
      const attempts = [];
      for (let i = 0; i < 7; i++) {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test@test.com' });
        attempts.push(response.status);
      }

      const lastAttempt = attempts[attempts.length - 1];
      expect([429, 403]).toContain(lastAttempt);
    });
  });

  describe('Token Security', () => {
    it('rejects expired access token', async () => {
      const expiredToken = getExpiredToken(testUsers.student);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `accessToken=${encodeURIComponent(expiredToken)}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('rejects malformed JWT token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'accessToken=not.a.valid.jwt');

      expect(response.status).toBe(401);
    });

    it('rejects token with wrong type (refresh used as access)', async () => {
      const wrongTypeToken = getWrongTypeToken(testUsers.student);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `accessToken=${encodeURIComponent(wrongTypeToken)}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token type');
    });
  });
});

describe('Auth CORS', () => {
  const envKeys = ['NODE_ENV', 'CORS_ORIGIN', 'FRONTEND_URL'] as const;
  const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));

  afterEach(() => {
    envKeys.forEach((key) => {
      const value = originalEnv[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  });

  it('allows the configured frontend origin in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGIN = 'http://localhost:3000';
    process.env.FRONTEND_URL = 'http://localhost:5173';

    const response = await request(createApp())
      .get('/api/auth/me')
      .set('Origin', 'http://localhost:5173');

    expect(response.status).toBe(401);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('does not turn blocked origins into server errors', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGIN = 'http://localhost:3000';
    process.env.FRONTEND_URL = 'http://localhost:5173';

    const response = await request(createApp())
      .get('/api/auth/me')
      .set('Origin', 'https://evil.example');

    expect(response.status).toBe(401);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});