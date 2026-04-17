import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/http-error';
import { logError } from '../utils/logger';

export const errorMiddleware = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const requestId = req.requestId || null;

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      requestId,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err instanceof Error) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message, requestId });
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token', requestId });
    }

    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid identifier', requestId });
    }

    logError(err.message, { requestId, stack: err.stack });
  } else {
    logError('Unknown error', { requestId, err: String(err) });
  }

  return res.status(500).json({ message: 'Internal server error', requestId });
};