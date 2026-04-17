import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';
import { getOrCreateCsrfToken } from '../middlewares/csrf.middleware';

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
};

const isProduction = process.env.NODE_ENV === 'production';
const cookieSecure = parseBoolean(process.env.COOKIE_SECURE, isProduction);
const cookieSameSite = (process.env.COOKIE_SAME_SITE || 'lax') as 'lax' | 'strict' | 'none';

const accessCookieOptions = {
  httpOnly: true,
  secure: cookieSecure,
  sameSite: cookieSameSite,
  maxAge: 15 * 60 * 1000,
  path: '/',
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: cookieSecure,
  sameSite: cookieSameSite,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('accessToken', accessToken, accessCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie('accessToken', { ...accessCookieOptions, maxAge: undefined });
  res.clearCookie('refreshToken', { ...refreshCookieOptions, maxAge: undefined });
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
  try {
    const user = await AuthService.registerUser(req.body);
    const message = user.emailVerified
      ? 'User registered successfully.'
      : 'User registered. Check email for verification.';

    return res.status(201).json({ message, userId: user._id });
  } catch (error) {
    throw new AppError(error instanceof Error ? error.message : 'Registration failed', 400);
  }
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
  const refreshTokenFromBody = req.body.refreshToken;
  const refreshTokenFromCookie = req.cookies?.refreshToken;
  const refreshToken = typeof refreshTokenFromBody === 'string' && refreshTokenFromBody.trim()
    ? refreshTokenFromBody
    : refreshTokenFromCookie;

  if (typeof refreshToken !== 'string' || !refreshToken.trim()) {
    throw new AppError('refreshToken is required', 400);
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
  const { token } = req.params;
  if (typeof token !== 'string') {
    throw new AppError('Invalid verification token', 400);
  }

  try {
    const user = await AuthService.verifyEmail(token);
    return res.json({ message: 'Email verified successfully', userId: user._id });
  } catch (error) {
    throw new AppError(error instanceof Error ? error.message : 'Verification failed', 400);
  }
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  return res.json(sanitizeUser(req.user));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?._id) {
    throw new AppError('Unauthorized', 401);
  }

  await AuthService.logoutUser(req.user._id.toString());
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