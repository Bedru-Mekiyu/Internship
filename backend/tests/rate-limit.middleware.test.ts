import { createRateLimiter } from '../src/middlewares/rate-limit.middleware';

const createMockRes = () => {
  const res: any = {};
  res.setHeader = jest.fn();
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('createRateLimiter', () => {
  it('supports user-based rate limiting via keyGenerator', async () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 2,
      message: 'Too many requests',
      keyGenerator: (req) => req.user?._id?.toString?.() ?? '',
    });

    const next = jest.fn();

    const reqA: any = {
      baseUrl: '/api/certificates',
      path: '/course/abc/generate',
      route: { path: '/course/:courseId/generate' },
      ip: '10.0.0.1',
      socket: { remoteAddress: '10.0.0.1' },
      user: { _id: 'user-123' },
    };

    const reqB: any = {
      ...reqA,
      ip: '10.0.0.2',
      socket: { remoteAddress: '10.0.0.2' },
    };

    const res1 = createMockRes();
    await limiter(reqA, res1, next);
    expect(next).toHaveBeenCalledTimes(1);

    const res2 = createMockRes();
    await limiter(reqB, res2, next);
    expect(next).toHaveBeenCalledTimes(2);

    const res3 = createMockRes();
    await limiter(reqB, res3, next);
    expect(next).toHaveBeenCalledTimes(2);
    expect(res3.status).toHaveBeenCalledWith(429);
    expect(res3.json).toHaveBeenCalledWith({ message: 'Too many requests' });
  });

  it('uses req.route.path (when available) to avoid per-param buckets', async () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 1,
      message: 'Too many requests',
    });

    const next = jest.fn();

    const baseReq: any = {
      baseUrl: '/api/certificates-test',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      route: { path: '/course/:courseId/generate' },
    };

    const res1 = createMockRes();
    await limiter({ ...baseReq, path: '/course/1/generate' }, res1, next);
    expect(next).toHaveBeenCalledTimes(1);

    const res2 = createMockRes();
    await limiter({ ...baseReq, path: '/course/2/generate' }, res2, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res2.status).toHaveBeenCalledWith(429);
  });
});
