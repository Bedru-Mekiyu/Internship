import express from 'express';
<<<<<<< HEAD
import { register, login, refreshToken, getMe, verifyEmail, logout, forgotPassword, resetPassword, getCsrfToken } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createRateLimiter } from '../middlewares/rate-limit.middleware';
import {
	validationMiddleware,
	registerSchema,
	loginSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
	refreshTokenSchema,
} from '../utils/validators';

const router = express.Router();
const isProduction = process.env.NODE_ENV === 'production';
const toPositiveInt = (value: string | undefined, fallback: number) => {
	if (!value) return fallback;
	const parsed = Number.parseInt(value, 10);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const registerMaxAttempts = toPositiveInt(
	process.env.REGISTER_RATE_LIMIT_MAX,
	isProduction ? 5 : 100
);

const registerRateLimit = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: registerMaxAttempts,
=======
import { register, login, refreshToken, getMe, verifyEmail, logout, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createRateLimiter } from '../middlewares/rate-limit.middleware';
import { validationMiddleware, registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema } from '../utils/validators';

const router = express.Router();
const registerRateLimit = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 5,
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
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
<<<<<<< HEAD
router.post('/forgotpassword', forgotPasswordRateLimit, validationMiddleware(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', resetPasswordRateLimit, validationMiddleware(resetPasswordSchema), resetPassword);
router.post('/resetpassword', resetPasswordRateLimit, validationMiddleware(resetPasswordSchema), resetPassword);
router.post('/refresh-token', refreshRateLimit, validationMiddleware(refreshTokenSchema), refreshToken);
router.post('/refreshtoken', refreshRateLimit, validationMiddleware(refreshTokenSchema), refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.get('/csrf-token', getCsrfToken);
router.get('/me', authMiddleware, getMe);

export default router;
=======
router.post('/reset-password', resetPasswordRateLimit, validationMiddleware(resetPasswordSchema), resetPassword);
router.post('/refresh-token', refreshRateLimit, validationMiddleware(refreshTokenSchema), refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.get('/me', authMiddleware, getMe);

export default router;
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
