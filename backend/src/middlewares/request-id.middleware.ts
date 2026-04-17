import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

const requestIdHeader = 'x-request-id';

const sanitizeRequestId = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 128) {
    return null;
  }

  return trimmed;
};

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const incomingRequestId = sanitizeRequestId(req.header(requestIdHeader));
  const requestId = incomingRequestId || randomUUID();

  req.requestId = requestId;
  res.setHeader(requestIdHeader, requestId);

  next();
};
