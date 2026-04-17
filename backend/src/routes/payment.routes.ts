import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { validationMiddleware, paymentCreateSchema, paymentWebhookSchema } from '../utils/validators';
import { confirmPayment, createPayment, getAdminRevenue, getInstructorRevenue, getMyPayments, handlePaymentWebhook } from '../controllers/payment.controller';

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(['student']), validationMiddleware(paymentCreateSchema), createPayment);
router.post('/:id/confirm', authMiddleware, roleMiddleware(['student']), confirmPayment);
router.post('/webhook/:provider', validationMiddleware(paymentWebhookSchema), handlePaymentWebhook);
router.get('/me', authMiddleware, getMyPayments);
router.get('/instructor/revenue', authMiddleware, roleMiddleware(['instructor', 'admin']), getInstructorRevenue);
router.get('/admin/revenue', authMiddleware, roleMiddleware(['admin']), getAdminRevenue);

export default router;