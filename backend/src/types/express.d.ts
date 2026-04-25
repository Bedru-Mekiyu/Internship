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

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        key?: string;
        location?: string;
      }
    }

    interface Request {
      user?: any;
      requestId?: string;
    }
  }
}

export {};