import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/User.model';
import { EmailService } from './email.service';
import { requireEnv } from '../utils/env';
<<<<<<< HEAD
import { AppError } from '../utils/http-error';
import { logError, logInfo } from '../utils/logger';
=======
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
<<<<<<< HEAD
  /** Public signup: student or instructor only; admin is never accepted from the client. */
  role?: string;
=======
  role?: 'student' | 'instructor' | 'admin' | 'content_manager';
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
}

export class AuthService {
  static async registerUser(userData: RegisterInput) {
    const existingUser = await User.findOne({ email: userData.email });
<<<<<<< HEAD
    if (existingUser?.emailVerified) {
      return null;
    }

    if (existingUser && !existingUser.emailVerified) {
      try {
        const token = await EmailService.sendVerificationEmail(existingUser._id.toString(), existingUser.email);
        existingUser.verificationToken = token;
        existingUser.verificationTokenExpiry = new Date(Date.now() + 3600000);
        await existingUser.save();
        return existingUser;
      } catch {
        throw new Error('Unable to send verification email. Please configure email credentials and try again.');
      }
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = new User({
      ...userData,
      emailVerified: false,
    });

    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    user.password = hashedPassword;
    const requestedRole = typeof userData.role === 'string' ? userData.role.trim().toLowerCase() : '';
    user.role = requestedRole === 'instructor' ? 'instructor' : 'student';
    user.emailVerified = false;

    await user.save();

    try {
      const token = await EmailService.sendVerificationEmail(user._id.toString(), user.email);
      user.verificationToken = token;
      user.verificationTokenExpiry = new Date(Date.now() + 3600000);
      await user.save();
      return user;
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        user.emailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();
        return user;
      }

      await User.deleteOne({ _id: user._id });

      throw new Error('Unable to send verification email. Please configure email credentials and try again.');
    }
  }

  static async verifyEmail(token: string) {
    const verifySecret = requireEnv('JWT_VERIFY_SECRET');
    const decoded = jwt.verify(token, verifySecret) as { userId: string };
    const user = await User.findById(decoded.userId);
    if (!user || user.verificationToken !== token || (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date())) {
      throw new AppError('Invalid or expired email verification token', 400);
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
=======
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({
      ...userData,
      password: hashedPassword,
      emailVerified: false,
    });
    await user.save();

    const token = await EmailService.sendVerificationEmail(user._id.toString(), user.email);
    user.verificationToken = token;
    user.verificationTokenExpiry = new Date(Date.now() + 3600000);
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
    await user.save();

    return user;
  }

<<<<<<< HEAD
  static async loginUser(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      logError('auth_login_failed', { email, reason: 'invalid_credentials' });
      throw new Error('Invalid credentials');
    }
    if (!user.emailVerified) {
      logError('auth_login_failed', { email, reason: 'email_not_verified' });
=======
  static async verifyEmail(token: string) {
    try {
      const verifySecret = requireEnv('JWT_VERIFY_SECRET');
      const decoded = jwt.verify(token, verifySecret) as { userId: string };
      const user = await User.findById(decoded.userId);
      if (!user || user.verificationToken !== token || (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date())) {
        throw new Error('Invalid or expired token');
      }

      user.emailVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpiry = undefined;
      await user.save();

      return user;
    } catch (error) {
      throw new Error('Verification failed');
    }
  }

  static async loginUser(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new Error('Invalid credentials');
    }
    if (!user.emailVerified) {
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
      throw new Error('Email not verified');
    }

    user.lastLogin = new Date();
    await user.save();

<<<<<<< HEAD
    logInfo('auth_login_success', { userId: user._id.toString() });

    return {
      tokens: this.generateTokens(user._id.toString(), user.tokenVersion ?? 0),
      user,
    };
=======
    return this.generateTokens(user._id.toString(), user.tokenVersion ?? 0);
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
  }

  static generateTokens(userId: string, tokenVersion: number) {
    const accessSecret = requireEnv('JWT_ACCESS_SECRET');
    const refreshSecret = requireEnv('JWT_REFRESH_SECRET');

    const accessToken = jwt.sign(
      { userId, type: 'access', tokenVersion },
      accessSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh', tokenVersion },
      refreshSecret,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  static async verifyToken(token: string, type: 'access' | 'refresh') {
    const secret = type === 'access' ? requireEnv('JWT_ACCESS_SECRET') : requireEnv('JWT_REFRESH_SECRET');
    const decoded = jwt.verify(token, secret) as { userId: string; type: 'access' | 'refresh'; tokenVersion?: number };
    if (decoded.type !== type) {
      throw new Error('Invalid token type');
    }

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) throw new Error('Invalid token');

    const currentVersion = user.tokenVersion ?? 0;
    const tokenVersion = decoded.tokenVersion ?? 0;
    if (tokenVersion !== currentVersion) {
      throw new Error('Invalid token');
    }

    return user;
  }

  static async rotateRefreshToken(refreshToken: string) {
    const user = await this.verifyToken(refreshToken, 'refresh');
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    return this.generateTokens(user._id.toString(), user.tokenVersion);
  }

  static async logoutUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();
  }

  static async requestPasswordReset(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      return;
    }

    const resetSecret = requireEnv('JWT_RESET_SECRET');
    const token = jwt.sign({ userId: user._id.toString(), type: 'password-reset' }, resetSecret, { expiresIn: '1h' });

    user.passwordResetToken = token;
    user.passwordResetTokenExpiry = new Date(Date.now() + 3600000);
    await user.save();

    await EmailService.sendPasswordResetEmail(user.email, token);
  }

  static async resetPassword(token: string, newPassword: string) {
    const resetSecret = requireEnv('JWT_RESET_SECRET');
    const decoded = jwt.verify(token, resetSecret) as { userId: string; type?: string };

    if (decoded.type !== 'password-reset') {
      throw new Error('Invalid or expired reset token');
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.passwordResetToken !== token || (user.passwordResetTokenExpiry && user.passwordResetTokenExpiry < new Date())) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();
  }
<<<<<<< HEAD

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();
  }
}
=======
}
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
