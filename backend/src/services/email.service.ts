import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { requireEnv } from '../utils/env';

dotenv.config({ quiet: true });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export class EmailService {
  static async sendVerificationEmail(userId: string, email: string) {
    const verifySecret = requireEnv('JWT_VERIFY_SECRET');
    const baseUrl = requireEnv('BASE_URL');
    const sender = requireEnv('EMAIL_USER');

    const token = jwt.sign({ userId }, verifySecret, { expiresIn: '1h' });
    const verificationLink = `${baseUrl}/api/auth/verify-email/${token}`;

    const mailOptions = {
      from: sender,
      to: email,
      subject: 'Verify Your Email',
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your email. Link expires in 1 hour.</p>`,
    };

    await transporter.sendMail(mailOptions);
    return token;
  }

  static async sendPasswordResetEmail(email: string, token: string) {
    const baseUrl = requireEnv('BASE_URL');
    const sender = requireEnv('EMAIL_USER');
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: sender,
      to: email,
      subject: 'Reset Your Password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    };

    await transporter.sendMail(mailOptions);
  }
}