import request from 'supertest';
import { createApp } from '../src/app';

describe('Content routes', () => {
  const app = createApp();

  it('returns 401 for manage route without token', async () => {
    const response = await request(app).get('/api/content/manage');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });
});
