import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import {
  downloadCertificatePage,
  downloadCertificatePdf,
  generateCourseCertificate,
  getMyCertificates,
  renderCertificatePage,
  verifyCertificate,
} from '../controllers/certificate.controller';

const router = express.Router();

router.get('/verify/:certificateId', verifyCertificate);
router.get('/me', authMiddleware, roleMiddleware(['student']), getMyCertificates);
router.post('/course/:courseId/generate', authMiddleware, roleMiddleware(['student']), generateCourseCertificate);
router.get('/:certificateId/render', authMiddleware, roleMiddleware(['student']), renderCertificatePage);
router.get('/:certificateId/download', authMiddleware, roleMiddleware(['student']), downloadCertificatePage);
router.get('/:certificateId/download-pdf', authMiddleware, roleMiddleware(['student']), downloadCertificatePdf);

export default router;
