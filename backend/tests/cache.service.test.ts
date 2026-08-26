import { afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals';

const incrMock = jest.fn<(key: string) => Promise<number>>().mockResolvedValue(1);

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    incr: incrMock,
    on: jest.fn(),
  }));
});

describe('cache.service.ts - bumpCourseCatalogCacheVersion', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    incrMock.mockClear();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('should not connect or increment when REDIS_URL is not set', async () => {
    delete process.env.REDIS_URL;
    const { bumpCourseCatalogCacheVersion } = await import('../src/services/cache.service');

    await bumpCourseCatalogCacheVersion();

    expect(incrMock).not.toHaveBeenCalled();
  });

  it('should increment CATALOG_VER_KEY when REDIS_URL is set', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    const { bumpCourseCatalogCacheVersion } = await import('../src/services/cache.service');

    await bumpCourseCatalogCacheVersion();

    expect(incrMock).toHaveBeenCalledTimes(1);
    expect(incrMock).toHaveBeenCalledWith('lms:catalog:ver');
  });

  it('should silently ignore errors when incr fails', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    incrMock.mockRejectedValueOnce(new Error('Redis error'));
    const { bumpCourseCatalogCacheVersion } = await import('../src/services/cache.service');

    await expect(bumpCourseCatalogCacheVersion()).resolves.toBeUndefined();
    expect(incrMock).toHaveBeenCalledTimes(1);
  });
});
