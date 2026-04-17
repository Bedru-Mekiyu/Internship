import request from 'supertest';
import { createApp } from '../src/app';

describe('Course routes', () => {
  const app = createApp();

  it('returns 401 for draft course filter without token', async () => {
    const response = await request(app).get('/api/courses?status=draft');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authentication is required for this course status filter');
  });

  it('returns 401 for create course without token', async () => {
    const response = await request(app).post('/api/courses').send({
      title: 'Test Course',
      slug: 'test-course',
      description: 'desc',
      category: 'general',
      level: 'beginner',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for enroll route without token', async () => {
    const response = await request(app).post('/api/courses/507f191e810c19729de860ea/enroll').send({});

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for progress route without token', async () => {
    const response = await request(app).get('/api/courses/507f191e810c19729de860ea/progress');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for review route without token', async () => {
    const response = await request(app).post('/api/courses/507f191e810c19729de860ea/review').send({ rating: 5, comment: 'Great course' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for modules route without token', async () => {
    const response = await request(app).get('/api/courses/507f191e810c19729de860ea/modules');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for progress update route without token', async () => {
    const response = await request(app).patch('/api/courses/507f191e810c19729de860ea/progress').send({ progress: 40 });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for module lesson creation without token', async () => {
    const response = await request(app).post('/api/courses/modules/507f191e810c19729de860eb/lessons').send({
      title: 'Intro Video',
      type: 'video',
      duration: 8,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for complete lesson route without token', async () => {
    const response = await request(app)
      .post('/api/courses/507f191e810c19729de860ea/lessons/507f191e810c19729de860ec/complete')
      .send({});

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });
});
