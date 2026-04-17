import request from 'supertest';
import { createApp } from '../src/app';

describe('Dashboard routes', () => {
  const app = createApp();

  it('returns 401 for student dashboard without token', async () => {
    const response = await request(app).get('/api/dashboard/student');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for instructor dashboard without token', async () => {
    const response = await request(app).get('/api/dashboard/instructor');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for admin dashboard without token', async () => {
    const response = await request(app).get('/api/dashboard/admin');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });
});
