import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
};

type SameSitePolicy = 'lax' | 'strict' | 'none';

const parseSameSite = (value: string | undefined, fallback: SameSitePolicy): SameSitePolicy => {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.toLowerCase();
  if (normalized === 'lax' || normalized === 'strict' || normalized === 'none') {
    return normalized;
  }

  return fallback;
};

const isProduction = process.env.NODE_ENV === 'production';
const csrfCookieName = 'csrfToken';
const csrfCookieSameSite = parseSameSite(
  process.env.CSRF_COOKIE_SAME_SITE || process.env.COOKIE_SAME_SITE,
  'lax',
);
const csrfCookieSecure = csrfCookieSameSite === 'none'
  ? true
  : parseBoolean(process.env.CSRF_COOKIE_SECURE, isProduction);

const csrfCookieOptions = {
  httpOnly: false,
  secure: csrfCookieSecure,
  sameSite: csrfCookieSameSite,
  path: '/',
  maxAge: 24 * 60 * 60 * 1000,
};

const createToken = () => crypto.randomBytes(32).toString('hex');

const shouldSkipCsrf = (req: Request) => {
  if (process.env.NODE_ENV === 'test') {
    return true;
  }

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return true;
  }

  if (req.path.startsWith('/api/payments/webhook/')) {
    return true;
  }

  if (
    req.path === '/api/auth/login'
    || req.path === '/api/auth/register'
    || req.path === '/api/auth/forgot-password'
    || req.path === '/api/auth/forgotpassword'
    || req.path === '/api/auth/reset-password'
    || req.path === '/api/auth/resetpassword'
    || req.path === '/api/auth/refresh-token'
    || req.path === '/api/auth/refreshtoken'
  ) {
    return true;
  }

  return false;
};

export const getOrCreateCsrfToken = (req: Request, res: Response) => {
  const existing = req.cookies?.[csrfCookieName] as string | undefined;
  const token = existing || createToken();

  if (!existing) {
    res.cookie(csrfCookieName, token, csrfCookieOptions);
  }

  return token;
};

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (shouldSkipCsrf(req)) {
    return next();
  }

  const csrfCookieToken = req.cookies?.[csrfCookieName] as string | undefined;
  const csrfHeaderToken = req.headers['x-csrf-token'];

  if (
    typeof csrfCookieToken !== 'string'
    || typeof csrfHeaderToken !== 'string'
    || !csrfCookieToken
    || !csrfHeaderToken
    || csrfCookieToken !== csrfHeaderToken
  ) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  return next();
};
