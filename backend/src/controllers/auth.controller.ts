import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = await AuthService.registerUser(req.body);
    return res.status(201).json({ message: 'User registered. Check email for verification.', userId: user._id });
  } catch (error) {
    throw new AppError(error instanceof Error ? error.message : 'Registration failed', 400);
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const tokens = await AuthService.loginUser(email, password);
    return res.json(tokens);
  } catch (error) {
    throw new AppError(error instanceof Error ? error.message : 'Authentication failed', 401);
  }
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (typeof refreshToken !== 'string' || !refreshToken.trim()) {
    throw new AppError('refreshToken is required', 400);
  }

  try {
    const newTokens = await AuthService.rotateRefreshToken(refreshToken);
    return res.json(newTokens);
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
  return res.json(req.user);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?._id) {
    throw new AppError('Unauthorized', 401);
  }

  await AuthService.logoutUser(req.user._id.toString());
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