import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import {
  createQuiz,
  getMyQuizAttempts,
  getQuizAttemptsForInstructor,
  getQuizzesByLesson,
  submitQuizAttempt,
} from '../controllers/quiz.controller';
import { quizAttemptSchema, quizCreateSchema, validationMiddleware } from '../utils/validators';

const router = express.Router();

router.get('/lesson/:lessonId', authMiddleware, getQuizzesByLesson);
router.post(
  '/lesson/:lessonId',
  authMiddleware,
  roleMiddleware(['instructor', 'admin']),
  validationMiddleware(quizCreateSchema),
  createQuiz
);
router.post(
  '/:quizId/attempts',
  authMiddleware,
  roleMiddleware(['student']),
  validationMiddleware(quizAttemptSchema),
  submitQuizAttempt
);
router.get('/:quizId/attempts/me', authMiddleware, roleMiddleware(['student']), getMyQuizAttempts);
router.get('/:quizId/attempts', authMiddleware, roleMiddleware(['instructor', 'admin']), getQuizAttemptsForInstructor);

export default router;
