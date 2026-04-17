import express from 'express';
import {
	createContactMessage,
	assignContactMessage,
	getContactMessages,
	updateContactMessageStatus,
} from '../controllers/contact.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/', createContactMessage);
router.get('/', authMiddleware, roleMiddleware(['admin']), getContactMessages);
router.patch('/:contactMessageId/assign', authMiddleware, roleMiddleware(['admin']), assignContactMessage);
router.patch('/:contactMessageId/status', authMiddleware, roleMiddleware(['admin']), updateContactMessageStatus);

export default router;
