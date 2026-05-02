import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import {
  changePassword,
  createUser,
  deleteUser,
  getUsers,
  updateMe,
  updateUser,
  uploadMeAvatar,
} from '../controllers/user.controller';
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  changePasswordSchema,
  updateMeSchema,
  validationMiddleware,
} from '../utils/validators';
import { getUploadMiddleware } from '../middlewares/upload.middleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/', roleMiddleware(['admin']), validationMiddleware(adminCreateUserSchema), createUser);
router.get('/', roleMiddleware(['admin']), getUsers);
router.patch('/me', validationMiddleware(updateMeSchema), updateMe);
router.post('/me/avatar', getUploadMiddleware().single('file'), uploadMeAvatar);
router.patch('/me/password', validationMiddleware(changePasswordSchema), changePassword);
router.patch('/:userId', roleMiddleware(['admin']), validationMiddleware(adminUpdateUserSchema), updateUser);
router.delete('/:userId', roleMiddleware(['admin']), deleteUser);

export default router;
