import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const maxUploadSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB || 25);
const uploadLimits = {
  fileSize: Number.isFinite(maxUploadSizeMb) && maxUploadSizeMb > 0
    ? maxUploadSizeMb * 1024 * 1024
    : 25 * 1024 * 1024,
};

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const uploadFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new Error('Unsupported file type'));
    return;
  }

  const raw = typeof file.originalname === 'string' ? file.originalname : '';
  const basename = raw.replace(/^.*[/\\]/, '').slice(0, 240);
  if (!basename || basename.includes('..')) {
    cb(new Error('Invalid file name'));
    return;
  }

  Object.assign(file, { originalname: basename });
  cb(null, true);
};

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