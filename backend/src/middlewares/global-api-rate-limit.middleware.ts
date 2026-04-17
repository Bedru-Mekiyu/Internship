import { Request, Response, NextFunction } from 'express';
import { createRateLimiter } from './rate-limit.middleware';

/**
 * Soft ceiling for all /api traffic per IP. Disabled when env is 0 or unset (default 0).
 * Enable in production with e.g. GLOBAL_API_RATE_LIMIT_MAX=600 per 15 minutes.
 */
const max = Number.parseInt(process.env.GLOBAL_API_RATE_LIMIT_MAX || '0', 10);
const windowMs = Number.parseInt(process.env.GLOBAL_API_RATE_LIMIT_WINDOW_MS || `${15 * 60 * 1000}`, 10);

export const globalApiRateLimiter =
  Number.isFinite(max) && max > 0
    ? createRateLimiter({
        windowMs: Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 15 * 60 * 1000,
        max,
        message: 'Too many requests. Please slow down.',
      })
    : (_req: Request, _res: Response, next: NextFunction) => next();
