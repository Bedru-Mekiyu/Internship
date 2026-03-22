import express from 'express';
import { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, enrollCourse, getCourseProgress, createCourseReview } from '../controllers/course.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { validationMiddleware, courseSchema, courseReviewSchema } from '../utils/validators';

const router = express.Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', authMiddleware, roleMiddleware(['instructor', 'admin']), validationMiddleware(courseSchema), createCourse);
router.put('/:id', authMiddleware, roleMiddleware(['instructor', 'admin']), validationMiddleware(courseSchema), updateCourse);
router.delete('/:id', authMiddleware, roleMiddleware(['instructor', 'admin']), deleteCourse);
router.post('/:id/enroll', authMiddleware, roleMiddleware(['student']), enrollCourse);
router.get('/:id/progress', authMiddleware, roleMiddleware(['student']), getCourseProgress);
router.post('/:id/review', authMiddleware, roleMiddleware(['student']), validationMiddleware(courseReviewSchema), createCourseReview);

export default router;