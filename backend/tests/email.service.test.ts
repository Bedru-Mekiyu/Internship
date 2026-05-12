import { afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals';

const sendMailMock = jest.fn<(mail: unknown) => Promise<void>>().mockResolvedValue(undefined);
const createTransportMock = jest.fn(() => ({ sendMail: sendMailMock }));
const signMock = jest.fn<(payload: unknown, secret: string, options: { expiresIn: string }) => string>();

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: createTransportMock,
  },
}));

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: signMock,
  },
}));

import { EmailService } from '../src/services/email.service';

describe('EmailService', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      BASE_URL: 'https://api.example.com/',
      JWT_VERIFY_SECRET: 'verify-secret',
      EMAIL_USER: 'noreply@example.com',
    };
    delete process.env.FRONTEND_URL;
    sendMailMock.mockClear();
    signMock.mockReset().mockReturnValue('signed-token');
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('sends verification email using FRONTEND_URL when configured', async () => {
    process.env.FRONTEND_URL = ' https://frontend.example.com/ ';
    signMock.mockReturnValue('token with spaces/+?');

    const token = await EmailService.sendVerificationEmail('user-1', 'user@example.com');

    expect(token).toBe('token with spaces/+?');
    expect(signMock).toHaveBeenCalledWith({ userId: 'user-1' }, 'verify-secret', { expiresIn: '1h' });
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'noreply@example.com',
      to: 'user@example.com',
      subject: 'Verify Your Email',
      html: `<p>Click <a href="https://frontend.example.com/auth/verify-email?token=${encodeURIComponent('token with spaces/+?')}">here</a> to verify your email. Link expires in 1 hour.</p>`,
    });
  });

  it('falls back to BASE_URL verification endpoint when FRONTEND_URL is absent', async () => {
    signMock.mockReturnValue('token/value?x=1');

    await EmailService.sendVerificationEmail('user-2', 'fallback@example.com');

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        html: `<p>Click <a href="https://api.example.com/api/auth/verify-email?token=${encodeURIComponent('token/value?x=1')}">here</a> to verify your email. Link expires in 1 hour.</p>`,
      }),
    );
  });

  it('sends password reset email using FRONTEND_URL when set', async () => {
    process.env.FRONTEND_URL = ' https://frontend.example.com/ ';

    await EmailService.sendPasswordResetEmail('reset@example.com', 'reset token/+?');

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'noreply@example.com',
      to: 'reset@example.com',
      subject: 'Reset Your Password',
      html: `<p>Click <a href="https://frontend.example.com/auth/reset-password?token=${encodeURIComponent('reset token/+?')}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    });
  });

  it('falls back to BASE_URL for reset links when FRONTEND_URL is missing', async () => {
    await EmailService.sendPasswordResetEmail('reset@example.com', 'abc123');

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        html: '<p>Click <a href="https://api.example.com/auth/reset-password?token=abc123">here</a> to reset your password. Link expires in 1 hour.</p>',
      }),
    );
  });

  it('throws when required sender env variable is missing', async () => {
    delete process.env.EMAIL_USER;

    await expect(EmailService.sendPasswordResetEmail('reset@example.com', 'abc123')).rejects.toThrow(
      'Missing required environment variable: EMAIL_USER',
    );
    expect(sendMailMock).not.toHaveBeenCalled();
  });
});
