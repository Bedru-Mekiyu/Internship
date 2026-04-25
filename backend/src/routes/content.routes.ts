import express from 'express';
<<<<<<< HEAD
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
=======
import { getContents, getContentBySlug, createContent, updateContent, deleteContent, uploadMedia, getMedia } from '../controllers/content.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { validationMiddleware, contentSchema } from '../utils/validators';
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
import { getUploadMiddleware } from '../middlewares/upload.middleware';

const router = express.Router();

router.get('/', getContents);
<<<<<<< HEAD
router.get('/manage', authMiddleware, roleMiddleware(['content_manager', 'admin']), getManagedContents);
router.get('/media', authMiddleware, roleMiddleware(['content_manager', 'admin', 'instructor']), getMedia);
router.delete('/media/:id', authMiddleware, roleMiddleware(['content_manager', 'admin', 'instructor']), deleteMedia);
router.patch('/media/:id', authMiddleware, roleMiddleware(['content_manager', 'admin', 'instructor']), validationMiddleware(mediaRenameSchema), renameMedia);
=======
router.get('/media', authMiddleware, roleMiddleware(['content_manager', 'admin']), getMedia);
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
router.get('/:slug', getContentBySlug);
router.post('/', authMiddleware, roleMiddleware(['content_manager', 'admin']), validationMiddleware(contentSchema), createContent);
router.put('/:id', authMiddleware, roleMiddleware(['content_manager', 'admin']), validationMiddleware(contentSchema), updateContent);
router.delete('/:id', authMiddleware, roleMiddleware(['content_manager', 'admin']), deleteContent);
<<<<<<< HEAD
router.post('/upload', authMiddleware, roleMiddleware(['content_manager', 'admin', 'instructor']), getUploadMiddleware().single('file'), uploadMedia);

export default router;
=======
router.post('/upload', authMiddleware, roleMiddleware(['content_manager', 'admin']), getUploadMiddleware().single('file'), uploadMedia);

export default router;
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
