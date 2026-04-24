import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { AppError } from '../utils/http-error';
import { requireEnv } from '../utils/env';

interface DecodedToken {
  userId: string;
  type: 'access' | 'refresh';
  tokenVersion?: number;
}

const getAccessTokensToTry = (req: Request): string[] => {
  const tokenFromCookie = req.cookies?.accessToken as string | undefined;

  if (tokenFromCookie) {
    return [tokenFromCookie];
  }

  return [];
};

const resolveAccessSecret = () => {
  return requireEnv('JWT_ACCESS_SECRET');
};

const attachRequestUser = async (req: Request, token: string) => {
  const accessSecret = resolveAccessSecret();
  const decoded = jwt.verify(token, accessSecret) as DecodedToken;

  if (decoded.type !== 'access') {
    throw new AppError('Invalid token type', 401);
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) {
    throw new AppError('Invalid or expired token', 401);
  }

  const currentVersion = user.tokenVersion ?? 0;
  const tokenVersion = decoded.tokenVersion ?? 0;
  if (tokenVersion !== currentVersion) {
    throw new AppError('Invalid or expired token', 401);
  }

  req.user = user;
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const tokensToTry = getAccessTokensToTry(req);

  if (tokensToTry.length === 0) {
    return res.status(401).json({ message: 'No token provided' });
  }

  for (const token of tokensToTry) {
    try {
      await attachRequestUser(req, token);
      return next();
    } catch {
      // try next candidate (e.g. expired Bearer + valid cookie)
    }
  }

  return res.status(401).json({ message: 'Invalid or expired token' });
};

/**
 * Attaches `req.user` when a valid access token is present.
 * Invalid or expired tokens are ignored so the request continues unauthenticated (public catalog, etc.).
 */
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const tokensToTry = getAccessTokensToTry(req);

  if (tokensToTry.length === 0) {
    return next();
  }

  for (const token of tokensToTry) {
    try {
      await attachRequestUser(req, token);
      return next();
    } catch {
      // ignore bad tokens
    }
  }

  return next();
};

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
