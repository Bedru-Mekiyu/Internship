import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { getSettings, updateSettings, resetSettings } from '../controllers/settings.controller';

const router = express.Router();

router.use(authMiddleware);

router.get('/', roleMiddleware(['admin']), getSettings);
router.patch('/', roleMiddleware(['admin']), updateSettings);
router.post('/reset', roleMiddleware(['admin']), resetSettings);

export default router;
