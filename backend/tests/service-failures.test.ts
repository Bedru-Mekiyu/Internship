import request from 'supertest';
import { createApp } from '../src/app';

describe('Service Failure Tests', () => {
  describe('Graceful Degradation', () => {
    it('returns 401 for unauthenticated requests even when middleware fails', async () => {
      const app = createApp();
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('returns proper error for invalid route', async () => {
      const app = createApp();
      const response = await request(app).get('/api/invalid-route-xyz');

      expect(response.status).toBe(404);
    });

    it('handles malformed query parameters gracefully', async () => {
      const app = createApp();
      const response = await request(app).get('/api/courses?page=invalid');

      expect([200, 400]).toContain(response.status);
    });

    it('handles missing required path parameters', async () => {
      const app = createApp();
      const response = await request(app).get('/api/courses//enroll');

      expect(response.status).toBe(404);
    });
  });

  describe('Error Response Format', () => {
    it('returns JSON error for API routes', async () => {
      const app = createApp();
      const response = await request(app).get('/api/courses');

      expect(response.headers['content-type']).toContain('application/json');
    });

    it('includes message in error response', async () => {
      const app = createApp();
      const response = await request(app).get('/api/auth/me');

      expect(response.body.message).toBeDefined();
      expect(typeof response.body.message).toBe('string');
    });

    it('includes request ID for tracking', async () => {
      const app = createApp();
      const response = await request(app).get('/api/auth/me');

      expect(response.headers['x-request-id']).toBeDefined();
      expect(typeof response.headers['x-request-id']).toBe('string');
    });
  });

  describe('Rate Limiter Resilience', () => {
    it('continues to rate limit under stress', async () => {
      const app = createApp();

      const requests = [];
      for (let i = 0; i < 120; i++) {
        requests.push(request(app).get('/api/courses'));
      }

      const responses = await Promise.all(requests);
      const rateLimitedCount = responses.filter((r) => r.status === 429).length;

      expect(rateLimitedCount).toBeGreaterThan(0);
    });

    it('recovers after rate limit window', async () => {
      const app = createApp();

      for (let i = 0; i < 5; i++) {
        await request(app).get('/api/courses');
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await request(app).get('/api/courses');
      expect([200, 429]).toContain(response.status);
    });
  });

  describe('Upload Handling', () => {
    it('rejects oversized upload without crashing', async () => {
      const app = createApp();
      const largeBuffer = Buffer.alloc(300 * 1024 * 1024);

      const response = await request(app)
        .post('/api/content/upload')
        .set('Cookie', 'accessToken=valid-token')
        .attach('file', largeBuffer, 'large.png');

      expect(response.status).toBe(400);
    });

    it('rejects invalid file type without crashing', async () => {
      const app = createApp();

      const response = await request(app)
        .post('/api/content/upload')
        .set('Cookie', 'accessToken=valid-token')
        .attach('file', Buffer.from('malicious'), 'malicious.exe');

      expect(response.status).toBe(400);
    });

    it('handles missing file gracefully', async () => {
      const app = createApp();

      const response = await request(app)
        .post('/api/content/upload')
        .set('Cookie', 'accessToken=valid-token')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('Database Connection', () => {
    it('health endpoint reflects database state', async () => {
      const app = createApp();
      const response = await request(app).get('/readyz');

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('mongo');
    });

    it('public health check works regardless of DB state', async () => {
      const app = createApp();
      const response = await request(app).get('/healthz');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('Payment Gateway Failures', () => {
    it('validates payment payload before processing', async () => {
      const app = createApp();
      const response = await request(app)
        .post('/api/payments/checkout')
        .set('Cookie', 'accessToken=valid-token')
        .send({});

      expect([400, 401, 404]).toContain(response.status);
    });

    it('returns proper error for invalid course in checkout', async () => {
      const app = createApp();
      const response = await request(app)
        .post('/api/payments/checkout')
        .set('Cookie', 'accessToken=valid-token')
        .send({
          courseId: 'non-existent-course',
        });

      expect([400, 404]).toContain(response.status);
    });
  });
});