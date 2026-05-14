import { afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockUserFindOne = jest.fn<(...args: any[]) => any>();
const mockUserFindById = jest.fn<(...args: any[]) => any>();
const mockUserDeleteOne = jest.fn<(...args: any[]) => any>();
const mockUserConstructor = jest.fn<(...args: any[]) => any>();
const mockSendVerificationEmail = jest.fn<(...args: any[]) => any>();
const mockSendPasswordResetEmail = jest.fn<(...args: any[]) => any>();
const mockBcryptHash = jest.fn<(...args: any[]) => any>();
const mockBcryptCompare = jest.fn<(...args: any[]) => any>();
const mockJwtSign = jest.fn<(...args: any[]) => any>();
const mockJwtVerify = jest.fn<(...args: any[]) => any>();
const mockLogError = jest.fn<(...args: any[]) => any>();
const mockLogInfo = jest.fn<(...args: any[]) => any>();

jest.mock('../src/models/User.model', () => ({
  User: Object.assign(mockUserConstructor, {
    findOne: mockUserFindOne,
    findById: mockUserFindById,
    deleteOne: mockUserDeleteOne,
  }),
}));

jest.mock('../src/services/email.service', () => ({
  EmailService: {
    sendVerificationEmail: mockSendVerificationEmail,
    sendPasswordResetEmail: mockSendPasswordResetEmail,
  },
}));

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: mockBcryptHash,
    compare: mockBcryptCompare,
  },
}));

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: mockJwtSign,
    verify: mockJwtVerify,
  },
}));

jest.mock('../src/utils/logger', () => ({
  logError: mockLogError,
  logInfo: mockLogInfo,
}));

import { AuthService } from '../src/services/auth.service';

