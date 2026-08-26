import { createHash } from 'crypto';

const mockGet = jest.fn();
const mockSet = jest.fn();
const mockIncr = jest.fn();
const mockOn = jest.fn();

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: mockGet,
    set: mockSet,
    incr: mockIncr,
    on: mockOn,
  }));
});

describe('getCachedCourseListJson', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = { ...originalEnv };
  });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.REDIS_URL = 'redis://localhost:6379';
    mockGet.mockReset();
    mockSet.mockReset();
    mockIncr.mockReset();
    mockOn.mockReset();
  });

  it('should return null if REDIS_URL is not set', async () => {
    delete process.env.REDIS_URL;
    const { getCachedCourseListJson } = require('../src/services/cache.service');
    const result = await getCachedCourseListJson({ filters: {}, paginated: true, page: 1, limit: 10 });
    expect(result).toBeNull();
  });

  it('should return cached data if available', async () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'lms:catalog:ver') return Promise.resolve('2');
      return Promise.resolve('{"courses":[]}');
    });

    const { getCachedCourseListJson } = require('../src/services/cache.service');

    const input = { filters: { category: 'tech' }, paginated: false, page: 1, limit: 10 };
    const result = await getCachedCourseListJson(input);

    expect(result).toBe('{"courses":[]}');

    const expectedHash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const expectedKey = `lms:course:list:v2:${expectedHash}`;
    expect(mockGet).toHaveBeenCalledWith(expectedKey);
    expect(mockGet).toHaveBeenCalledWith('lms:catalog:ver');
  });

  it('should return null if Redis throws an error when getting data', async () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'lms:catalog:ver') return Promise.resolve('1');
      return Promise.reject(new Error('Redis connection error'));
    });

    const { getCachedCourseListJson } = require('../src/services/cache.service');

    const input = { filters: {}, paginated: true, page: 1, limit: 10 };
    const result = await getCachedCourseListJson(input);

    expect(result).toBeNull();
  });

  it('should format keys correctly and fallback to catalog version 0 if getCatalogVersion fails', async () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'lms:catalog:ver') return Promise.reject(new Error('catalog version fail'));
      return Promise.resolve('{"data":"some-data"}');
    });

    const { getCachedCourseListJson } = require('../src/services/cache.service');

    const input = { filters: {}, paginated: true, page: 1, limit: 10 };
    const result = await getCachedCourseListJson(input);

    expect(result).toBe('{"data":"some-data"}');

    const expectedHash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const expectedKey = `lms:course:list:v0:${expectedHash}`;

    expect(mockGet).toHaveBeenCalledWith(expectedKey);
  });

  it('should fallback to catalog version 0 if catalog version key is not found', async () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'lms:catalog:ver') return Promise.resolve(null);
      return Promise.resolve('{"data":"some-data"}');
    });

    const { getCachedCourseListJson } = require('../src/services/cache.service');

    const input = { filters: {}, paginated: true, page: 1, limit: 10 };
    const result = await getCachedCourseListJson(input);

    expect(result).toBe('{"data":"some-data"}');

    const expectedHash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const expectedKey = `lms:course:list:v0:${expectedHash}`;

    expect(mockGet).toHaveBeenCalledWith(expectedKey);
  });

  it('should return null if Redis initialization fails', async () => {
    const ioredis = require('ioredis');
    ioredis.mockImplementationOnce(() => {
      throw new Error('Connection failed');
    });

    const { getCachedCourseListJson } = require('../src/services/cache.service');
    const result = await getCachedCourseListJson({ filters: {}, paginated: true, page: 1, limit: 10 });
    expect(result).toBeNull();
  });

  it('should swallow error from shared.on("error")', async () => {
    mockGet.mockResolvedValue(null);
    let errorHandler: any;
    mockOn.mockImplementation((event: string, handler: any) => {
      if (event === 'error') {
        errorHandler = handler;
      }
    });

    const { getCachedCourseListJson } = require('../src/services/cache.service');
    await getCachedCourseListJson({ filters: {}, paginated: true, page: 1, limit: 10 });

    expect(errorHandler).toBeDefined();
    // This should not throw
    expect(() => errorHandler(new Error('test'))).not.toThrow();
  });
});
