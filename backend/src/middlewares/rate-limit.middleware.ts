import { Request, Response, NextFunction } from 'express';
<<<<<<< HEAD
import Redis from 'ioredis';
=======
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

<<<<<<< HEAD
const memoryBuckets = new Map<string, RateLimitBucket>();

let sharedRedis: Redis | null | undefined;

const getSharedRedis = (): Redis | null => {
  const url = process.env.REDIS_URL?.trim();
  if (!url) {
    return null;
  }
  if (sharedRedis === undefined) {
    try {
      sharedRedis = new Redis(url, {
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
      });
      sharedRedis.on('error', () => {
        // Per-request try/catch still falls back to memory
      });
    } catch {
      sharedRedis = null;
    }
  }
  return sharedRedis;
};

const tryMemoryLimit = (
  key: string,
  windowMs: number,
  max: number,
  res: Response,
  message: string,
): boolean => {
  const now = Date.now();
  const current = memoryBuckets.get(key);

  if (!current || current.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= max) {
    const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(Math.max(retryAfterSeconds, 1)));
    res.status(429).json({ message });
    return false;
  }

  current.count += 1;
  memoryBuckets.set(key, current);
  return true;
};

/**
 * Rate limiter: uses Redis when `REDIS_URL` is set (shared across replicas), otherwise in-memory per process.
 */
export const createRateLimiter = ({ windowMs, max, message }: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.baseUrl}:${req.path}:${ip}`;
    const redis = getSharedRedis();

    if (!redis) {
      if (!tryMemoryLimit(key, windowMs, max, res, message)) {
        return;
      }
      return next();
    }

    try {
      const redisKey = `ratelimit:${key}`;
      const count = await redis.incr(redisKey);
      if (count === 1) {
        await redis.pexpire(redisKey, windowMs);
      }
      if (count > max) {
        const ttl = await redis.pttl(redisKey);
        const retryAfterSeconds = Math.ceil(Math.max(ttl, 1000) / 1000);
        res.setHeader('Retry-After', String(Math.max(retryAfterSeconds, 1)));
        return res.status(429).json({ message });
      }
      return next();
    } catch {
      if (!tryMemoryLimit(key, windowMs, max, res, message)) {
        return;
      }
      return next();
    }
=======
export const createRateLimiter = ({ windowMs, max, message }: RateLimitOptions) => {
  const buckets = new Map<string, RateLimitBucket>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.baseUrl}:${req.path}:${ip}`;
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(Math.max(retryAfterSeconds, 1)));
      return res.status(429).json({ message });
    }

    current.count += 1;
    buckets.set(key, current);
    return next();
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
  };
};
