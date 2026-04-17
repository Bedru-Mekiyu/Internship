import request from 'supertest';
import { createApp } from '../src/app';

describe('Notification routes', () => {
  const app = createApp();

  it('returns 401 for /me without token', async () => {
    const response = await request(app).get('/api/notifications/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for /me/unread-count without token', async () => {
    const response = await request(app).get('/api/notifications/me/unread-count');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for create notification without token', async () => {
    const response = await request(app).post('/api/notifications').send({
      userId: '507f191e810c19729de860ea',
      title: 'System update',
      message: 'Platform maintenance is scheduled',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for bulk create without token', async () => {
    const response = await request(app).post('/api/notifications/bulk').send({
      role: 'student',
      title: 'Announcement',
      message: 'New week has started',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for cleanup without token', async () => {
    const response = await request(app).post('/api/notifications/cleanup').send({
      olderThanDays: 30,
      onlyRead: true,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for mark-read without token', async () => {
    const response = await request(app).patch('/api/notifications/507f191e810c19729de860ea/read');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for read-all without token', async () => {
    const response = await request(app).patch('/api/notifications/me/read-all');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for delete without token', async () => {
    const response = await request(app).delete('/api/notifications/507f191e810c19729de860ea');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });
});
