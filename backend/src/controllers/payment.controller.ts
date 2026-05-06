import crypto from 'crypto';
import { Request, Response } from 'express';
import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { Notification } from '../models/Notification.model';
import { Payment } from '../models/Payment.model';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/http-error';
import { routeParam } from '../utils/route-params';
import { confirmGatewayPayment, createCheckoutSession, normalizeWebhookState, PaymentProvider } from '../services/payment-gateway.service';

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const signaturesMatch = (provided: string, expected: string) => {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
};

const buildHmacSignature = (secret: string, payload: unknown) => {
  const content = JSON.stringify(payload || {});
  return crypto.createHmac('sha256', secret).update(content).digest('hex');
};

const isValidWebhookSignature = (providedSignatureHeader: string, secret: string, payload: unknown) => {
  const normalizedProvided = providedSignatureHeader.trim();

  const hmac = buildHmacSignature(secret, payload);
  const candidates = [
    hmac,
    `sha256=${hmac}`,
  ];

  return candidates.some((candidate) => signaturesMatch(normalizedProvided, candidate));
};

const ensureEnrollmentForPayment = async (userId: string, courseId: string) => {
  const [course, enrollment] = await Promise.all([
    Course.findById(courseId),
    Enrollment.findOne({ userId, courseId }),
  ]);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (!enrollment) {
    await Enrollment.create({
      userId,
      courseId,
      progress: 0,
      status: 'enrolled',
      enrolledAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    course.enrollmentCount = Number(course.enrollmentCount || 0) + 1;
    course.updatedAt = new Date();
    await course.save();
  }
};

const resolveProviderFromMethod = (method: string): PaymentProvider => {
  if (method === 'paypal') return 'paypal';
  if (method === 'bank_transfer') return 'bank_transfer';
  return 'stripe';
};

const notifyPaymentCompleted = async (payment: any) => {
  const message = `Your payment (${payment._id}) was confirmed successfully.`;
  const existing = await Notification.findOne({
    userId: payment.userId,
    title: 'Payment confirmed',
    message,
  });

  if (existing) {
    return;
  }

  await Notification.create({
    userId: payment.userId,
    type: 'system',
    title: 'Payment confirmed',
    message,
    isRead: false,
    createdAt: new Date(),
  });
};

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const { courseId, method } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const existingCompleted = await Payment.findOne({
    userId: req.user?._id,
    courseId,
    status: 'completed',
  });

  if (existingCompleted) {
    return res.json({
      message: 'Course already purchased',
      payment: existingCompleted,
    });
  }

  const amount = Number(course.pricing?.amount || 0);
  const provider = resolveProviderFromMethod(method);

  const payment = new Payment({
    userId: req.user?._id,
    courseId,
    amount,
    currency: String(course.pricing?.currency || 'USD'),
    method,
    provider,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const checkout = await createCheckoutSession({
    provider,
    amount,
    currency: String(course.pricing?.currency || 'USD'),
    reference: `${req.user?._id}_${courseId}`,
  });

  payment.externalPaymentId = checkout.externalPaymentId;
  payment.checkoutUrl = checkout.checkoutUrl;
  payment.status = checkout.state;
  await payment.save();

  if (payment.status === 'completed') {
    await ensureEnrollmentForPayment(String(req.user?._id), String(courseId));
    await notifyPaymentCompleted(payment);
  }

  return res.status(201).json({
    message: payment.status === 'completed'
      ? 'Payment completed and enrollment activated'
      : 'Checkout initialized. Awaiting payment confirmation',
    checkoutUrl: payment.checkoutUrl,
    payment,
  });
});

export const confirmPayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await Payment.findOne({ _id: routeParam(req.params.id), userId: req.user?._id });
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.status === 'completed') {
    return res.json({
      message: 'Payment already confirmed',
      payment,
    });
  }

  const provider = (payment.provider || 'stripe') as PaymentProvider;
  const externalPaymentId = payment.externalPaymentId || `fallback_${payment._id}`;
  const result = await confirmGatewayPayment({
    provider,
    externalPaymentId,
  });

  payment.status = result.state;
  payment.transactionId = result.transactionId;
  payment.updatedAt = new Date();
  await payment.save();

  if (payment.status === 'completed') {
    await ensureEnrollmentForPayment(String(payment.userId), String(payment.courseId));
    await notifyPaymentCompleted(payment);
  }

  return res.json({
    message: payment.status === 'completed' ? 'Payment confirmed' : 'Payment confirmation pending',
    payment,
  });
});

