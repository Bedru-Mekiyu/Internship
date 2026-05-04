import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { createRateLimiter } from '../middlewares/rate-limit.middleware';
import {
  createLiveSession,
  getLiveSessionsByCourse,
  updateLiveSessionStatus,
} from '../controllers/live-session.controller';
import {
  liveSessionCreateSchema,
  liveSessionStatusSchema,
  validationMiddleware,
} from '../utils/validators';

const router = express.Router();

const liveSessionCreateRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many live session creation requests. Please try again later.',
});

router.get('/course/:courseId', authMiddleware, getLiveSessionsByCourse);
router.post(
  '/course/:courseId',
  liveSessionCreateRateLimit,
  authMiddleware,
  roleMiddleware(['instructor', 'admin']),
  validationMiddleware(liveSessionCreateSchema),
  createLiveSession
);
router.patch(
  '/:sessionId/status',
  authMiddleware,
  roleMiddleware(['instructor', 'admin']),
  validationMiddleware(liveSessionStatusSchema),
  updateLiveSessionStatus
);

export default router;
