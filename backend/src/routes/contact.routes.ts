import express from 'express';
import {
	createContactMessage,
	assignContactMessage,
	getContactMessages,
	updateContactMessageStatus,
} from '../controllers/contact.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import {
	contactAssignSchema,
	contactCreateSchema,
	contactStatusSchema,
	validationMiddleware,
} from '../utils/validators';

const router = express.Router();

router.post('/', validationMiddleware(contactCreateSchema), createContactMessage);
router.get('/', authMiddleware, roleMiddleware(['admin']), getContactMessages);
router.patch(
	'/:contactMessageId/assign',
	authMiddleware,
	roleMiddleware(['admin']),
	validationMiddleware(contactAssignSchema),
	assignContactMessage
);
router.patch(
	'/:contactMessageId/status',
	authMiddleware,
	roleMiddleware(['admin']),
	validationMiddleware(contactStatusSchema),
	updateContactMessageStatus
);

export default router;
