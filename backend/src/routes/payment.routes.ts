import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { validationMiddleware, paymentCreateSchema, paymentWebhookSchema } from '../utils/validators';
import { createRateLimiter } from '../middlewares/rate-limit.middleware';
import { confirmPayment, createPayment, getAdminRevenue, getInstructorRevenue, getMyPayments, handlePaymentWebhook } from '../controllers/payment.controller';

const router = express.Router();

const paymentCreateRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many payment attempts. Please try again later.',
});

const paymentConfirmRateLimit = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: 'Too many confirmation attempts. Please try again later.',
});

const paymentListRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many payment history requests. Please try again later.',
});

router.post('/', paymentCreateRateLimit, authMiddleware, roleMiddleware(['student']), validationMiddleware(paymentCreateSchema), createPayment);
router.post('/:id/confirm', paymentConfirmRateLimit, authMiddleware, roleMiddleware(['student']), confirmPayment);
router.post('/webhook/:provider', validationMiddleware(paymentWebhookSchema), handlePaymentWebhook);
router.get('/me', paymentListRateLimit, authMiddleware, getMyPayments);
router.get('/instructor/revenue', authMiddleware, roleMiddleware(['instructor', 'admin']), getInstructorRevenue);
router.get('/admin/revenue', authMiddleware, roleMiddleware(['admin']), getAdminRevenue);

export default router;