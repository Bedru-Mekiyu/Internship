import request from 'supertest';
import { createApp } from '../src/app';

describe('Payment routes', () => {
  const app = createApp();

  it('returns 401 for create payment without token', async () => {
    const response = await request(app)
      .post('/api/payments')
      .send({ courseId: '507f191e810c19729de860ea', method: 'card' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for my payments without token', async () => {
    const response = await request(app).get('/api/payments/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for instructor revenue without token', async () => {
    const response = await request(app).get('/api/payments/instructor/revenue');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for admin revenue without token', async () => {
    const response = await request(app).get('/api/payments/admin/revenue');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for confirm payment without token', async () => {
    const response = await request(app).post('/api/payments/507f191e810c19729de860ea/confirm');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for webhook without signature header', async () => {
    const response = await request(app)
      .post('/api/payments/webhook/stripe')
      .send({ externalPaymentId: 'stripe_123', status: 'completed' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Missing webhook signature');
  });
});