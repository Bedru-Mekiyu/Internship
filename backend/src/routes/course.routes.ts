import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getCourseProgress,
  createCourseReview,
  getCourseModules,
  addCourseModule,
  updateCourseModule,
  deleteCourseModule,
  addModuleLesson,
  updateModuleLesson,
  deleteModuleLesson,
  updateCourseProgress,
  completeCourseLesson,
  reorderModules,
  reorderLessons,
} from '../controllers/course.controller';
import { authMiddleware, optionalAuthMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import {
  validationMiddleware,
  courseSchema,
  courseReviewSchema,
  moduleSchema,
  moduleUpdateSchema,
  lessonSchema,
  lessonUpdateSchema,
  progressUpdateSchema,
  reorderLessonsSchema,
  reorderModulesSchema,
} from '../utils/validators';

const router = express.Router();

router.get('/', optionalAuthMiddleware, getCourses);
router.get('/:id', optionalAuthMiddleware, getCourseById);
router.post('/', authMiddleware, roleMiddleware(['instructor', 'admin']), validationMiddleware(courseSchema), createCourse);
router.put('/:id', authMiddleware, roleMiddleware(['instructor', 'admin']), validationMiddleware(courseSchema), updateCourse);
router.delete('/:id', authMiddleware, roleMiddleware(['instructor', 'admin']), deleteCourse);
router.post('/:id/enroll', authMiddleware, roleMiddleware(['student']), enrollCourse);
router.get('/:id/progress', authMiddleware, roleMiddleware(['student']), getCourseProgress);
router.patch('/:id/progress', authMiddleware, roleMiddleware(['student']), validationMiddleware(progressUpdateSchema), updateCourseProgress);
router.post('/:id/lessons/:lessonId/complete', authMiddleware, roleMiddleware(['student']), completeCourseLesson);
router.post('/:id/review', authMiddleware, roleMiddleware(['student']), validationMiddleware(courseReviewSchema), createCourseReview);
router.get('/:id/modules', authMiddleware, getCourseModules);
router.post('/:id/modules', authMiddleware, roleMiddleware(['instructor', 'admin']), validationMiddleware(moduleSchema), addCourseModule);
router.put('/modules/:moduleId', authMiddleware, roleMiddleware(['instructor', 'admin']), validationMiddleware(moduleUpdateSchema), updateCourseModule);
router.delete('/modules/:moduleId', authMiddleware, roleMiddleware(['instructor', 'admin']), deleteCourseModule);
router.patch('/:id/modules/reorder', authMiddleware, roleMiddleware(['instructor', 'admin']), validationMiddleware(reorderModulesSchema), reorderModules);
router.post('/modules/:moduleId/lessons', authMiddleware, roleMiddleware(['instructor', 'admin']), validationMiddleware(lessonSchema), addModuleLesson);
router.put('/modules/:moduleId/lessons/:lessonId', authMiddleware, roleMiddleware(['instructor', 'admin']), validationMiddleware(lessonUpdateSchema), updateModuleLesson);
router.delete('/modules/:moduleId/lessons/:lessonId', authMiddleware, roleMiddleware(['instructor', 'admin']), deleteModuleLesson);
router.patch('/modules/:moduleId/lessons/reorder', authMiddleware, roleMiddleware(['instructor', 'admin']), validationMiddleware(reorderLessonsSchema), reorderLessons);

export default router;
