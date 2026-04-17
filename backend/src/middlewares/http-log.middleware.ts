import { Request, Response, NextFunction } from 'express';
import { logInfo } from '../utils/logger';

/** Structured request log on response finish (latency + status for ops / incident response). */
export const httpLogMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logInfo('http_request', {
      requestId: req.requestId,
      method: req.method,
      path: typeof req.originalUrl === 'string' ? req.originalUrl.split('?')[0] : req.path,
      status: res.statusCode,
      durationMs,
    });
  });
  next();
};
