import request from 'supertest';
import { createApp } from '../src/app';

describe('Certificate routes', () => {
  const app = createApp();

  it('returns 401 for list my certificates without token', async () => {
    const response = await request(app).get('/api/certificates/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for generate certificate without token', async () => {
    const response = await request(app)
      .post('/api/certificates/course/507f191e810c19729de860ea/generate')
      .send({});

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for render certificate without token', async () => {
    const response = await request(app).get('/api/certificates/507f191e810c19729de860ea/render');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for download certificate without token', async () => {
    const response = await request(app).get('/api/certificates/507f191e810c19729de860ea/download');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('returns 401 for download certificate PDF without token', async () => {
    const response = await request(app).get('/api/certificates/507f191e810c19729de860ea/download-pdf');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });
});
