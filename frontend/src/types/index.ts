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
    marketingEmails?: boolean;
  };
  themeMode?: 'light' | 'dark' | 'system';
}

export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
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
  address?: UserAddress;
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

export interface CourseModuleLesson {
  _id?: string;
  title: string;
  type?: string;
  duration?: number;
  content?: string;
  videoUrl?: string;
  notes?: string;
  attachments?: Array<{
    name?: string;
    size?: string;
    url?: string;
    mediaId?: string;
  }>;
  status?: 'draft' | 'published' | 'scheduled';
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
  subcategory?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  status?: 'draft' | 'published' | 'archived';
  pricing?: {
    type?: 'free' | 'paid' | 'subscription';
    amount?: number;
    currency?: string;
    discount?: {
      percentage?: number;
      validUntil?: string;
    };
  };
  instructor?: string | AuthUser;
  modules?: CourseModule[];
  prerequisites?: string[];
  learningOutcomes?: string[];
  reviews?: Array<{
    user?: string | AuthUser;
    rating?: number;
    comment?: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
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
  blocks?: ContentBlock[];
  status?: 'draft' | 'published' | 'archived';
  author?: string | AuthUser;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'form' | 'testimonial' | 'hero' | 'features' | 'cta';
  content: string;
  title?: string;
  order: number;
  styles?: Record<string, unknown>;
}

export interface Assignment {
  _id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  description?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Submission {
  _id: string;
  assignmentId: string;
  userId: string | { _id: string; firstName: string; lastName: string; email: string };
  content: string;
  grade?: number;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LiveSession {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  provider: 'zoom' | 'jitsi' | 'google_meet';
  meetingUrl: string;
  meetingId?: string;
  password?: string;
  startTime: string;
  endTime?: string;
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
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
