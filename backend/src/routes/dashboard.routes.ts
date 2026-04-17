import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { getAdminDashboard, getInstructorDashboard, getStudentDashboard } from '../controllers/dashboard.controller';

const router = express.Router();

router.get('/student', authMiddleware, roleMiddleware(['student']), getStudentDashboard);
router.get('/instructor', authMiddleware, roleMiddleware(['instructor', 'admin']), getInstructorDashboard);
router.get('/admin', authMiddleware, roleMiddleware(['admin']), getAdminDashboard);

export default router;
