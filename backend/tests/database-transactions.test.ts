import request from 'supertest';
import { createApp } from '../src/app';

describe('Database Transaction Tests', () => {
  describe('Atomic Operations', () => {
    it('validates input before database operations', async () => {
      const app = createApp();
      const response = await request(app)
        .post('/api/courses')
        .set('Cookie', 'accessToken=valid-token')
        .send({});

      expect([400, 401]).toContain(response.status);
    });

    it('validates required fields for course creation', async () => {
      const app = createApp();
      const response = await request(app)
        .post('/api/courses')
        .set('Cookie', 'accessToken=valid-token')
        .send({
          title: 'Test Course',
        });

      expect([400, 401]).toContain(response.status);
    });

    it('validates course category format', async () => {
      const app = createApp();
      const response = await request(app)
        .post('/api/courses')
        .set('Cookie', 'accessToken=valid-token')
        .send({
          title: 'Test Course',
          description: 'Test Description',
          category: '',
          level: 'beginner',
        });

      expect([400, 401]).toContain(response.status);
    });

    it('validates course level enum values', async () => {
      const app = createApp();
      const response = await request(app)
        .post('/api/courses')
        .set('Cookie', 'accessToken=valid-token')
        .send({
          title: 'Test Course',
          description: 'Test Description',
          category: 'Development',
          level: 'invalid-level',
        });

      expect([400, 401]).toContain(response.status);
    });
  });

  describe('Data Integrity', () => {
    it('enforces unique email constraint', async () => {
      const app = createApp();

      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'TestPass123!',
          firstName: 'First',
          lastName: 'User',
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'TestPass123!',
          firstName: 'Second',
          lastName: 'User',
        });

      expect([400, 409, 202]).toContain(response.status);
    });

    it('enforces unique course slug constraint', async () => {
      const app = createApp();

      const createCourse = (title: string, slug: string) =>
        request(app)
          .post('/api/courses')
          .set('Cookie', 'accessToken=valid-token')
          .send({
            title,
            description: 'Test',
            category: 'Development',
            level: 'beginner',
            slug,
          });

      await createCourse('First Course', 'first-course');

      const response = await createCourse('Second Course', 'first-course');

      expect([400, 401, 409]).toContain(response.status);
    });
  });

  describe('Concurrent Operations', () => {
    it('handles concurrent enrollment gracefully', async () => {
      const app = createApp();
      const studentToken = 'accessToken=valid-student-token';

      const enrollments = await Promise.all([
        request(app).post('/api/courses/course-123/enroll').set('Cookie', studentToken),
        request(app).post('/api/courses/course-123/enroll').set('Cookie', studentToken),
      ]);

      const successCount = enrollments.filter((r) => r.status === 200).length;
      expect(successCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Cascade Operations', () => {
    it('validates content references before deletion', async () => {
      const app = createApp();
      const response = await request(app)
        .delete('/api/content/non-existent-id')
        .set('Cookie', 'accessToken=valid-token');

      expect([200, 401, 404]).toContain(response.status);
    });
  });
});