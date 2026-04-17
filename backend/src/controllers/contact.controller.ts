import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ContactMessage } from '../models/ContactMessage.model';
import { AppError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';

const validStatuses = new Set(['new', 'in_progress', 'resolved']);

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

export const createContactMessage = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, phone, message } = req.body as {
    fullName?: string;
    email?: string;
    phone?: string;
    message?: string;
  };

  const normalizedName = typeof fullName === 'string' ? fullName.trim() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';
  const normalizedMessage = typeof message === 'string' ? message.trim() : '';

  if (!normalizedName) {
    throw new AppError('fullName is required', 400);
  }

  if (!normalizedEmail) {
    throw new AppError('email is required', 400);
  }

  if (!normalizedMessage) {
    throw new AppError('message is required', 400);
  }

  const savedMessage = await ContactMessage.create({
    fullName: normalizedName,
    email: normalizedEmail,
    phone: normalizedPhone,
    message: normalizedMessage,
    status: 'new',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return res.status(201).json({
    id: String(savedMessage._id),
    message: 'Contact message received',
  });
});

export const getContactMessages = asyncHandler(async (req: Request, res: Response) => {
  const { q, status, mine } = req.query as Record<string, string | undefined>;
  const limit = parseLimit(req.query.limit);
  const page = parsePage(req.query.page);
  const skip = (page - 1) * limit;

  const filters: Record<string, unknown> = {};

  if (status && validStatuses.has(status)) {
    filters.status = status;
  }

  if (q && q.trim()) {
    const query = q.trim();
    filters.$or = [
      { fullName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { message: { $regex: query, $options: 'i' } },
    ];
  }

  if (mine === 'true') {
    filters.assignedTo = req.user?._id;
  }

  const [messages, total] = await Promise.all([
    ContactMessage.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reviewedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email'),
    ContactMessage.countDocuments(filters),
  ]);

  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  return res.json({
    data: messages,
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

export const updateContactMessageStatus = asyncHandler(async (req: Request, res: Response) => {
  const { contactMessageId } = req.params as { contactMessageId: string };
  const { status, reviewNotes } = req.body as { status?: string; reviewNotes?: string };

  if (!mongoose.Types.ObjectId.isValid(contactMessageId)) {
    throw new AppError('Invalid contact message id', 400);
  }

  if (!status || !validStatuses.has(status)) {
    throw new AppError('Valid status is required', 400);
  }

  const contactMessage = await ContactMessage.findById(contactMessageId);
  if (!contactMessage) {
    throw new AppError('Contact message not found', 404);
  }

  contactMessage.status = status as 'new' | 'in_progress' | 'resolved';
  if (typeof reviewNotes === 'string') {
    contactMessage.reviewNotes = reviewNotes.trim();
  }
  contactMessage.reviewedBy = req.user?._id;
  contactMessage.reviewedAt = new Date();
  contactMessage.updatedAt = new Date();

  await contactMessage.save();
  await contactMessage.populate('reviewedBy', 'firstName lastName email');
  await contactMessage.populate('assignedTo', 'firstName lastName email');

  return res.json(contactMessage);
});

export const assignContactMessage = asyncHandler(async (req: Request, res: Response) => {
  const { contactMessageId } = req.params as { contactMessageId: string };
  const { assignedTo } = req.body as { assignedTo?: string };

  if (!mongoose.Types.ObjectId.isValid(contactMessageId)) {
    throw new AppError('Invalid contact message id', 400);
  }

  const contactMessage = await ContactMessage.findById(contactMessageId);
  if (!contactMessage) {
    throw new AppError('Contact message not found', 404);
  }

  const targetUserId = assignedTo || String(req.user?._id || '');
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new AppError('Invalid assignedTo value', 400);
  }

  contactMessage.assignedTo = new mongoose.Types.ObjectId(targetUserId);
  contactMessage.assignedAt = new Date();
  contactMessage.updatedAt = new Date();

  await contactMessage.save();
  await contactMessage.populate('assignedTo', 'firstName lastName email');
  await contactMessage.populate('reviewedBy', 'firstName lastName email');

  return res.json(contactMessage);
});
