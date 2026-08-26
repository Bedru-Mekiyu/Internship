import { Request, Response, NextFunction } from 'express';
import { getOrCreateCsrfToken, csrfProtection } from '../src/middlewares/csrf.middleware';

describe('CSRF Middleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const mockRequest = (overrides?: Partial<Request>) => {
    return {
      cookies: {},
      session: {},
      headers: {},
      method: 'POST',
      path: '/api/some/endpoint',
      ...overrides,
    } as unknown as Request;
  };

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  describe('getOrCreateCsrfToken', () => {
    it('should create a new token and set cookie when no token exists', () => {
      const req = mockRequest();
      const res = mockResponse();

      const token = getOrCreateCsrfToken(req, res);

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      expect(res.cookie).toHaveBeenCalledWith('csrfToken', token, expect.any(Object));
    });

    it('should reuse existing token and not set cookie', () => {
      const existingToken = 'existing-token-value';
      const req = mockRequest({
        cookies: { csrfToken: existingToken }
      });
      const res = mockResponse();

      const token = getOrCreateCsrfToken(req, res);

      expect(token).toBe(existingToken);
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('should set appropriate cookie options based on environment variables', () => {
      process.env.NODE_ENV = 'production';
      process.env.CSRF_COOKIE_SAME_SITE = 'none';
      process.env.CSRF_COOKIE_SECURE = 'false'; // will be overridden by 'none' rule

      const req = mockRequest();
      const res = mockResponse();

      getOrCreateCsrfToken(req, res);

      expect(res.cookie).toHaveBeenCalledWith('csrfToken', expect.any(String), {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
      });
    });

    it('should set appropriate cookie options for development environment', () => {
      process.env.NODE_ENV = 'development';

      const req = mockRequest();
      const res = mockResponse();

      getOrCreateCsrfToken(req, res);

      expect(res.cookie).toHaveBeenCalledWith('csrfToken', expect.any(String), {
        httpOnly: false,
        secure: false, // assuming not parsing true by default for non-prod
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
      });
    });
  });

  describe('csrfProtection', () => {
    let next: NextFunction;

    beforeEach(() => {
      next = jest.fn();
      process.env.NODE_ENV = 'development'; // Important: if 'test', it skips
    });

    it('should skip check when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      const req = mockRequest();
      const res = mockResponse();

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should skip check for safe HTTP methods', () => {
      ['GET', 'HEAD', 'OPTIONS'].forEach(method => {
        const req = mockRequest({ method });
        const res = mockResponse();
        const nextFn = jest.fn();

        csrfProtection(req, res, nextFn);

        expect(nextFn).toHaveBeenCalledTimes(1);
      });
    });

    it('should skip check for webhook endpoints', () => {
      const req = mockRequest({ path: '/api/payments/webhook/stripe' });
      const res = mockResponse();

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should skip check for excluded auth endpoints', () => {
      const excludedPaths = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/forgot-password',
        '/api/auth/forgotpassword',
        '/api/auth/reset-password',
        '/api/auth/resetpassword',
        '/api/auth/refresh-token',
        '/api/auth/refreshtoken'
      ];

      excludedPaths.forEach(path => {
        const req = mockRequest({ path });
        const res = mockResponse();
        const nextFn = jest.fn();

        csrfProtection(req, res, nextFn);

        expect(nextFn).toHaveBeenCalledTimes(1);
      });
    });

    it('should return 403 if cookie token is missing', () => {
      const req = mockRequest({
        headers: { 'x-csrf-token': 'some-token' }
      });
      const res = mockResponse();

      csrfProtection(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid CSRF token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if header token is missing', () => {
      const req = mockRequest({
        cookies: { csrfToken: 'some-token' }
      });
      const res = mockResponse();

      csrfProtection(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid CSRF token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if tokens do not match', () => {
      const req = mockRequest({
        cookies: { csrfToken: 'cookie-token' },
        headers: { 'x-csrf-token': 'header-token' }
      });
      const res = mockResponse();

      csrfProtection(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid CSRF token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if token lengths differ (timingSafeEqual requires same length)', () => {
      const req = mockRequest({
        cookies: { csrfToken: 'short' },
        headers: { 'x-csrf-token': 'longer-token' }
      });
      const res = mockResponse();

      csrfProtection(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid CSRF token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if both tokens match', () => {
      const validToken = 'super-secret-csrf-token';
      const req = mockRequest({
        cookies: { csrfToken: validToken },
        headers: { 'x-csrf-token': validToken }
      });
      const res = mockResponse();

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
