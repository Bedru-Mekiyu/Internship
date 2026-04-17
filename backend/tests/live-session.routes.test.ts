import request from 'supertest';
import { createApp } from '../src/app';

describe('Live session routes', () => {
  const app = createApp();

  it('returns 401 for listing live sessions without token', async () => {
    const response = await request(app).get('/api/live-sessions/course/507f191e810c19729de860ea');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for creating live session without token', async () => {
    const response = await request(app)
      .post('/api/live-sessions/course/507f191e810c19729de860ea')
      .send({
        title: 'Live Session 1',
        meetingUrl: 'https://meet.jit.si/test',
        startsAt: new Date().toISOString(),
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for updating live session status without token', async () => {
    const response = await request(app)
      .patch('/api/live-sessions/507f191e810c19729de860ea/status')
      .send({ status: 'live' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });
});
