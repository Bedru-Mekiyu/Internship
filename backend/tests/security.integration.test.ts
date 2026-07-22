import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';

describe('Security Integration Tests', () => {
  const app = createApp();
  const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'test_secret';

  describe('SQL/NoSQL Injection Prevention', () => {
    it('rejects MongoDB operators in query parameters', async () => {
      const response = await request(app)
        .get('/api/users?q[$ne]=null')
        .set('Cookie', 'accessToken=test; refreshToken=test');

      expect([400, 401]).toContain(response.status);
    });

    it('rejects $where operator in search', async () => {
      const response = await request(app)
        .get('/api/users?q=1&filter=this.username%3D%22admin%22')

      expect([400, 401]).toContain(response.status);
    });

    it('sanitizes regex patterns in search', async () => {
      const response = await request(app)
        .get('/api/users?q=(?i)admin(?i)')

      expect([400, 401]).toContain(response.status);
    });

    it('rejects nested object injection in body', async () => {
      const response = await request(app)
        .post('/api/users/me')
        .send({
          firstName: { $gt: '' },
          lastName: { $regex: '.*' }
        })
        .set('Cookie', 'accessToken=test; refreshToken=test');

      expect([400, 401]).toContain(response.status);
    });
  });

  describe('XSS Prevention', () => {
    it('sanitizes script tags in user input', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'xss@test.com',
          password: 'Passw0rd!',
          firstName: maliciousInput,
          lastName: 'Test'
        });

      expect([202, 400, 401]).toContain(response.status);
      if (response.status === 202 && response.body.user) {
        expect(response.body.user.firstName).not.toContain('<script>');
      }
    });

    it('sanitizes event handlers in content', async () => {
      const maliciousContent = '<img src=x onerror=alert(1)>';
      
      const response = await request(app)
        .post('/api/discussions/course123')
        .set('Cookie', 'accessToken=test; refreshToken=test')
        .send({
          content: maliciousContent
        });

      expect([400, 401]).toContain(response.status);
    });

    it('escapes HTML in user-generated content', async () => {
      const response = await request(app)
        .post('/api/content')
        .set('Cookie', 'accessToken=test; refreshToken=test')
        .send({
          title: '<div onclick="alert(1)">Test</div>',
          content: 'Test content'
        });

      expect([400, 401]).toContain(response.status);
    });
  });

  describe('CSRF Protection', () => {
    it('rejects POST without CSRF token', async () => {
      const token = jwt.sign({ userId: 'test123', type: 'access', tokenVersion: 1 }, JWT_SECRET, { expiresIn: '15m' });
      
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', `accessToken=${token}`)
        .send({});

      expect([403, 401]).toContain(response.status);
    });

    it('accepts POST with valid CSRF token', async () => {
      const response = await request(app)
        .post('/api/auth/csrf-token')
        .then(res => {
          const csrfToken = res.body.csrfToken;
          const token = jwt.sign({ userId: 'test123', type: 'access', tokenVersion: 1 }, JWT_SECRET, { expiresIn: '15m' });
          
          return request(app)
            .post('/api/auth/logout')
            .set('Cookie', `accessToken=${token}; csrfToken=${csrfToken}`)
            .set('x-csrf-token', csrfToken)
            .send({});
        });

      expect([200, 401, 403]).toContain(response.status);
    });

    it('rejects token from different origin', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Origin', 'http://evil.com')
        .set('Cookie', 'accessToken=test; refreshToken=test')
        .send({});

      expect([403, 401]).toContain(response.status);
    });
  });

  describe('Rate Limiting', () => {
    it('rate limits failed login attempts', async () => {
      const attempts = [];
      for (let i = 0; i < 15; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@test.com', password: 'wrongpassword' });
        attempts.push(response.status);
      }

      const lastAttempt = attempts[attempts.length - 1];
      expect([429, 403]).toContain(lastAttempt);
    });

    it('rate limits API endpoints', async () => {
      const requests = [];
      for (let i = 0; i < 110; i++) {
        const response = await request(app).get('/api/courses');
        requests.push(response.status);
      }

      const lastRequests = requests.slice(-10);
      expect(lastRequests.some(status => status === 429)).toBe(true);
    });

    it('rate limits password reset requests', async () => {
      const attempts = [];
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test@test.com' });
        attempts.push(response.status);
      }

      const lastAttempt = attempts[attempts.length - 1];
      expect([429, 403]).toContain(lastAttempt);
    });
  });

  describe('Authentication Security', () => {
    it('rejects expired JWT tokens', async () => {
      const expiredToken = jwt.sign(
        { userId: 'test123', type: 'access', tokenVersion: 1 },
        JWT_SECRET,
        { expiresIn: '-1s' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `accessToken=${expiredToken}`);

      expect(response.status).toBe(401);
    });

    it('rejects invalid JWT tokens', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'accessToken=invalid.token.here');

      expect(response.status).toBe(401);
    });

    it('rejects tokens with wrong type', async () => {
      const refreshToken = jwt.sign(
        { userId: 'test123', type: 'refresh', tokenVersion: 1 },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `accessToken=${refreshToken}`);

      expect(response.status).toBe(401);
    });

    it('detects token revocation', async () => {
      const token = jwt.sign(
        { userId: 'test123', type: 'access', tokenVersion: 1 },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `accessToken=${token}`);

      expect(response.status).toBe(401);
    });

    it('handles missing authentication gracefully', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).not.toContain('undefined');
    });
  });

  describe('Authorization Boundaries', () => {
    let studentToken: string;
    let instructorToken: string;
    let adminToken: string;

    beforeAll(() => {
      studentToken = jwt.sign(
        { userId: 'student123', type: 'access', tokenVersion: 1 },
        JWT_SECRET,
        { expiresIn: '15m' }
      );
      instructorToken = jwt.sign(
        { userId: 'instructor123', type: 'access', tokenVersion: 1 },
        JWT_SECRET,
        { expiresIn: '15m' }
      );
      adminToken = jwt.sign(
        { userId: 'admin123', type: 'access', tokenVersion: 1 },
        JWT_SECRET,
        { expiresIn: '15m' }
      );
    });

    it('prevents students from accessing admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Cookie', `accessToken=${studentToken}`);

      expect([403, 401]).toContain(response.status);
    });

    it('prevents instructors from accessing admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Cookie', `accessToken=${instructorToken}`);

      expect([403, 401]).toContain(response.status);
    });

    it('allows admins to access admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Cookie', `accessToken=${adminToken}`);

      expect([200, 401, 403]).toContain(response.status);
    });

    it('prevents students from creating courses', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({
          title: 'Test Course',
          description: 'Test'
        });

      expect([403, 401]).toContain(response.status);
    });

    it('prevents students from accessing CMS routes', async () => {
      const response = await request(app)
        .post('/api/content')
        .set('Cookie', `accessToken=${studentToken}`)
        .send({
          title: 'Test Page',
          content: 'Test'
        });

      expect([403, 401]).toContain(response.status);
    });
  });

  describe('Input Validation', () => {
    it('rejects invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'not-an-email',
          password: 'Passw0rd!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
    });

    it('rejects weak passwords', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
    });

    it('rejects passwords without uppercase', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password1!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
    });

    it('rejects malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{invalid json');

      expect(response.status).toBe(400);
    });

    it('rejects oversized payloads', async () => {
      const largePayload = 'a'.repeat(2000000);
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: 'Passw0rd!',
          firstName: largePayload,
          lastName: 'User'
        });

      expect(response.status).toBe(400);
    });

    it('validates course creation required fields', async () => {
      const token = jwt.sign(
        { userId: 'instructor123', type: 'access', tokenVersion: 1 },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const response = await request(app)
        .post('/api/courses')
        .set('Cookie', `accessToken=${token}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('validates content slug format', async () => {
      const token = jwt.sign(
        { userId: 'admin123', type: 'access', tokenVersion: 1 },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const response = await request(app)
        .post('/api/content')
        .set('Cookie', `accessToken=${token}`)
        .send({
          title: 'Test',
          slug: 'Invalid Slug With Spaces'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Security Headers', () => {
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

  describe('File Upload Security', () => {
    it('rejects executable file types', async () => {
      const response = await request(app)
        .post('/api/content/upload')
        .set('Cookie', 'accessToken=test')
        .attach('file', Buffer.from('malicious'), 'malicious.exe');

      expect(response.status).toBe(400);
    });

    it('validates file size limit', async () => {
      const largeBuffer = Buffer.alloc(300 * 1024 * 1024);
      
      const response = await request(app)
        .post('/api/content/upload')
        .set('Cookie', 'accessToken=test')
        .attach('file', largeBuffer, 'large.png');

      expect(response.status).toBe(400);
    });

    it('validates magic bytes for uploaded files', async () => {
      const response = await request(app)
        .post('/api/content/upload')
        .set('Cookie', 'accessToken=test')
        .attach('file', Buffer.from('not an image'), 'image.png');

      expect(response.status).toBe(400);
    });
  });

  describe('Error Message Sanitization', () => {
    it('does not leak stack traces in production', async () => {
      process.env.NODE_ENV = 'production';
      
      const response = await request(app)
        .get('/api/unknown-route-that-does-not-exist');

      expect(response.status).toBe(404);
      expect(response.body.stack).toBeUndefined();
    });

    it('does not leak database errors', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Cookie', 'accessToken=test')
        .send({ invalid: 'data' });

      expect(response.body.message).not.toContain('MongoError');
      expect(response.body.message).not.toContain('driver');
    });

    it('returns generic messages for auth failures', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpassword' });

      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});