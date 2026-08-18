import request from 'supertest';
import { createApp } from '../src/app';

describe('Open Redirect in verify-email', () => {
  const originalEnv = { FRONTEND_URL: process.env.FRONTEND_URL };

  afterEach(() => {
    if (originalEnv.FRONTEND_URL === undefined) {
      delete process.env.FRONTEND_URL;
    } else {
      process.env.FRONTEND_URL = originalEnv.FRONTEND_URL;
    }
  });

  it('redirects correctly if FRONTEND_URL is valid', async () => {
    process.env.FRONTEND_URL = 'https://my-app.com';
    const app = createApp();
    const response = await request(app).get('/auth/verify-email?token=123');
    expect(response.headers.location).toBe('https://my-app.com/auth/verify-email?token=123');
  });

  it('ignores javascript: urls and falls back to api', async () => {
    process.env.FRONTEND_URL = 'javascript://%250Aalert(1)//';
    const app = createApp();
    const response = await request(app).get('/auth/verify-email?token=123');
    expect(response.headers.location).toBe('/api/auth/verify-email?token=123');
  });

  it('redirects correctly if FRONTEND_URL is localhost with port', async () => {
    process.env.FRONTEND_URL = 'http://localhost:3000';
    const app = createApp();
    const response = await request(app).get('/auth/verify-email?token=123');
    expect(response.headers.location).toBe('http://localhost:3000/auth/verify-email?token=123');
  });

  it('redirects to the first url if FRONTEND_URL is comma separated', async () => {
    process.env.FRONTEND_URL = 'https://my-app.com,https://other-app.com';
    const app = createApp();
    const response = await request(app).get('/auth/verify-email?token=123');
    expect(response.headers.location).toBe('https://my-app.com/auth/verify-email?token=123');
  });
});
