<<<<<<< HEAD
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

=======
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
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
<<<<<<< HEAD
      requestId?: string;
=======
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
    }
  }
}

<<<<<<< HEAD
export {};
=======
export {};
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
