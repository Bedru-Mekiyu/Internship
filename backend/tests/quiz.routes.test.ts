import request from 'supertest';
import { createApp } from '../src/app';

describe('Quiz routes', () => {
  const app = createApp();

  it('returns 401 for list quizzes by lesson without token', async () => {
    const response = await request(app).get('/api/quizzes/lesson/507f191e810c19729de860ea');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for create quiz without token', async () => {
    const response = await request(app)
      .post('/api/quizzes/lesson/507f191e810c19729de860ea')
      .send({
        title: 'Week 1 Quiz',
        questions: [{ question: 'Q1?', type: 'true-false', correctAnswer: true, points: 1 }],
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for submit quiz attempt without token', async () => {
    const response = await request(app)
      .post('/api/quizzes/507f191e810c19729de860ea/attempts')
      .send({ answers: [{ questionIndex: 0, answer: true }] });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for my quiz attempts without token', async () => {
    const response = await request(app).get('/api/quizzes/507f191e810c19729de860ea/attempts/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for instructor quiz attempts without token', async () => {
    const response = await request(app).get('/api/quizzes/507f191e810c19729de860ea/attempts');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });
});
