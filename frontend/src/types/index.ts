export type LearnSpaceRole = 'student' | 'instructor' | 'admin' | 'content_manager';

export interface ApiResponse<T> {
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserPreferences {
  language?: string;
  timezone?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
}

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: LearnSpaceRole;
  avatar?: string;
  bio?: string;
  phone?: string;
  isActive?: boolean;
  preferences?: UserPreferences;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'student' | 'instructor';
}

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthLoginResponse {
  message: string;
  user?: AuthUser;
  accessToken?: string;
}

export interface CourseModuleLesson {
  _id?: string;
  title: string;
  type?: string;
  duration?: number;
  content?: string;
  order?: number;
}

export interface CourseModule {
  _id?: string;
  title: string;
  description?: string;
  order?: number;
  lessons?: CourseModuleLesson[];
}

export interface Course {
  _id: string;
  title: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  status?: 'draft' | 'published' | 'archived';
  instructor?: string | AuthUser;
  modules?: CourseModule[];
  duration?: number;
  enrollmentCount?: number;
  rating?: {
    average?: number;
    count?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseProgress {
  progress: number;
  completedLessons: string[];
  updatedAt?: string;
}

export interface CourseReviewPayload {
  rating: number;
  review?: string;
}

export interface ContentItem {
  _id: string;
  type?: string;
  title: string;
  slug: string;
  content?: string;
  status?: 'draft' | 'published' | 'archived';
  author?: string | AuthUser;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaItem {
  _id: string;
  filename: string;
  originalName?: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt?: string;
}
