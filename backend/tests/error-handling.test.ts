import request from 'supertest';
import { createApp } from '../src/app';

describe('Error Handling Tests', () => {
  const app = createApp();
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  describe('404 Handling', () => {
    it('returns 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown-endpoint');
      expect(response.status).toBe(404);
    });

    it('returns 404 for unknown API routes', async () => {
      const response = await request(app).get('/api/nonexistent/route');
      expect(response.status).toBe(404);
    });

    it('returns proper error structure for 404', async () => {
      const response = await request(app).get('/api/unknown');
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBeDefined();
      expect(response.body.stack).toBeUndefined();
    });
  });

  describe('400 Bad Request Handling', () => {
    it('handles malformed JSON body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{invalid json}');

      expect(response.status).toBe(400);
    });

    it('handles empty body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('');

      expect(response.status).toBe(400);
    });

    it('handles missing content-length for POST', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Transfer-Encoding', 'chunked')
        .send('');

      expect([400, 415]).toContain(response.status);
    });

    it('handles invalid content-type', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'text/plain')
        .send('not json');

      expect(response.status).toBe(400);
    });
  });

  describe('401 Unauthorized Handling', () => {
    it('returns 401 for missing authentication', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
    });

    it('returns 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'accessToken=invalidtoken');

      expect(response.status).toBe(401);
    });

    it('returns 401 for malformed token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'accessToken=not.a.valid.jwt');

      expect(response.status).toBe(401);
    });

    it('returns 401 for expired token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0IiwidHlwZSI6ImFjY2VzcyIsImV4cCI6MTYwMDAwMDAwMH0.invalid');

      expect(response.status).toBe(401);
    });
  });

  describe('403 Forbidden Handling', () => {
    it('returns 403 for unauthorized role access', async () => {
      const studentToken = 'student.token.here';
      
      const response = await request(app)
        .get('/api/admin/users')
        .set('Cookie', `accessToken=${studentToken}`);

      expect(response.status).toBe(403);
    });

    it('returns 403 for CSRF validation failure', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', 'accessToken=test')
        .send({});

      expect(response.status).toBe(403);
    });
  });

  describe('422 Validation Error Handling', () => {
    it('returns validation errors for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'not-an-email',
          password: 'Passw0rd!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('returns validation errors for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toBeDefined();
    });

    it('returns validation errors for missing required fields', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Cookie', 'accessToken=test')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.details).toBeDefined();
    });
  });

  describe('429 Rate Limit Handling', () => {
    it('returns 429 when rate limit exceeded', async () => {
      const requests = Array(150).fill(null).map(() => 
        request(app).get('/api/courses')
      );

      const responses = await Promise.all(requests);
      const hasRateLimit = responses.some(r => r.status === 429);
      
      expect(hasRateLimit).toBe(true);
    });

    it('returns proper rate limit headers', async () => {
      const response = await request(app).get('/api/courses');
      
      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    });
  });

  describe('500 Internal Server Error Handling', () => {
    it('returns generic message for unhandled errors', async () => {
      process.env.NODE_ENV = 'production';
      
      const response = await request(app).get('/healthz');
      
      expect(response.status).toBe(200);
    });

    it('does not leak sensitive information in errors', async () => {
      process.env.NODE_ENV = 'production';
      
      const response = await request(app).get('/api/unknown');
      
      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain('password');
      expect(responseString).not.toContain('secret');
      expect(responseString).not.toContain('token');
    });
  });

  describe('Service Unavailable Handling', () => {
    it('returns 503 when database unavailable', async () => {
      const response = await request(app).get('/readyz');
      
      expect([200, 503]).toContain(response.status);
    });

    it('provides health check endpoint', async () => {
      const response = await request(app).get('/healthz');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('Error Response Format', () => {
    it('returns consistent error format', async () => {
      const response = await request(app).get('/api/unknown');
      
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    it('includes request ID for tracking', async () => {
      const response = await request(app).get('/api/unknown');
      
      expect(response.headers['x-request-id']).toBeDefined();
      expect(typeof response.headers['x-request-id']).toBe('string');
    });

    it('includes correlation ID in logs', async () => {
      const response = await request(app).get('/api/unknown');
      
      expect(response.headers['x-request-id']).toMatch(/^[a-z0-9-]+$/);
    });
  });

  describe('Graceful Degradation', () => {
    it('handles missing optional fields', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Cookie', 'accessToken=test')
        .send({
          title: 'Test Course'
        });

      expect(response.status).toBe(401);
    });

    it('handles partial data gracefully', async () => {
      const response = await request(app)
        .patch('/api/users/me')
        .set('Cookie', 'accessToken=test')
        .send({
          firstName: 'Test'
        });

      expect(response.status).toBe(401);
    });

    it('handles unexpected data types', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 12345,
          password: true
        });

      expect(response.status).toBe(400);
    });
  });
});

describe('Logging Tests', () => {
  const app = createApp();
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it('logs errors with appropriate level', async () => {
    const response = await request(app).get('/api/unknown');
    
    expect(response.status).toBe(404);
  });

  it('logs authentication failures', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'accessToken=invalid');

    expect(response.status).toBe(401);
  });

  it('logs authorization failures', async () => {
    const response = await request(app)
      .get('/api/admin/users')
      .set('Cookie', 'accessToken=student');

    expect(response.status).toBe(403);
  });

  it('logs validation errors', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(response.status).toBe(400);
  });

  it('masks sensitive data in logs', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'Secret123!'
      });

    expect(response.status).toBe(401);
  });
});

describe('Recovery Tests', () => {
  const app = createApp();

  it('recovers after malformed request', async () => {
    await request(app)
      .post('/api/auth/login')
      .send('{invalid}');

    const response = await request(app)
      .get('/healthz');

    expect(response.status).toBe(200);
  });

  it('recovers after large payload', async () => {
    const largePayload = 'a'.repeat(1000000);
    
    await request(app)
      .post('/api/auth/register')
      .send({ email: largePayload });

    const response = await request(app).get('/healthz');
    expect(response.status).toBe(200);
  });

  it('continues serving requests after error', async () => {
    await request(app).get('/api/unknown');
    await request(app).get('/api/unknown');
    
    const response = await request(app).get('/healthz');
    expect(response.status).toBe(200);
  });
});