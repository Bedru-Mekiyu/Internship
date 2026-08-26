import { setCachedCourseListJson, getCachedCourseListJson } from '../src/services/cache.service';
import { logWarn } from '../src/utils/logger';

const mockSet = jest.fn();
const mockGet = jest.fn();
const mockOn = jest.fn();

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: mockOn,
    get: mockGet,
    set: mockSet,
    incr: jest.fn()
  }));
});

jest.mock('../src/utils/logger', () => {
  const actualLogger = jest.requireActual('../src/utils/logger');
  return {
    ...actualLogger,
    logWarn: jest.fn(),
  };
});

describe('Cache Service', () => {
  let originalRedisUrl: string | undefined;

  beforeAll(() => {
    originalRedisUrl = process.env.REDIS_URL;
    process.env.REDIS_URL = 'redis://localhost:6379';
  });

  afterAll(() => {
    process.env.REDIS_URL = originalRedisUrl;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setCachedCourseListJson', () => {
    it('should set cache successfully in redis', async () => {
      mockGet.mockResolvedValueOnce('1'); // for getCatalogVersion
      mockSet.mockResolvedValueOnce('OK');

      const input = { filters: { category: 'science' }, paginated: true, page: 2, limit: 20 };
      await setCachedCourseListJson(input, '[]');

      expect(mockSet).toHaveBeenCalledWith(
        expect.stringContaining('lms:course:list:v1:'),
        '[]',
        'EX',
        expect.any(Number)
      );
    });

    it('should log a warning if Redis set fails', async () => {
      mockSet.mockRejectedValueOnce(new Error('Redis is down'));
      mockGet.mockResolvedValueOnce('1'); // for getCatalogVersion

      const input = { filters: {}, paginated: false, page: 1, limit: 10 };
      await setCachedCourseListJson(input, '[]');

      expect(mockSet).toHaveBeenCalled();
      expect(logWarn).toHaveBeenCalledWith('cache_set_failed', expect.objectContaining({
        error: 'Error: Redis is down'
      }));
    });
  });
});
