import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService } from '../src/services/auth.service';
import { User } from '../src/models/User.model';
import { EmailService } from '../src/services/email.service';

describe('AuthService', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_VERIFY_SECRET: 'verify-secret',
      JWT_RESET_SECRET: 'reset-secret',
      NODE_ENV: 'test',
    };
    jest.restoreAllMocks();
  });

  it('registerUser creates a new user, normalizes instructor role, and stores verification token', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
    const saveSpy = jest.spyOn(User.prototype, 'save').mockImplementation(async function mockSave(this: unknown) {
      return this as never;
    });
    const sendVerificationSpy = jest
      .spyOn(EmailService, 'sendVerificationEmail')
      .mockResolvedValue('verification-token');

    const user = await AuthService.registerUser({
      email: 'new@example.com',
      password: 'Password1!',
      firstName: 'New',
      lastName: 'User',
      role: ' Instructor ',
    });

    expect(user.role).toBe('instructor');
    expect(user.password).toBe('hashed-password');
    expect(user.emailVerified).toBe(false);
    expect(user.verificationToken).toBe('verification-token');
    expect(user.verificationTokenExpiry).toBeInstanceOf(Date);
    expect(sendVerificationSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledTimes(2);
  });

  it('registerUser returns verified existing user without resending email', async () => {
    const existingUser = { emailVerified: true } as never;
    jest.spyOn(User, 'findOne').mockResolvedValue(existingUser);
    const sendVerificationSpy = jest.spyOn(EmailService, 'sendVerificationEmail');

    const user = await AuthService.registerUser({
      email: 'verified@example.com',
      password: 'Password1!',
      firstName: 'V',
      lastName: 'User',
    });

    expect(user).toBe(existingUser);
    expect(sendVerificationSpy).not.toHaveBeenCalled();
  });

  it('registerUser resends verification for unverified existing user', async () => {
    const save = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const existingUser = {
      _id: { toString: () => 'existing-id' },
      email: 'pending@example.com',
      emailVerified: false,
      save,
    } as never;

    jest.spyOn(User, 'findOne').mockResolvedValue(existingUser);
    jest.spyOn(EmailService, 'sendVerificationEmail').mockResolvedValue('resent-token');

    const user = await AuthService.registerUser({
      email: 'pending@example.com',
      password: 'Password1!',
      firstName: 'Pending',
      lastName: 'User',
    });

    expect(user).toBe(existingUser);
    expect(existingUser.verificationToken).toBe('resent-token');
    expect(existingUser.verificationTokenExpiry).toBeInstanceOf(Date);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('loginUser hashes dummy password when user is missing to mitigate timing attacks', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('dummy-hash' as never);

    await expect(AuthService.loginUser('missing@example.com', 'Password1!')).rejects.toThrow('Invalid credentials');
    expect(hashSpy).toHaveBeenCalledWith('Password1!', 10);
  });

  it('loginUser returns tokens and persists last login for verified user', async () => {
    const save = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const user = {
      _id: { toString: () => 'user-1' },
      email: 'user@example.com',
      password: 'hashed-password',
      emailVerified: true,
      tokenVersion: 2,
      save,
    } as never;

    jest.spyOn(User, 'findOne').mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    jest.spyOn(AuthService, 'generateTokens').mockReturnValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const result = await AuthService.loginUser('user@example.com', 'Password1!');

    expect(result.tokens).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    expect(result.user).toBe(user);
    expect(user.lastLogin).toBeInstanceOf(Date);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('verifyToken rejects mismatched token type', async () => {
    jest.spyOn(jwt, 'verify').mockReturnValue({ userId: 'u1', type: 'refresh', tokenVersion: 0 } as never);

    await expect(AuthService.verifyToken('access-token', 'access')).rejects.toThrow('Invalid token type');
  });

  it('verifyToken rejects stale token version', async () => {
    jest.spyOn(jwt, 'verify').mockReturnValue({ userId: 'u1', type: 'access', tokenVersion: 1 } as never);
    jest.spyOn(User, 'findById').mockResolvedValue({ isActive: true, tokenVersion: 2 } as never);

    await expect(AuthService.verifyToken('access-token', 'access')).rejects.toThrow('Invalid token');
  });

  it('resetPassword enforces password policy before token verification', async () => {
    const verifySpy = jest.spyOn(jwt, 'verify');

    await expect(AuthService.resetPassword('token', 'weakpass')).rejects.toThrow(
      'Password must be 8+ characters with uppercase, lowercase, number, and special character.',
    );
    expect(verifySpy).not.toHaveBeenCalled();
  });

  it('resetPassword updates password, clears reset token, and increments token version', async () => {
    const save = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const user = {
      _id: { toString: () => 'u1' },
      password: 'old-hash',
      passwordResetToken: 'valid-token',
      passwordResetTokenExpiry: new Date(Date.now() + 60_000),
      tokenVersion: 3,
      save,
    } as never;

    jest.spyOn(jwt, 'verify').mockReturnValue({ userId: 'u1', type: 'password-reset' } as never);
    jest.spyOn(User, 'findById').mockResolvedValue(user);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hash' as never);

    await AuthService.resetPassword('valid-token', 'StrongPass1!');

    expect(user.password).toBe('new-hash');
    expect(user.passwordResetToken).toBeUndefined();
    expect(user.passwordResetTokenExpiry).toBeUndefined();
    expect(user.tokenVersion).toBe(4);
    expect(save).toHaveBeenCalledTimes(1);
  });
});
