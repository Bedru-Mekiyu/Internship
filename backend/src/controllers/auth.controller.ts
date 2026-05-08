import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';
import { getOrCreateCsrfToken } from '../middlewares/csrf.middleware';
import type { IUser } from '../types/express.d.ts';

type AuthRequest = Request & { user?: IUser };

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

const getAuthCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieSameSite = parseSameSite(process.env.COOKIE_SAME_SITE, 'lax');
  const cookieSecure = cookieSameSite === 'none'
    ? true
    : parseBoolean(process.env.COOKIE_SECURE, isProduction);

  return {
    access: {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      maxAge: 15 * 60 * 1000,
      path: '/',
    },
    refresh: {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    },
  };
};

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const cookieOptions = getAuthCookieOptions();
  res.cookie('accessToken', accessToken, cookieOptions.access);
  res.cookie('refreshToken', refreshToken, cookieOptions.refresh);
};

const clearAuthCookies = (res: Response) => {
  const cookieOptions = getAuthCookieOptions();
  res.clearCookie('accessToken', { ...cookieOptions.access, maxAge: undefined });
  res.clearCookie('refreshToken', { ...cookieOptions.refresh, maxAge: undefined });
};

const sanitizeUser = (user: any) => {
  if (!user) {
    return null;
  }

  const userObject = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete userObject.password;
  delete userObject.verificationToken;
  delete userObject.verificationTokenExpiry;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetTokenExpiry;
  delete userObject.__v;

  return userObject;
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.registerUser(req.body);
  return res.status(202).json({
    message: 'If the email is eligible, a verification email has been sent.',
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { tokens, user } = await AuthService.loginUser(email, password);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return res.json({ message: 'Login successful', user: sanitizeUser(user) });
  } catch (error) {
    throw new AppError(error instanceof Error ? error.message : 'Authentication failed', 401);
  }
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshTokenFromCookie = req.cookies?.refreshToken;
  const csrfHeaderToken = req.headers['x-csrf-token'];
  const csrfCookieToken = req.cookies?.csrfToken;
  const hasValidCsrfToken =
    typeof csrfHeaderToken === 'string'
    && typeof csrfCookieToken === 'string'
    && csrfHeaderToken.length > 0
    && csrfHeaderToken === csrfCookieToken;

  const refreshToken = refreshTokenFromCookie;

  if (typeof refreshToken !== 'string' || !refreshToken.trim()) {
    throw new AppError('refreshToken is required', 400);
  }

  if (!hasValidCsrfToken) {
    throw new AppError('Valid CSRF token is required for cookie refresh', 403);
  }

  try {
    const newTokens = await AuthService.rotateRefreshToken(refreshToken);
    setAuthCookies(res, newTokens.accessToken, newTokens.refreshToken);
    return res.json({ message: 'Token refreshed' });
  } catch (error) {
    throw new AppError(error instanceof Error ? error.message : 'Invalid refresh token', 401);
  }
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const paramsToken = req.params.token;
  const queryToken = req.query.token as string | undefined;
  const token = paramsToken || queryToken;

  if (typeof token !== 'string' || !token.trim()) {
    throw new AppError('Invalid verification token', 400);
  }

  try {
    const user = await AuthService.verifyEmail(token);
    return res.json({ message: 'Email verified successfully', userId: user._id });
  } catch (error) {
    throw new AppError(error instanceof Error ? error.message : 'Verification failed', 400);
  }
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (typeof email !== 'string' || !email.trim()) {
    throw new AppError('Email is required', 400);
  }

  try {
    await AuthService.resendVerificationEmail(email);
    return res.json({ message: 'If the email is eligible, a new verification email has been sent.' });
  } catch (error) {
    throw new AppError(error instanceof Error ? error.message : 'Failed to resend verification email', 400);
  }
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  return res.json(sanitizeUser(req.user));
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?._id) {
    throw new AppError('Unauthorized', 401);
  }

  await AuthService.logoutUser(String(req.user._id));
  clearAuthCookies(res);
  return res.json({ message: 'Logged out successfully' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (typeof email !== 'string' || !email.trim()) {
    throw new AppError('Email is required', 400);
  }

  try {
    await AuthService.requestPasswordReset(email);
    return res.json({ message: 'If the email exists, a password reset link has been sent.' });
  } catch (error) {
    throw new AppError(error instanceof Error ? error.message : 'Password reset request failed', 400);
  }
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (typeof token !== 'string' || !token.trim()) {
    throw new AppError('Reset token is required', 400);
  }

  if (typeof password !== 'string' || !password.trim()) {
    throw new AppError('Password is required', 400);
  }

  try {
    await AuthService.resetPassword(token, password);
    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    throw new AppError(error instanceof Error ? error.message : 'Password reset failed', 400);
  }
});

export const getCsrfToken = asyncHandler(async (req: Request, res: Response) => {
  const csrfToken = getOrCreateCsrfToken(req, res);
  return res.json({ csrfToken });
});
