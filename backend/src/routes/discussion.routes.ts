import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  createDiscussionMessage,
  getAccessibleDiscussionCourses,
  getCourseDiscussions,
} from '../controllers/discussion.controller';

const router = express.Router();

router.get('/conversations', authMiddleware, getAccessibleDiscussionCourses);
router.get('/course/:courseId', authMiddleware, getCourseDiscussions);
router.post('/course/:courseId', authMiddleware, createDiscussionMessage);

export default router;
