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
};

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};