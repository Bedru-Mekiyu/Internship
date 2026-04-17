import { Request, Response } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Content } from '../models/Content.model';
import { Media } from '../models/Media.model';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/http-error';
import { requireEnv } from '../utils/env';

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

  if (q && q.trim()) {
    const search = q.trim();
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
    fileName = `${Date.now()}-${file.originalname}`;

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
  const media = await Media.find();
  return res.json(media);
});