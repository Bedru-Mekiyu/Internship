import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import { PutObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { AuthService } from '../services/auth.service';
import { User } from '../models/User.model';
import { AppError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';
import { requireEnv } from '../utils/env';
import { routeParam } from '../utils/route-params';
import { safeRegexFragment } from '../utils/safe-regex';

const buildS3Client = () => new S3Client({
  region: requireEnv('AWS_REGION'),
  credentials: {
    accessKeyId: requireEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('AWS_SECRET_ACCESS_KEY'),
  },
});

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

export const uploadMeAvatar = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const file = req.file;
  if (!file) {
    throw new AppError('No avatar file uploaded', 400);
  }

  if (!file.mimetype.startsWith('image/')) {
    throw new AppError('Avatar must be an image', 400);
  }

  const oldAvatar = user.avatar;
  let avatarUrl = `/uploads/${file.filename}`;

  if (process.env.STORAGE_TYPE === 's3') {
    if (!file.buffer) {
      throw new AppError('Missing file buffer for S3 upload', 500);
    }

    const bucket = requireEnv('AWS_S3_BUCKET');
    const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
    const objectKey = `avatars/${Date.now()}-${randomUUID()}${extension}`;
    const s3 = buildS3Client();
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    }));

    avatarUrl = `https://${bucket}.s3.${requireEnv('AWS_REGION')}.amazonaws.com/${objectKey}`;
  }

  if (oldAvatar) {
    try {
      if (oldAvatar.startsWith('http') && oldAvatar.includes('.s3.')) {
        const s3 = buildS3Client();
        const bucket = requireEnv('AWS_S3_BUCKET');
        const key = oldAvatar.split('.amazonaws.com/')[1];
        if (key) {
          await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        }
      } else if (oldAvatar.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), oldAvatar);
        await fs.promises.unlink(filePath);
      }
    } catch (deleteError) {
      console.warn('Failed to delete old avatar:', deleteError);
    }
  }

  user.avatar = avatarUrl;
  user.updatedAt = new Date();
  await user.save();

  return res.json({
    message: 'Avatar updated successfully',
    avatar: avatarUrl,
    user: sanitizeUser(user),
  });
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