export const handlePaymentWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['x-webhook-signature'];
  if (!signature || typeof signature !== 'string') {
    throw new AppError('Missing webhook signature', 401);
  }

  const configuredSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!configuredSecret) {
    throw new AppError('Webhook is not configured', 503);
  }

  if (!isValidWebhookSignature(signature, configuredSecret, req.body)) {
    throw new AppError('Invalid webhook signature', 401);
  }

  const payment = req.body.paymentId
    ? await Payment.findById(req.body.paymentId)
    : await Payment.findOne({ externalPaymentId: req.body.externalPaymentId });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  const eventId = req.body.eventId ? String(req.body.eventId) : undefined;
  if (eventId && payment.webhookEventId === eventId) {
    return res.json({ message: 'Webhook already processed' });
  }

  const previousStatus = payment.status;
  payment.status = normalizeWebhookState(String(req.body.status));
  if (req.body.transactionId) {
    payment.transactionId = String(req.body.transactionId);
  }
  if (eventId) {
    payment.webhookEventId = eventId;
  }
  payment.updatedAt = new Date();
  await payment.save();

  if (payment.status === 'completed') {
    await ensureEnrollmentForPayment(String(payment.userId), String(payment.courseId));
    if (previousStatus !== 'completed') {
      await notifyPaymentCompleted(payment);
    }
  }

  return res.json({
    message: 'Webhook processed',
    payment,
  });
});

export const getMyPayments = asyncHandler(async (req: Request, res: Response) => {
  const payments = await Payment.find({ userId: req.user?._id })
    .sort({ createdAt: -1 })
    .populate('courseId', 'title slug category');

  const totalSpent = payments
    .filter((payment: any) => payment.status === 'completed')
    .reduce((sum: number, payment: any) => sum + Number(payment.amount || 0), 0);

  return res.json({
    totalSpent,
    totalPayments: payments.length,
    payments,
  });
});

export const getInstructorRevenue = asyncHandler(async (req: Request, res: Response) => {
  const courses = await Course.find({ instructor: req.user?._id }).select('_id title');
  const courseIds = courses.map((course) => course._id);

  const payments = await Payment.find({
    courseId: { $in: courseIds },
    status: 'completed',
  }).sort({ createdAt: -1 });

  const totalRevenue = payments.reduce((sum: number, payment: any) => sum + Number(payment.amount || 0), 0);
  const monthlyMap = new Map<string, number>();

  payments.forEach((payment: any) => {
    const key = monthKey(new Date(payment.createdAt));
    monthlyMap.set(key, Number(monthlyMap.get(key) || 0) + Number(payment.amount || 0));
  });

  const monthlyRevenue = Array.from(monthlyMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-6)
    .map(([month, revenue]) => ({ month, revenue }));

  const topCourses = courses.map((course: any) => {
    const courseRevenue = payments
      .filter((payment: any) => payment.courseId?.toString() === course._id.toString())
      .reduce((sum: number, payment: any) => sum + Number(payment.amount || 0), 0);

    return {
      courseId: course._id,
      title: course.title,
      revenue: courseRevenue,
    };
  }).sort((left, right) => right.revenue - left.revenue).slice(0, 5);

  return res.json({
    totalRevenue,
    totalTransactions: payments.length,
    monthlyRevenue,
    topCourses,
  });
});

export const getAdminRevenue = asyncHandler(async (_req: Request, res: Response) => {
  const [completedPayments, pendingPayments, failedPayments] = await Promise.all([
    Payment.find({ status: 'completed' }).sort({ createdAt: -1 }),
    Payment.countDocuments({ status: 'pending' }),
    Payment.countDocuments({ status: 'failed' }),
  ]);

  const totalRevenue = completedPayments.reduce((sum: number, payment: any) => sum + Number(payment.amount || 0), 0);
  const monthlyMap = new Map<string, number>();

  completedPayments.forEach((payment: any) => {
    const key = monthKey(new Date(payment.createdAt));
    monthlyMap.set(key, Number(monthlyMap.get(key) || 0) + Number(payment.amount || 0));
  });

  const monthlyRevenue = Array.from(monthlyMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-6)
    .map(([month, revenue]) => ({ month, revenue }));

  return res.json({
    totalRevenue,
    completedPayments: completedPayments.length,
    pendingPayments,
    failedPayments,
    monthlyRevenue,
  });
});
