import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/http-error';
import { logError } from '../utils/logger';

const isProduction = process.env.NODE_ENV === 'production';

const getUserFriendlyMessage = (err: Error, statusCode: number): string => {
  const errName = err.name.toLowerCase();

  if (errName.includes('validationerror')) {
    return 'The data provided is invalid. Please check your input.';
  }

  if (errName.includes('casterror')) {
    return 'Invalid data format. Please check your request.';
  }

  if (errName.includes('jsonwebtoken')) {
    return 'Your session is invalid. Please sign in again.';
  }

  if (errName.includes('tokenexpired')) {
    return 'Your session has expired. Please sign in again.';
  }

  if (errName.includes('mongodberror') || errName.includes('duplicatekey')) {
    return 'This data already exists. Please use different values.';
  }

  if (statusCode === 500 && !isProduction) {
    return err.message;
  }

  if (statusCode === 500) {
    return 'An unexpected error occurred. Please try again later.';
  }

  return err.message;
};

export const errorMiddleware = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const requestId = (req as any).requestId || null;

  if (err instanceof AppError) {
    const details = err.details && typeof err.details === 'object' ? err.details as Record<string, unknown> : undefined;
    const code = typeof details?.code === 'string' ? details.code : undefined;
    return res.status(err.statusCode).json({
      message: getUserFriendlyMessage(err, err.statusCode),
      requestId,
      ...(err.details ? { details: err.details } : {}),
      ...(code ? { code } : {}),
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      message: getUserFriendlyMessage(err, 400),
      requestId,
      details,
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      message: 'Invalid data format. Please check your request.',
      requestId,
    });
  }

  const isDuplicateKey = err instanceof mongoose.mongo.MongoServerError && err.code === 11000;
  if (isDuplicateKey) {
    const fieldMatch = err.message?.match(/dup key: \{ [^:]+: "([^"]+)" \}/);
    const field = fieldMatch ? fieldMatch[1] : 'field';
    return res.status(409).json({
      message: `This value already exists. Please use a different ${field}.`,
      requestId,
    });
  }

  if (err instanceof mongoose.Error) {
    return res.status(400).json({
      message: getUserFriendlyMessage(err, 400),
      requestId,
    });
  }

  if (err instanceof Error) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: getUserFriendlyMessage(err, 401),
        requestId,
      });
    }

    logError(err.message, { requestId, stack: err.stack });
  } else {
    logError('Unknown error', { requestId, err: String(err) });
  }

  return res.status(500).json({ message: 'Internal server error', requestId });
};
