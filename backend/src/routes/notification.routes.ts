import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import {
  notificationBulkCreateSchema,
  notificationCleanupSchema,
  notificationCreateSchema,
  validationMiddleware,
} from '../utils/validators';
import {
  cleanupNotifications,
  createBulkNotifications,
  createNotification,
  deleteNotification,
  getMyNotifications,
  getMyUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controllers/notification.controller';

const router = express.Router();

router.use(authMiddleware);

router.get('/me', getMyNotifications);
router.get('/me/unread-count', getMyUnreadNotificationCount);
router.post('/', roleMiddleware(['instructor', 'admin']), validationMiddleware(notificationCreateSchema), createNotification);
router.post('/bulk', roleMiddleware(['admin']), validationMiddleware(notificationBulkCreateSchema), createBulkNotifications);
router.post('/cleanup', roleMiddleware(['admin']), validationMiddleware(notificationCleanupSchema), cleanupNotifications);
router.patch('/me/read-all', markAllNotificationsRead);
router.patch('/:notificationId/read', markNotificationRead);
router.delete('/:notificationId', deleteNotification);

export default router;
