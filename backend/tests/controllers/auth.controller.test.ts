import {
  parseBoolean,
  parseSameSite,
  getAuthCookieOptions,
} from '../../src/controllers/auth.controller';

describe('auth.controller utility functions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('parseBoolean', () => {
    it('should return fallback if value is undefined', () => {
      expect(parseBoolean(undefined, true)).toBe(true);
      expect(parseBoolean(undefined, false)).toBe(false);
    });

    it('should return true for "true" ignoring case', () => {
      expect(parseBoolean('true', false)).toBe(true);
      expect(parseBoolean('TRUE', false)).toBe(true);
      expect(parseBoolean('True', false)).toBe(true);
    });

    it('should return false for any other value', () => {
      expect(parseBoolean('false', true)).toBe(false);
      expect(parseBoolean('1', true)).toBe(false);
      expect(parseBoolean('yes', true)).toBe(false);
    });
  });

  describe('parseSameSite', () => {
    it('should return fallback if value is undefined', () => {
      expect(parseSameSite(undefined, 'strict')).toBe('strict');
      expect(parseSameSite(undefined, 'lax')).toBe('lax');
    });

    it('should return "lax", "strict", or "none" ignoring case', () => {
      expect(parseSameSite('lax', 'strict')).toBe('lax');
      expect(parseSameSite('LAX', 'strict')).toBe('lax');
      expect(parseSameSite('strict', 'lax')).toBe('strict');
      expect(parseSameSite('STRICT', 'lax')).toBe('strict');
      expect(parseSameSite('none', 'lax')).toBe('none');
      expect(parseSameSite('NONE', 'lax')).toBe('none');
    });

    it('should return fallback for invalid values', () => {
      expect(parseSameSite('invalid', 'strict')).toBe('strict');
      expect(parseSameSite('random', 'lax')).toBe('lax');
    });
  });

  describe('getAuthCookieOptions', () => {
    it('should use default values for development environment', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.COOKIE_SAME_SITE;
      delete process.env.COOKIE_SECURE;

      const options = getAuthCookieOptions();

      expect(options.access.sameSite).toBe('lax');
      expect(options.access.secure).toBe(false);
      expect(options.refresh.sameSite).toBe('lax');
      expect(options.refresh.secure).toBe(false);
    });

    it('should use default values for production environment', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.COOKIE_SAME_SITE;
      delete process.env.COOKIE_SECURE;

      const options = getAuthCookieOptions();

      expect(options.access.sameSite).toBe('lax');
      expect(options.access.secure).toBe(true); // isProduction is true
      expect(options.refresh.sameSite).toBe('lax');
      expect(options.refresh.secure).toBe(true);
    });

    it('should respect COOKIE_SECURE environment variable', () => {
      process.env.NODE_ENV = 'development';
      process.env.COOKIE_SECURE = 'true';

      const options = getAuthCookieOptions();

      expect(options.access.secure).toBe(true);
      expect(options.refresh.secure).toBe(true);
    });

    it('should force secure=true when SameSite is none', () => {
      process.env.NODE_ENV = 'development';
      process.env.COOKIE_SAME_SITE = 'none';
      process.env.COOKIE_SECURE = 'false'; // Should be overridden

      const options = getAuthCookieOptions();

      expect(options.access.sameSite).toBe('none');
      expect(options.access.secure).toBe(true);
      expect(options.refresh.sameSite).toBe('none');
      expect(options.refresh.secure).toBe(true);
    });

    it('should contain expected cookie properties', () => {
      const options = getAuthCookieOptions();

      expect(options.access).toHaveProperty('httpOnly', true);
      expect(options.access).toHaveProperty('maxAge', 15 * 60 * 1000); // 15 mins
      expect(options.access).toHaveProperty('path', '/');

      expect(options.refresh).toHaveProperty('httpOnly', true);
      expect(options.refresh).toHaveProperty('maxAge', 7 * 24 * 60 * 60 * 1000); // 7 days
      expect(options.refresh).toHaveProperty('path', '/');
    });
  });
});
