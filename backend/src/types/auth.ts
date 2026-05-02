import { Request } from 'express';

export interface AuthUser {
  _id: unknown;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'student' | 'instructor' | 'admin' | 'content_manager';
  isActive: boolean;
  emailVerified?: boolean;
  tokenVersion?: number;
}

export type AuthRequest = Request & { user?: AuthUser };