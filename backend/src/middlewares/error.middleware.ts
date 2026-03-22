import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/http-error';

export const errorMiddleware = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err instanceof Error) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    console.error(err.stack || err.message);
  } else {
    console.error('Unknown error', err);
  }

  return res.status(500).json({ message: 'Internal server error' });
};