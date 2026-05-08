import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ quiet: true });

const DEFAULT_MAX_UPLOAD_SIZE_MB = 250;
const DEFAULT_MAX_AVATAR_UPLOAD_SIZE_MB = 5;
const maxUploadSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB || DEFAULT_MAX_UPLOAD_SIZE_MB);
const uploadLimits = {
  fileSize: Number.isFinite(maxUploadSizeMb) && maxUploadSizeMb > 0
    ? maxUploadSizeMb * 1024 * 1024
    : DEFAULT_MAX_UPLOAD_SIZE_MB * 1024 * 1024,
};
const maxAvatarUploadSizeMb = Number(process.env.MAX_AVATAR_UPLOAD_SIZE_MB || DEFAULT_MAX_AVATAR_UPLOAD_SIZE_MB);
const avatarUploadLimits = {
  fileSize: Number.isFinite(maxAvatarUploadSizeMb) && maxAvatarUploadSizeMb > 0
    ? maxAvatarUploadSizeMb * 1024 * 1024
    : DEFAULT_MAX_AVATAR_UPLOAD_SIZE_MB * 1024 * 1024,
};

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const allowedAvatarMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const allowedExtensionsByMime: Record<string, Set<string>> = {
  'image/jpeg': new Set(['.jpg', '.jpeg']),
  'image/png': new Set(['.png']),
  'image/webp': new Set(['.webp']),
  'image/gif': new Set(['.gif']),
  'video/mp4': new Set(['.mp4']),
  'video/webm': new Set(['.webm']),
  'video/quicktime': new Set(['.mov']),
  'video/ogg': new Set(['.ogv', '.ogg']),
  'audio/mpeg': new Set(['.mp3']),
  'audio/wav': new Set(['.wav']),
  'audio/ogg': new Set(['.ogg']),
  'application/pdf': new Set(['.pdf']),
  'application/msword': new Set(['.doc']),
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': new Set(['.docx']),
};

const createUploadFileFilter = (mimeTypes: ReadonlySet<string>): multer.Options['fileFilter'] => {
  return (_req, file, cb) => {
    if (!mimeTypes.has(file.mimetype)) {
      cb(new Error('Unsupported file type'));
      return;
    }

    const raw = typeof file.originalname === 'string' ? file.originalname : '';
    const basename = raw.replace(/^.*[/\\]/, '').slice(0, 240).replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
    if (!basename || basename.length < 3 || basename.includes('..') || basename.includes('/') || basename.includes('\\')) {
      cb(new Error('Invalid file name'));
      return;
    }

    const extension = path.extname(basename).toLowerCase();
    const allowedExtensions = allowedExtensionsByMime[file.mimetype];
    if (!extension || !allowedExtensions || !allowedExtensions.has(extension)) {
      cb(new Error('Unsupported file extension for mime type'));
      return;
    }

    Object.assign(file, { originalname: basename });
    cb(null, true);
  };
};

const uploadFileFilter = createUploadFileFilter(allowedMimeTypes);
const avatarUploadFileFilter = createUploadFileFilter(allowedAvatarMimeTypes);

export const getUploadMiddleware = () => {
  if (process.env.STORAGE_TYPE === 's3') {
    return multer({
      storage: multer.memoryStorage(),
      limits: uploadLimits,
      fileFilter: uploadFileFilter,
    });
  } else {
    return multer({
      dest: 'uploads/',
      limits: uploadLimits,
      fileFilter: uploadFileFilter,
    });
  }
};

export const getAvatarUploadMiddleware = () => {
  if (process.env.STORAGE_TYPE === 's3') {
    return multer({
      storage: multer.memoryStorage(),
      limits: avatarUploadLimits,
      fileFilter: avatarUploadFileFilter,
    });
  }

  return multer({
    dest: 'uploads/',
    limits: avatarUploadLimits,
    fileFilter: avatarUploadFileFilter,
  });
};
