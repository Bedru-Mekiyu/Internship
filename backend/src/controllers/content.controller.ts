import { Request, Response } from 'express';
import { Content } from '../models/Content.model';
import { Media } from '../models/Media.model';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/http-error';

export const getContents = asyncHandler(async (_req: Request, res: Response) => {
  const contents = await Content.find();
  return res.json(contents);
});

export const getContentBySlug = asyncHandler(async (req: Request, res: Response) => {
  const content = await Content.findOne({ slug: req.params.slug });
  if (!content) {
    throw new AppError('Not found', 404);
  }

  return res.json(content);
});

export const createContent = asyncHandler(async (req: Request, res: Response) => {
  const content = new Content({ ...req.body, author: req.user?._id });
  await content.save();
  return res.status(201).json(content);
});

export const updateContent = asyncHandler(async (req: Request, res: Response) => {
  const content = await Content.findById(req.params.id);
  if (!content) {
    throw new AppError('Not found', 404);
  }

  if (!content.author) {
    throw new AppError('Invalid content author', 400);
  }

  if (req.user?.role !== 'admin' && content.author.toString() !== req.user?._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  const updated = await Content.findByIdAndUpdate(req.params.id, req.body, { new: true });
  return res.json(updated);
});

export const deleteContent = asyncHandler(async (req: Request, res: Response) => {
  const content = await Content.findById(req.params.id);
  if (!content) {
    throw new AppError('Not found', 404);
  }

  if (!content.author) {
    throw new AppError('Invalid content author', 400);
  }

  if (req.user?.role !== 'admin' && content.author.toString() !== req.user?._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  await Content.findByIdAndDelete(req.params.id);
  return res.json({ message: 'Deleted' });
});

export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    throw new AppError('No file', 400);
  }

  const media = new Media({
    filename: file.filename || file.key,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: process.env.STORAGE_TYPE === 's3' ? file.location : `/uploads/${file.filename}`,
  });
  await media.save();

  return res.json(media);
});

export const getMedia = asyncHandler(async (_req: Request, res: Response) => {
  const media = await Media.find();
  return res.json(media);
});