const mockIncr = jest.fn();
const mockOn = jest.fn();

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    incr: mockIncr,
    on: mockOn,
  }));
});

describe('Cache Service', () => {
  let cacheService: any;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('bumpCourseCatalogCacheVersion', () => {
    it('resolves without throwing when Redis incr throws an error', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';

      mockIncr.mockRejectedValueOnce(new Error('Redis connection lost'));

      cacheService = require('../src/services/cache.service');

      await expect(cacheService.bumpCourseCatalogCacheVersion()).resolves.toBeUndefined();
      expect(mockIncr).toHaveBeenCalledWith('lms:catalog:ver');
    });
  });
});
