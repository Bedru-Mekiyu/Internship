import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../../src/models/User.model';
import { Course } from '../../src/models/Course.model';
import { AuthService } from '../../src/services/auth.service';

export type TestUserRole = 'student' | 'instructor' | 'admin' | 'content_manager';

export interface TestUser {
  _id: string | mongoose.Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  role: TestUserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  tokenVersion: number;
  password: string;
}

export interface AuthenticatedUser {
  user: TestUser;
  accessToken: string;
  refreshToken: string;
  accessCookie: string;
  refreshCookie: string;
  fullCookie: string;
}

export interface TestFixtures {
  student: AuthenticatedUser;
  instructor: AuthenticatedUser;
  admin: AuthenticatedUser;
  contentManager: AuthenticatedUser;
  course: mongoose.Document | null;
  cleanup: () => Promise<void>;
}

const BCRYPT_ROUNDS = 10;
const JWT_SECRET = () => process.env.JWT_ACCESS_SECRET || 'test_access_secret_fallback_min32chars';

async function createTestUserInDb(
  role: TestUserRole,
  _index: number
): Promise<TestUser> {
  const uniqueId = new mongoose.Types.ObjectId();
  const email = `test-${role}-${uniqueId.toString().slice(-8)}@test.com`;
  const hashedPassword = await bcrypt.hash('TestPass123!', BCRYPT_ROUNDS);

  const user = await User.create({
    _id: uniqueId,
    email,
    password: hashedPassword,
    firstName: `${role.charAt(0).toUpperCase()}${role.slice(1)}`,
    lastName: 'User',
    role,
    isActive: true,
    emailVerified: true,
    preferences: {
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        marketingEmails: false,
      },
    },
    gamification: {
      points: 0,
      level: 1,
      badges: [],
    },
  });

  return {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as TestUserRole,
    isActive: user.isActive,
    isEmailVerified: user.emailVerified,
    tokenVersion: user.tokenVersion ?? 0,
    password: 'TestPass123!',
  };
}

function generateTokensForUser(user: TestUser): { accessToken: string; refreshToken: string } {
  return AuthService.generateTokens(user._id.toString(), user.tokenVersion);
}

function createCookies(
  accessToken: string,
  refreshToken: string
): { accessCookie: string; refreshCookie: string; fullCookie: string } {
  const accessCookie = `accessToken=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=Strict`;
  const refreshCookie = `refreshToken=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; SameSite=Strict`;
  const fullCookie = `${accessCookie.split(';')[0]}; ${refreshCookie.split(';')[0]}`;
  return { accessCookie, refreshCookie, fullCookie };
}

export async function createTestFixtures(): Promise<TestFixtures> {
  const student = await createTestUserInDb('student', 1);
  const instructor = await createTestUserInDb('instructor', 2);
  const admin = await createTestUserInDb('admin', 3);
  const contentManager = await createTestUserInDb('content_manager', 4);

  const studentTokens = generateTokensForUser(student);
  const instructorTokens = generateTokensForUser(instructor);
  const adminTokens = generateTokensForUser(admin);
  const cmTokens = generateTokensForUser(contentManager);

  const authenticatedStudent: AuthenticatedUser = {
    user: student,
    ...studentTokens,
    ...createCookies(studentTokens.accessToken, studentTokens.refreshToken),
  };
  const authenticatedInstructor: AuthenticatedUser = {
    user: instructor,
    ...instructorTokens,
    ...createCookies(instructorTokens.accessToken, instructorTokens.refreshToken),
  };
  const authenticatedAdmin: AuthenticatedUser = {
    user: admin,
    ...adminTokens,
    ...createCookies(adminTokens.accessToken, adminTokens.refreshToken),
  };
  const authenticatedCM: AuthenticatedUser = {
    user: contentManager,
    ...cmTokens,
    ...createCookies(cmTokens.accessToken, cmTokens.refreshToken),
  };

  const course = await Course.create({
    title: 'Test Course for Fixtures',
    slug: `test-course-fixtures-${Date.now()}`,
    description: 'A test course created by fixtures',
    instructor: instructor._id,
    status: 'published',
    category: 'Development',
    level: 'beginner',
    pricing: { type: 'free', price: 0 },
  });

  const userIds = [student._id, instructor._id, admin._id, contentManager._id];

  return {
    student: authenticatedStudent,
    instructor: authenticatedInstructor,
    admin: authenticatedAdmin,
    contentManager: authenticatedCM,
    course,
    cleanup: async () => {
      const connState = (await import('mongoose')).default.connection.readyState;
      if (connState !== 1) return;
      await User.deleteMany({ _id: { $in: userIds } });
      if (course) {
        await Course.deleteMany({ _id: course._id });
      }
    },
  };
}

export function createMockUser(role: TestUserRole = 'student'): TestUser {
  const id = new mongoose.Types.ObjectId();
  return {
    _id: id,
    email: `mock-${role}-${Date.now()}@mock.com`,
    firstName: 'Mock',
    lastName: 'User',
    role,
    isActive: true,
    isEmailVerified: true,
    tokenVersion: 1,
    password: 'MockPass123!',
  };
}

export function createMockAuthenticatedUser(role: TestUserRole = 'student'): AuthenticatedUser {
  const user = createMockUser(role);
  const tokens = AuthService.generateTokens(user._id.toString(), user.tokenVersion);
  return {
    user,
    ...tokens,
    ...createCookies(tokens.accessToken, tokens.refreshToken),
  };
}

export function createExpiredToken(user: TestUser): string {
  return jwt.sign(
    { userId: user._id.toString(), type: 'access', tokenVersion: user.tokenVersion },
    JWT_SECRET(),
    { expiresIn: '-1s' }
  );
}

export function createExpiredRefreshToken(user: TestUser): string {
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret_min_32_chars_here';
  return jwt.sign(
    { userId: user._id.toString(), type: 'refresh', tokenVersion: user.tokenVersion },
    refreshSecret,
    { expiresIn: '-1s' }
  );
}

export function createInvalidToken(): string {
  return 'invalid.token.here';
}

export function createWrongTypeToken(user: TestUser): string {
  return jwt.sign(
    { userId: user._id.toString(), type: 'refresh', tokenVersion: user.tokenVersion },
    JWT_SECRET(),
    { expiresIn: '15m' }
  );
}

export function createRevokedToken(user: TestUser): string {
  return jwt.sign(
    { userId: user._id.toString(), type: 'access', tokenVersion: user.tokenVersion + 1 },
    JWT_SECRET(),
    { expiresIn: '15m' }
  );
}

export async function invalidateUserToken(userId: mongoose.Types.ObjectId): Promise<void> {
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
}

export function createValidToken(user: TestUser): string {
  return AuthService.generateTokens(user._id.toString(), user.tokenVersion).accessToken;
}