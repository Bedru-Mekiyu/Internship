import { Request, Response } from 'express';
import { S3Client, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { randomUUID } from 'crypto';
import { rm } from 'fs/promises';
import mongoose from 'mongoose';
import { Content } from '../models/Content.model';
import { Media } from '../models/Media.model';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/http-error';
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

export const getContents = asyncHandler(async (_req: Request, res: Response) => {
  const contents = await Content.find({ status: 'published' });
  return res.json(contents);
});

export const getManagedContents = asyncHandler(async (req: Request, res: Response) => {
  const {
    status,
    type,
    author,
    q,
  } = req.query as Record<string, string | undefined>;

  const filters: Record<string, unknown> = {};
  if (status) filters.status = status;
  if (type) filters.type = type;
  if (author) filters.author = author;

  const search = safeRegexFragment(q);
  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
      { 'blocks.content': { $regex: search, $options: 'i' } },
    ];
  }

  const contents = await Content.find(filters).sort({ updatedAt: -1 });
  return res.json(contents);
});

export const getContentBySlug = asyncHandler(async (req: Request, res: Response) => {
  const content = await Content.findOne({ slug: req.params.slug, status: 'published' });
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

  let fileUrl = `/uploads/${file.filename}`;
  let fileName = file.filename;

  if (process.env.STORAGE_TYPE === 's3') {
    if (!file.buffer) {
      throw new AppError('Missing file buffer for S3 upload', 500);
    }

    const bucket = requireEnv('AWS_S3_BUCKET');
    const s3 = buildS3Client();
    const extension = path.extname(file.originalname).toLowerCase();
    fileName = `${Date.now()}-${randomUUID()}${extension}`;

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    fileUrl = `https://${bucket}.s3.${requireEnv('AWS_REGION')}.amazonaws.com/${fileName}`;
  }

  const media = new Media({
    filename: fileName,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: fileUrl,
  });
  await media.save();

  return res.json(media);
});

export const getMedia = asyncHandler(async (_req: Request, res: Response) => {
  const media = await Media.find().sort({ createdAt: -1 });
  return res.json(media);
});

const resolveS3ObjectKey = (media: { filename?: string; url?: string }) => {
  const keyFromFilename = typeof media.filename === 'string' ? media.filename.trim() : '';
  if (keyFromFilename) {
    return keyFromFilename;
  }

  const rawUrl = typeof media.url === 'string' ? media.url.trim() : '';
  if (!rawUrl) {
    return '';
  }

  try {
    const parsed = new URL(rawUrl);
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
  } catch {
    return '';
  }
};

export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  const mediaId = routeParam(req.params.id);
  if (!mongoose.Types.ObjectId.isValid(mediaId)) {
    throw new AppError('Invalid media id', 400);
  }

  const media = await Media.findById(mediaId);
  if (!media) {
    throw new AppError('Media not found', 404);
  }

  if (process.env.STORAGE_TYPE === 's3') {
    const key = resolveS3ObjectKey(media);
    if (!key) {
      throw new AppError('Invalid media storage key', 500);
    }

    const s3 = buildS3Client();
    await s3.send(new DeleteObjectCommand({
      Bucket: requireEnv('AWS_S3_BUCKET'),
      Key: key,
    }));
  } else {
    const uploadRoot = path.resolve(process.cwd(), 'uploads');
    const safeFilename = path.basename(media.filename || '');
    if (!safeFilename || safeFilename !== media.filename) {
      throw new AppError('Invalid media storage key', 500);
    }

    const uploadPath = path.resolve(uploadRoot, safeFilename);
    if (!uploadPath.startsWith(`${uploadRoot}${path.sep}`)) {
      throw new AppError('Invalid media storage key', 500);
    }

    await rm(uploadPath, { force: true });
  }

  const deletionResult = await Media.deleteOne({ _id: media._id });
  if (deletionResult.deletedCount !== 1) {
    throw new AppError('Media not found', 404);
  }

  return res.json({ message: 'Media deleted', id: String(media._id) });
});

export const renameMedia = asyncHandler(async (req: Request, res: Response) => {
  const mediaId = routeParam(req.params.id);
  if (!mongoose.Types.ObjectId.isValid(mediaId)) {
    throw new AppError('Invalid media id', 400);
  }

  const nextName = typeof req.body.originalName === 'string' ? req.body.originalName.trim() : '';
  if (!nextName) {
    throw new AppError('originalName is required', 400);
  }

  const media = await Media.findById(mediaId);
  if (!media) {
    throw new AppError('Media not found', 404);
  }

  media.originalName = nextName;
  await media.save();

  return res.json(media);
});
