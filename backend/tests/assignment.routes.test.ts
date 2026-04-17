import request from 'supertest';
import { createApp } from '../src/app';

describe('Assignment routes', () => {
  const app = createApp();

  it('returns 401 for list assignments without token', async () => {
    const response = await request(app).get('/api/assignments/course/507f191e810c19729de860ea');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for create assignment without token', async () => {
    const response = await request(app)
      .post('/api/assignments/course/507f191e810c19729de860ea')
      .send({
        title: 'Week 1 Assignment',
        description: 'Submit your work',
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for assignment analytics without token', async () => {
    const response = await request(app).get('/api/assignments/course/507f191e810c19729de860ea/analytics');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for student submissions list without token', async () => {
    const response = await request(app).get('/api/assignments/course/507f191e810c19729de860ea/submissions/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for submit assignment without token', async () => {
    const response = await request(app)
      .post('/api/assignments/507f191e810c19729de860eb/submissions')
      .send({ content: 'My solution' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for instructor submissions list without token', async () => {
    const response = await request(app).get('/api/assignments/507f191e810c19729de860eb/submissions');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for grade submission without token', async () => {
    const response = await request(app)
      .patch('/api/assignments/507f191e810c19729de860eb/submissions/507f191e810c19729de860ec/grade')
      .send({ grade: 85 });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });
});
