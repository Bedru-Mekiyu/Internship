import express from 'express';
import {
  getContents,
  getManagedContents,
  getContentBySlug,
  createContent,
  updateContent,
  deleteContent,
  uploadMedia,
  getMedia,
  deleteMedia,
  renameMedia,
} from '../controllers/content.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { validationMiddleware, contentSchema, mediaRenameSchema } from '../utils/validators';
import { getUploadMiddleware } from '../middlewares/upload.middleware';

const router = express.Router();

router.get('/', getContents);
router.get('/manage', authMiddleware, roleMiddleware(['content_manager', 'admin']), getManagedContents);
router.get('/media', authMiddleware, roleMiddleware(['content_manager', 'admin', 'instructor']), getMedia);
router.delete('/media/:id', authMiddleware, roleMiddleware(['content_manager', 'admin', 'instructor']), deleteMedia);
router.patch('/media/:id', authMiddleware, roleMiddleware(['content_manager', 'admin', 'instructor']), validationMiddleware(mediaRenameSchema), renameMedia);
router.get('/:slug', getContentBySlug);
router.post('/', authMiddleware, roleMiddleware(['content_manager', 'admin']), validationMiddleware(contentSchema), createContent);
router.put('/:id', authMiddleware, roleMiddleware(['content_manager', 'admin']), validationMiddleware(contentSchema), updateContent);
router.delete('/:id', authMiddleware, roleMiddleware(['content_manager', 'admin']), deleteContent);
router.post('/upload', authMiddleware, roleMiddleware(['content_manager', 'admin', 'instructor']), getUploadMiddleware().single('file'), uploadMedia);

export default router;
