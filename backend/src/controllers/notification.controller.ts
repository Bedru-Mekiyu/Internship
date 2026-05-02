import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification.model';
import { User } from '../models/User.model';
import { Enrollment } from '../models/Enrollment.model';
import { AppError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';
import { routeParam } from '../utils/route-params';
import { safeRegexFragment } from '../utils/safe-regex';
import { emitToUser } from '../utils/socket-notify';

const validTypes = new Set(['enrollment', 'assignment', 'discussion', 'system']);

const parseLimit = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 20;
  }

  return Math.min(Math.trunc(parsed), 100);
};

const parsePage = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }

  return Math.trunc(parsed);
};

const normalizeType = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) {
    return 'system' as const;
  }

  const trimmed = value.trim();
  if (!validTypes.has(trimmed)) {
    throw new AppError('Invalid notification type', 400);
  }

  return trimmed as 'enrollment' | 'assignment' | 'discussion' | 'system';
};

const ensureNotificationOwnership = async (notificationId: string, userId: string, role: string) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new AppError('Invalid notification id', 400);
  }

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (role !== 'admin' && notification.userId.toString() !== userId) {
    throw new AppError('Not authorized', 403);
  }

  return notification;
};

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseLimit(req.query.limit);
  const page = parsePage(req.query.page);
  const { isRead, type, q } = req.query as Record<string, string | undefined>;

  const filters: Record<string, unknown> = { userId: req.user?._id };

  if (typeof isRead === 'string' && isRead.length > 0) {
    if (isRead !== 'true' && isRead !== 'false') {
      throw new AppError('isRead must be true or false', 400);
    }

    filters.isRead = isRead === 'true';
  }

  if (type) {
    filters.type = normalizeType(type);
  }

  const searchFragment = safeRegexFragment(q);
  if (searchFragment) {
    filters.$or = [
      { title: { $regex: searchFragment, $options: 'i' } },
      { message: { $regex: searchFragment, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filters),
  ]);

  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  return res.json({
    data: notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

export const getMyUnreadNotificationCount = asyncHandler(async (req: Request, res: Response) => {
  const unreadCount = await Notification.countDocuments({ userId: req.user?._id, isRead: false });
  return res.json({ unreadCount });
});

export const createNotification = asyncHandler(async (req: Request, res: Response) => {
  const { userId, title, message, type } = req.body as {
    userId?: string;
    title?: string;
    message?: string;
    type?: 'enrollment' | 'assignment' | 'discussion' | 'system';
  };

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Valid userId is required', 400);
  }

  const normalizedTitle = typeof title === 'string' ? title.trim() : '';
  const normalizedMessage = typeof message === 'string' ? message.trim() : '';

  if (!normalizedTitle) {
    throw new AppError('title is required', 400);
  }

  if (!normalizedMessage) {
    throw new AppError('message is required', 400);
  }

  const userRole = req.user?.role;
  const adminCanNotifyAll = userRole === 'admin';

  if (!adminCanNotifyAll && userRole === 'instructor') {
    const userExists = await User.findById(userId).select('_id');
    if (!userExists) {
      throw new AppError('User not found', 404);
    }
    
    const isStudentEnrolled = await Enrollment.findOne({
      userId,
      courseId: { $exists: true },
    }).populate({
      path: 'courseId',
      match: { instructor: req.user?._id },
    });
    
    if (!isStudentEnrolled?.courseId) {
      throw new AppError('You can only notify students enrolled in your courses', 403);
    }
  }

  const normalizedType = normalizeType(type);
  const notification = new Notification({
    userId,
    type: normalizedType,
    title: normalizedTitle,
    message: normalizedMessage,
    isRead: false,
    createdAt: new Date(),
  });

  await notification.save();
  emitToUser(req.app, String(userId), 'notification:new', {
    _id: notification._id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  });
  return res.status(201).json(notification);
});

export const createBulkNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { userIds, role, title, message, type } = req.body as {
    userIds?: string[];
    role?: 'student' | 'instructor' | 'admin' | 'content_manager';
    title?: string;
    message?: string;
    type?: 'enrollment' | 'assignment' | 'discussion' | 'system';
  };

  const normalizedTitle = typeof title === 'string' ? title.trim() : '';
  const normalizedMessage = typeof message === 'string' ? message.trim() : '';
  if (!normalizedTitle) {
    throw new AppError('title is required', 400);
  }

  if (!normalizedMessage) {
    throw new AppError('message is required', 400);
  }

  const normalizedType = normalizeType(type);

  const roleSet = new Set(['student', 'instructor', 'admin', 'content_manager']);
  if (role && !roleSet.has(role)) {
    throw new AppError('Invalid target role', 400);
  }

  const normalizedUserIds = Array.isArray(userIds)
    ? userIds.filter((id): id is string => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id))
    : [];

  if (!role && normalizedUserIds.length === 0) {
    throw new AppError('Either role or userIds is required', 400);
  }

  const userFilter: Record<string, unknown> = { isActive: true };
  if (role) userFilter.role = role;
  if (normalizedUserIds.length > 0) userFilter._id = { $in: normalizedUserIds };

  const recipients = await User.find(userFilter).select('_id');
  if (recipients.length === 0) {
    throw new AppError('No recipients found', 404);
  }

  const docs = recipients.map((recipient) => ({
    userId: recipient._id,
    type: normalizedType,
    title: normalizedTitle,
    message: normalizedMessage,
    isRead: false,
    createdAt: new Date(),
  }));

  const inserted = await Notification.insertMany(docs, { ordered: false });
  return res.status(201).json({ createdCount: inserted.length });
});

export const cleanupNotifications = asyncHandler(async (req: Request, res: Response) => {
  const {
    olderThanDays,
    onlyRead,
    userId,
    type,
  } = req.body as {
    olderThanDays?: number;
    onlyRead?: boolean;
    userId?: string;
    type?: 'enrollment' | 'assignment' | 'discussion' | 'system';
  };

  const parsedDays = Number(olderThanDays);
  if (!Number.isFinite(parsedDays) || parsedDays <= 0) {
    throw new AppError('olderThanDays must be a positive number', 400);
  }

  const filters: Record<string, unknown> = {
    createdAt: {
      $lt: new Date(Date.now() - Math.trunc(parsedDays) * 24 * 60 * 60 * 1000),
    },
  };

  if (onlyRead === true) {
    filters.isRead = true;
  }

  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid userId', 400);
    }

    filters.userId = userId;
  }

  if (type) {
    filters.type = normalizeType(type);
  }

  const result = await Notification.deleteMany(filters);

  return res.json({ deletedCount: result.deletedCount || 0 });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notificationId = routeParam(req.params.notificationId);

  const notification = await ensureNotificationOwnership(
    notificationId,
    req.user?._id?.toString() || '',
    req.user?.role || ''
  );

  notification.isRead = true;
  await notification.save();

  return res.json(notification);
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  const result = await Notification.updateMany(
    { userId: req.user?._id, isRead: false },
    { $set: { isRead: true } }
  );

  return res.json({ modifiedCount: result.modifiedCount || 0 });
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const notificationId = routeParam(req.params.notificationId);

  await ensureNotificationOwnership(
    notificationId,
    req.user?._id?.toString() || '',
    req.user?.role || ''
  );

  await Notification.findByIdAndDelete(notificationId);
  return res.json({ message: 'Deleted' });
});
