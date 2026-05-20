import jwt from 'jsonwebtoken';

export type TestUserRole = 'student' | 'instructor' | 'admin' | 'content_manager';

export interface TestUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: TestUserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  tokenVersion: number;
  password: string;
}

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'test_secret';

export const testUsers: Record<TestUserRole, TestUser> = {
  student: {
    _id: 'user-student-id',
    email: 'student@test.com',
    firstName: 'Student',
    lastName: 'User',
    role: 'student',
    isActive: true,
    isEmailVerified: true,
    tokenVersion: 1,
    password: 'TestPass123!',
  },
  instructor: {
    _id: 'user-instructor-id',
    email: 'instructor@test.com',
    firstName: 'Instructor',
    lastName: 'User',
    role: 'instructor',
    isActive: true,
    isEmailVerified: true,
    tokenVersion: 1,
    password: 'TestPass123!',
  },
  admin: {
    _id: 'user-admin-id',
    email: 'admin@test.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    isEmailVerified: true,
    tokenVersion: 1,
    password: 'TestPass123!',
  },
  content_manager: {
    _id: 'user-manager-id',
    email: 'manager@test.com',
    firstName: 'Content',
    lastName: 'Manager',
    role: 'content_manager',
    isActive: true,
    isEmailVerified: true,
    tokenVersion: 1,
    password: 'TestPass123!',
  },
};

export function getAccessToken(user: TestUser): string {
  return jwt.sign(
    { userId: user._id, type: 'access', tokenVersion: user.tokenVersion },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function getRefreshToken(user: TestUser): string {
  return jwt.sign(
    { userId: user._id, type: 'refresh', tokenVersion: user.tokenVersion },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function getAuthCookies(user: TestUser): string {
  const accessToken = getAccessToken(user);
  return `accessToken=${encodeURIComponent(accessToken)}; Path=/; HttpOnly`;
}

export function getExpiredToken(user: TestUser): string {
  return jwt.sign(
    { userId: user._id, type: 'access', tokenVersion: user.tokenVersion },
    JWT_SECRET,
    { expiresIn: '-1s' }
  );
}

export function getInvalidToken(): string {
  return 'invalid.token.here';
}

export function getWrongTypeToken(user: TestUser): string {
  return jwt.sign(
    { userId: user._id, type: 'refresh', tokenVersion: user.tokenVersion },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function getRevokedToken(user: TestUser): string {
  return jwt.sign(
    { userId: user._id, type: 'access', tokenVersion: user.tokenVersion + 1 },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function createTestUser(role: TestUserRole): TestUser {
  return { ...testUsers[role], _id: `${role}-${Date.now()}` };
}

export function createStudentUser(): TestUser {
  return createTestUser('student');
}

export function createInstructorUser(): TestUser {
  return createTestUser('instructor');
}

export function createAdminUser(): TestUser {
  return createTestUser('admin');
}

export function createContentManagerUser(): TestUser {
  return createTestUser('content_manager');
}