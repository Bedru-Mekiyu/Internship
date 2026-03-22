import express from 'express';
import { register, login, refreshToken, getMe, verifyEmail, logout, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createRateLimiter } from '../middlewares/rate-limit.middleware';
import { validationMiddleware, registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema } from '../utils/validators';

const router = express.Router();
const registerRateLimit = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: 'Too many registration attempts. Please try again later.',
});
const loginRateLimit = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: 'Too many login attempts. Please try again later.',
});
const refreshRateLimit = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 30,
	message: 'Too many token refresh attempts. Please try again later.',
});
const forgotPasswordRateLimit = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: 'Too many password reset requests. Please try again later.',
});
const resetPasswordRateLimit = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: 'Too many password reset attempts. Please try again later.',
});

router.post('/register', registerRateLimit, validationMiddleware(registerSchema), register);
router.post('/login', loginRateLimit, validationMiddleware(loginSchema), login);
router.post('/logout', authMiddleware, logout);
router.post('/forgot-password', forgotPasswordRateLimit, validationMiddleware(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', resetPasswordRateLimit, validationMiddleware(resetPasswordSchema), resetPassword);
router.post('/refresh-token', refreshRateLimit, validationMiddleware(refreshTokenSchema), refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.get('/me', authMiddleware, getMe);

export default router;