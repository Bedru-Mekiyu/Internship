import { Request, Response, NextFunction } from 'express';
import { sanitizeInput } from '../utils/sanitize';

export const sanitizeMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    req.body = sanitizeInput(req.body) as typeof req.body;
  }
  next();
};