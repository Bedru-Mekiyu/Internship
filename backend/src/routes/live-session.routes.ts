import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
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

router.get('/course/:courseId', authMiddleware, getLiveSessionsByCourse);
router.post(
  '/course/:courseId',
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
