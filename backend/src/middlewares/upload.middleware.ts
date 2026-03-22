import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { requireEnv } from '../utils/env';

dotenv.config({ quiet: true });

export const getUploadMiddleware = () => {
  if (process.env.STORAGE_TYPE === 's3') {
    const s3 = new AWS.S3({
      region: requireEnv('AWS_REGION'),
      accessKeyId: requireEnv('AWS_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('AWS_SECRET_ACCESS_KEY'),
    });

    return multer({
      storage: multerS3({
        s3,
        bucket: requireEnv('AWS_S3_BUCKET'),
        metadata: (_req: unknown, file: Express.Multer.File) => ({
          fieldName: file.fieldname,
        }),
        key: (_req: unknown, file: Express.Multer.File, cb: (error: Error | null, key?: string) => void) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    });
  } else {
    return multer({ dest: 'uploads/' });
  }
};