describe('AuthService', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: 'test',
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_VERIFY_SECRET: 'verify-secret',
      JWT_RESET_SECRET: 'reset-secret',
    };
    jest.clearAllMocks();
    mockBcryptHash.mockResolvedValue('hashed-password');
    mockBcryptCompare.mockResolvedValue(true);
    mockJwtSign.mockReturnValue('signed-token');
    mockJwtVerify.mockReturnValue({ userId: 'user-1', type: 'access', tokenVersion: 0 });
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('returns existing verified user during registration without sending email', async () => {
    const existingUser = { _id: 'u1', email: 'verified@example.com', emailVerified: true };
    mockUserFindOne.mockResolvedValue(existingUser);

    const result = await AuthService.registerUser({
      email: 'verified@example.com',
      password: 'Password1!',
      firstName: 'Vera',
      lastName: 'Fied',
    });

    expect(result).toBe(existingUser);
    expect(mockUserConstructor).not.toHaveBeenCalled();
    expect(mockSendVerificationEmail).not.toHaveBeenCalled();
  });

  it('resends verification for existing unverified user', async () => {
    const save = jest.fn(async () => undefined);
    const existingUser: any = {
      _id: 'u2',
      email: 'pending@example.com',
      emailVerified: false,
      save,
    };
    mockUserFindOne.mockResolvedValue(existingUser);
    mockSendVerificationEmail.mockResolvedValue('verify-token');

    await AuthService.registerUser({
      email: 'pending@example.com',
      password: 'Password1!',
      firstName: 'Pen',
      lastName: 'Ding',
    });

    expect(mockSendVerificationEmail).toHaveBeenCalledWith('u2', 'pending@example.com');
    expect(existingUser.verificationToken).toBe('verify-token');
    expect(existingUser.verificationTokenExpiry).toBeInstanceOf(Date);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('keeps newly registered user in non-production when verification email fails', async () => {
    const save = jest.fn(async () => undefined);
    const createdUser: any = {
      _id: 'new-user',
      email: 'new@example.com',
      save,
      tokenVersion: 0,
    };
    mockUserFindOne.mockResolvedValue(null);
    mockUserConstructor.mockImplementation(() => createdUser);
    mockSendVerificationEmail.mockRejectedValue(new Error('smtp down'));

    const result = await AuthService.registerUser({
      email: 'new@example.com',
      password: 'Password1!',
      firstName: 'New',
      lastName: 'User',
      role: 'instructor',
    });

    expect(result).toBe(createdUser);
    expect(createdUser.emailVerified).toBe(true);
    expect(createdUser.verificationToken).toBeUndefined();
    expect(save).toHaveBeenCalledTimes(2);
    expect(mockUserDeleteOne).not.toHaveBeenCalled();
  });

  it('verifies email token and clears verification fields', async () => {
    const save = jest.fn(async () => undefined);
    const user: any = {
      _id: 'u3',
      emailVerified: false,
      verificationToken: 'valid-token',
      verificationTokenExpiry: new Date(Date.now() + 10_000),
      save,
    };
    mockJwtVerify.mockReturnValue({ userId: 'u3' });
    mockUserFindById.mockResolvedValue(user);

    const result = await AuthService.verifyEmail('valid-token');

    expect(result).toBe(user);
    expect(user.emailVerified).toBe(true);
    expect(user.verificationToken).toBeUndefined();
    expect(user.verificationTokenExpiry).toBeUndefined();
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('rejects email verification when token does not match user record', async () => {
    mockJwtVerify.mockReturnValue({ userId: 'u4' });
    mockUserFindById.mockResolvedValue({
      _id: 'u4',
      emailVerified: false,
      verificationToken: 'different-token',
      verificationTokenExpiry: new Date(Date.now() + 10_000),
      save: jest.fn(),
    });

    await expect(AuthService.verifyEmail('provided-token')).rejects.toEqual(
      expect.objectContaining({
        name: 'AppError',
        message: 'Invalid or expired email verification token',
        statusCode: 400,
      }),
    );
  });

  it('throws invalid credentials for login when user does not exist', async () => {
    mockUserFindOne.mockResolvedValue(null);

    await expect(AuthService.loginUser('missing@example.com', 'Password1!')).rejects.toThrow('Invalid credentials');
    expect(mockBcryptHash).toHaveBeenCalledWith('Password1!', 10);
  });

  it('returns tokens and user on successful login', async () => {
    const save = jest.fn(async () => undefined);
    const user: any = {
      _id: 'u5',
      email: 'active@example.com',
      password: 'hashed',
      emailVerified: true,
      tokenVersion: 2,
      save,
    };
    mockUserFindOne.mockResolvedValue(user);
    mockBcryptCompare.mockResolvedValue(true);
    mockJwtSign
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');

    const result = await AuthService.loginUser('active@example.com', 'Password1!');

    expect(result).toEqual({
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
      user,
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(mockLogInfo).toHaveBeenCalledWith('auth_login_success', { userId: 'u5' });
  });

  it('rejects verifyToken when token type does not match expected type', async () => {
    mockJwtVerify.mockReturnValue({ userId: 'u6', type: 'refresh', tokenVersion: 0 });

    await expect(AuthService.verifyToken('token', 'access')).rejects.toThrow('Invalid token type');
  });

  it('stores reset token and sends password reset email', async () => {
    const save = jest.fn(async () => undefined);
    const user: any = {
      _id: 'u7',
      email: 'reset@example.com',
      save,
    };
    mockUserFindOne.mockResolvedValue(user);
    mockJwtSign.mockReturnValue('reset-token');

    await AuthService.requestPasswordReset('reset@example.com');

    expect(user.passwordResetToken).toBe('reset-token');
    expect(user.passwordResetTokenExpiry).toBeInstanceOf(Date);
    expect(save).toHaveBeenCalledTimes(1);
    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith('reset@example.com', 'reset-token');
  });

  it('validates password policy before resetting password', async () => {
    await expect(AuthService.resetPassword('token', 'weak')).rejects.toEqual(
      expect.objectContaining({
        name: 'AppError',
        message: 'Password must be 8+ characters with uppercase, lowercase, number, and special character.',
        statusCode: 400,
      }),
    );
    expect(mockJwtVerify).not.toHaveBeenCalled();
  });
});
