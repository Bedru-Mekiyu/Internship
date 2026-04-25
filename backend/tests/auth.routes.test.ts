import request from 'supertest';
import { createApp } from '../src/app';

describe('Auth routes', () => {
  const app = createApp();

  it('returns 400 for invalid register payload', async () => {
    const response = await request(app).post('/api/auth/register').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
    expect(typeof response.headers['x-request-id']).toBe('string');
    expect(Array.isArray(response.body.details)).toBe(true);
  });

  it('returns 400 when refresh token is missing', async () => {
    const response = await request(app).post('/api/auth/refresh-token').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('refreshToken is required');
  });

  it('returns 401 for /me without token', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
    expect(typeof response.headers['x-request-id']).toBe('string');
  });

  it('returns 401 for /logout without token', async () => {
    const response = await request(app).post('/api/auth/logout').send({});

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 400 for invalid forgot-password payload', async () => {
    const response = await request(app).post('/api/auth/forgot-password').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('returns 400 for invalid reset-password payload', async () => {
    const response = await request(app).post('/api/auth/reset-password').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('supports forgotpassword alias and validates payload', async () => {
    const response = await request(app).post('/api/auth/forgotpassword').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('supports resetpassword alias and validates payload', async () => {
    const response = await request(app).post('/api/auth/resetpassword').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('supports refreshtoken alias', async () => {
    const response = await request(app).post('/api/auth/refreshtoken').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('refreshToken is required');
  });
});