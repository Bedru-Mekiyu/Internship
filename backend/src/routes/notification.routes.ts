import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
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
router.post('/', roleMiddleware(['instructor', 'admin']), createNotification);
router.post('/bulk', roleMiddleware(['admin']), createBulkNotifications);
router.post('/cleanup', roleMiddleware(['admin']), cleanupNotifications);
router.patch('/me/read-all', markAllNotificationsRead);
router.patch('/:notificationId/read', markNotificationRead);
router.delete('/:notificationId', deleteNotification);

export default router;
