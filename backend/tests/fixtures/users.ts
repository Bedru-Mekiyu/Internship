// Re-export from new centralized fixtures
export * from '../helpers/fixtures';

// Keep legacy functions for backward compatibility with existing tests
import jwt from 'jsonwebtoken';
import { TestUserRole, TestUser } from '../helpers/fixtures';

const JWT_SECRET = () => process.env.JWT_ACCESS_SECRET || 'test_secret';

export const testUsers: Record<TestUserRole, TestUser> = {} as any;

export function getAccessToken(user: TestUser): string {
  const { AuthService } = require('../../src/services/auth.service');
  return AuthService.generateTokens(user._id.toString(), user.tokenVersion).accessToken;
}

export function getRefreshToken(user: TestUser): string {
  const { AuthService } = require('../../src/services/auth.service');
  return AuthService.generateTokens(user._id.toString(), user.tokenVersion).refreshToken;
}

export function getAuthCookies(user: TestUser): string {
  const { AuthService } = require('../../src/services/auth.service');
  const tokens = AuthService.generateTokens(user._id.toString(), user.tokenVersion);
  return `accessToken=${encodeURIComponent(tokens.accessToken)}; Path=/; HttpOnly`;
}

export function getExpiredToken(user: TestUser): string {
  return jwt.sign(
    { userId: user._id.toString(), type: 'access', tokenVersion: user.tokenVersion },
    JWT_SECRET(),
    { expiresIn: '-1s' }
  );
}

export function getInvalidToken(): string {
  return 'invalid.token.here';
}

export function getWrongTypeToken(user: TestUser): string {
  return jwt.sign(
    { userId: user._id.toString(), type: 'refresh', tokenVersion: user.tokenVersion },
    JWT_SECRET(),
    { expiresIn: '15m' }
  );
}

export function getRevokedToken(user: TestUser): string {
  return jwt.sign(
    { userId: user._id.toString(), type: 'access', tokenVersion: user.tokenVersion + 1 },
    JWT_SECRET(),
    { expiresIn: '15m' }
  );
}

export function createTestUser(role: TestUserRole): TestUser {
  const mongoose = require('mongoose');
  return {
    _id: new mongoose.Types.ObjectId(),
    email: `test-${role}-${Date.now()}@test.com`,
    firstName: 'Test',
    lastName: 'User',
    role,
    isActive: true,
    isEmailVerified: true,
    tokenVersion: 1,
    password: 'TestPass123!',
  } as TestUser;
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