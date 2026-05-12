import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

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

const MAGIC_BYTES: Record<string, Array<{ bytes: number[]; offset?: number }>> = {
  'image/jpeg': [{ bytes: [0xFF, 0xD8, 0xFF] }],
  'image/png': [{ bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] }],
  'image/gif': [{ bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] }, { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] }],
  'image/webp': [{ bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 }],
  'application/pdf': [{ bytes: [0x25, 0x50, 0x44, 0x46] }],
  'application/msword': [{ bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1] }],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [{ bytes: [0x50, 0x4B, 0x03, 0x04] }],
  'video/mp4': [{ bytes: [0x66, 0x74, 0x79, 0x70] }, { bytes: [0x00, 0x00, 0x00] }], // ftyp atom or 3gp5/ismo
  'video/webm': [{ bytes: [0x1A, 0x45, 0xDF, 0xA3] }],
  'audio/mpeg': [{ bytes: [0xFF, 0xFB] }, { bytes: [0xFF, 0xFA] }, { bytes: [0xFF, 0xF3] }, { bytes: [0xFF, 0xF2] }],
  'audio/wav': [{ bytes: [0x52, 0x49, 0x46, 0x46] }], // RIFF header
  'audio/ogg': [{ bytes: [0x4F, 0x67, 0x67, 0x53] }], // OggS
};

export const validateMagicBytes = (filePath: string, mimetype: string): boolean => {
  const signatures = MAGIC_BYTES[mimetype];
  if (!signatures || signatures.length === 0) {
    return true;
  }

  try {
    const buffer = Buffer.alloc(Math.max(...signatures.map(s => s.offset ? s.offset + s.bytes.length : s.bytes.length), 8));
    const fd = fs.openSync(filePath, 'r');
    try {
      fs.readSync(fd, buffer, 0, buffer.length, 0);
    } finally {
      fs.closeSync(fd);
    }

    return signatures.some(({ bytes, offset = 0 }) =>
      bytes.every((byte, i) => buffer[offset + i] === byte)
    );
  } catch {
    return false;
  }
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
