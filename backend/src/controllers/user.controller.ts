import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { AuthService } from '../services/auth.service';
import { User } from '../models/User.model';
import { AppError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';
import { routeParam } from '../utils/route-params';
import { safeRegexFragment } from '../utils/safe-regex';

const sanitizeUser = (user: any) => {
  const userObject = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete userObject.password;
  delete userObject.verificationToken;
  delete userObject.verificationTokenExpiry;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetTokenExpiry;
  delete userObject.__v;
  return userObject;
};

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { q, role, status } = req.query as Record<string, string | undefined>;
  const filters: Record<string, unknown> = {};

  const searchFragment = safeRegexFragment(q);
  if (searchFragment) {
    filters.$or = [
      { firstName: { $regex: searchFragment, $options: 'i' } },
      { lastName: { $regex: searchFragment, $options: 'i' } },
      { email: { $regex: searchFragment, $options: 'i' } },
    ];
  }

  if (role) {
    filters.role = role;
  }

  if (status === 'active') {
    filters.isActive = true;
  } else if (status === 'inactive') {
    filters.isActive = false;
  }

  const users = await User.find(filters).sort({ createdAt: -1 });
  return res.json(users.map(sanitizeUser));
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, phone, bio, avatar, preferences } = req.body as Record<string, unknown>;
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (typeof firstName === 'string') user.firstName = firstName.trim();
  if (typeof lastName === 'string') user.lastName = lastName.trim();
  if (typeof phone === 'string') user.phone = phone.trim();
  if (typeof bio === 'string') user.bio = bio.trim();
  if (typeof avatar === 'string') user.avatar = avatar.trim();

  if (preferences && typeof preferences === 'object') {
    user.preferences = {
      ...user.preferences,
      ...(preferences as Record<string, unknown>),
    } as any;
  }

  user.updatedAt = new Date();
  await user.save();

  return res.json(sanitizeUser(user));
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body as Record<string, string>;

  if (!currentPassword || !newPassword) {
    throw new AppError('currentPassword and newPassword are required', 400);
  }

  try {
    await AuthService.changePassword(String(req.user?._id), currentPassword, newPassword);
    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    throw new AppError(error instanceof Error ? error.message : 'Password update failed', 400);
  }
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(routeParam(req.params.userId));

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const { firstName, lastName, email, role, isActive } = req.body as Record<string, unknown>;

  if (typeof firstName === 'string') user.firstName = firstName.trim();
  if (typeof lastName === 'string') user.lastName = lastName.trim();
  if (typeof email === 'string') user.email = email.trim().toLowerCase();
  if (typeof role === 'string') user.role = role as any;
  if (typeof isActive === 'boolean') user.isActive = isActive;

  user.updatedAt = new Date();
  await user.save();

  return res.json(sanitizeUser(user));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(routeParam(req.params.userId));
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isActive = false;
  user.updatedAt = new Date();
  await user.save();

  return res.json({ message: 'User deactivated' });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, role, isActive } = req.body as Record<string, unknown>;

  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new AppError('Email is required', 400);
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
    throw new AppError('First name is required', 400);
  }

  if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
    throw new AppError('Last name is required', 400);
  }

  const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    password: await bcrypt.hash(password, 10),
    role: (role as string) ?? 'student',
    isActive: (isActive as boolean) ?? true,
    emailVerified: true,
  } as Partial<mongoose.Document>);

  return res.status(201).json(sanitizeUser(user));
});
