import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor' | 'admin' | 'content_manager';
  isActive: boolean;
  emailVerified: boolean;
  tokenVersion?: number;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
    requestId?: string;
  }
}

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        key?: string;
        location?: string;
      }
    }
  }
}

export {};