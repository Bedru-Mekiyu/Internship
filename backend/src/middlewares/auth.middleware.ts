import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { AppError } from '../utils/http-error';
import { requireEnv } from '../utils/env';
<<<<<<< HEAD
import { logError } from '../utils/logger';
=======
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede

interface DecodedToken {
  userId: string;
  type: 'access' | 'refresh';
  tokenVersion?: number;
}

<<<<<<< HEAD
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
    logError('auth_missing_token', { path: req.path, ip: req.ip });
    return res.status(401).json({ message: 'No token provided' });
  }

  for (const token of tokensToTry) {
    try {
      await attachRequestUser(req, token);
      return next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError('auth_token_validation_failed', { 
        path: req.path, 
        error: errorMessage,
        hasUser: !!req.user?._id 
      });
    }
  }

  logError('auth_all_tokens_invalid', { path: req.path, ip: req.ip });
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
=======
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  let accessSecret: string;
  try {
    accessSecret = requireEnv('JWT_ACCESS_SECRET');
  } catch {
    return next(new AppError('Authentication is not configured', 500));
  }

  try {
    const decoded = jwt.verify(token, accessSecret) as DecodedToken;
    if (decoded.type !== 'access') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) throw new Error('Invalid token');

    const currentVersion = user.tokenVersion ?? 0;
    const tokenVersion = decoded.tokenVersion ?? 0;
    if (tokenVersion !== currentVersion) throw new Error('Invalid token');

    req.user = user; // Attach user to request
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
};

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
<<<<<<< HEAD
    if (!req.user) {
      logError('auth_role_check_no_user', { path: req.path });
      return res.status(401).json({ message: 'Access denied' });
    }
    if (!roles.includes(req.user.role)) {
      logError('auth_role_check_forbidden', { 
        path: req.path, 
        userRole: req.user.role,
        requiredRoles: roles 
      });
=======
    if (!req.user || !roles.includes(req.user.role)) {
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
<<<<<<< HEAD
};
=======
};
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
