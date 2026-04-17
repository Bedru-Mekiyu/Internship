import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { changePassword, createUser, deleteUser, getUsers, updateMe, updateUser } from '../controllers/user.controller';

const router = express.Router();

router.use(authMiddleware);

router.post('/', roleMiddleware(['admin']), createUser);
router.get('/', roleMiddleware(['admin']), getUsers);
router.patch('/me', updateMe);
router.patch('/me/password', changePassword);
router.patch('/:userId', roleMiddleware(['admin']), updateUser);
router.delete('/:userId', roleMiddleware(['admin']), deleteUser);

export default router;