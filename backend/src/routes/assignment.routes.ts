import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import {
  createAssignment,
  gradeAssignmentSubmission,
  getAssignmentAnalyticsByCourse,
  getAssignmentSubmissions,
  getAssignmentsByCourse,
  getMySubmissionsByCourse,
  submitAssignment,
} from '../controllers/assignment.controller';
import {
  assignmentCreateSchema,
  submissionCreateSchema,
  submissionGradeSchema,
  validationMiddleware,
} from '../utils/validators';

const router = express.Router();

router.get('/course/:courseId', authMiddleware, getAssignmentsByCourse);
router.get(
  '/course/:courseId/analytics',
  authMiddleware,
  roleMiddleware(['instructor', 'admin']),
  getAssignmentAnalyticsByCourse
);
router.post(
  '/course/:courseId',
  authMiddleware,
  roleMiddleware(['instructor', 'admin']),
  validationMiddleware(assignmentCreateSchema),
  createAssignment
);
router.get('/course/:courseId/submissions/me', authMiddleware, roleMiddleware(['student']), getMySubmissionsByCourse);
router.post(
  '/:assignmentId/submissions',
  authMiddleware,
  roleMiddleware(['student']),
  validationMiddleware(submissionCreateSchema),
  submitAssignment
);
router.get(
  '/:assignmentId/submissions',
  authMiddleware,
  roleMiddleware(['instructor', 'admin']),
  getAssignmentSubmissions
);
router.patch(
  '/:assignmentId/submissions/:submissionId/grade',
  authMiddleware,
  roleMiddleware(['instructor', 'admin']),
  validationMiddleware(submissionGradeSchema),
  gradeAssignmentSubmission
);

export default router;
