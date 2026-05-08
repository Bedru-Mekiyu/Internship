import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import client from 'prom-client';

let bootstrapped = false;
let httpHistogram: client.Histogram<string> | null = null;
let httpCounter: client.Counter<string> | null = null;

const ensureMetrics = () => {
  if (bootstrapped) return;
  bootstrapped = true;
  client.collectDefaultMetrics();

  httpHistogram = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [client.register],
  });

  httpCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'status_code'],
    registers: [client.register],
  });
};

export const prometheusHttpMiddleware = (req: Request, res: Response, next: NextFunction) => {
  ensureMetrics();
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationSec = Number(process.hrtime.bigint() - start) / 1e9;
    const status = String(res.statusCode || 0);
    const method = req.method || 'UNKNOWN';
    try {
      httpHistogram?.observe({ method, status_code: status }, durationSec);
      httpCounter?.inc({ method, status_code: status });
    } catch {
      /* never crash the response path for metrics */
    }
  });
  next();
};

export const metricsHandler = async (_req: Request, res: Response) => {
  ensureMetrics();
  res.setHeader('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
};

export const metricsBearerGuard = (req: Request, res: Response, next: NextFunction) => {
  const token = process.env.METRICS_BEARER_TOKEN?.trim();
  if (!token) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ message: 'Not found' });
    }
    return next();
  }
  const auth = req.headers.authorization;
  const expected = `Bearer ${token}`;
  const provided = typeof auth === 'string' ? auth : '';
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  const matches =
    providedBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(providedBuffer, expectedBuffer);

  if (!matches) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return next();
};
