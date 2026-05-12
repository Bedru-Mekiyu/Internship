import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { createRateLimiter } from '../middlewares/rate-limit.middleware';
import {
  downloadCertificatePage,
  downloadCertificatePdf,
  generateCourseCertificate,
  getMyCertificates,
  renderCertificatePage,
  verifyCertificate,
} from '../controllers/certificate.controller';

const router = express.Router();

const certificateGenerateRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many certificate generation requests. Please try again later.',
  keyGenerator: (req) => {
    const userId = req.user?._id?.toString?.() ?? (req.user as any)?.id;
    if (userId) {
      return userId;
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

const verifyRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many verification attempts. Please try again later.',
});

router.get('/verify/:certificateId', verifyRateLimit, verifyCertificate);
router.get('/me', authMiddleware, roleMiddleware(['student']), getMyCertificates);
router.post(
  '/course/:courseId/generate',
  authMiddleware,
  roleMiddleware(['student']),
  certificateGenerateRateLimit,
  generateCourseCertificate,
);
router.get('/:certificateId/render', authMiddleware, roleMiddleware(['student']), renderCertificatePage);
router.get('/:certificateId/download', authMiddleware, roleMiddleware(['student']), downloadCertificatePage);
router.get('/:certificateId/download-pdf', authMiddleware, roleMiddleware(['student']), downloadCertificatePdf);

export default router;
