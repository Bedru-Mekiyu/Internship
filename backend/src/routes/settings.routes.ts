import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { getPublicSettings, getSettings, updateSettings, resetSettings } from '../controllers/settings.controller';
import { settingsUpdateSchema, validationMiddleware } from '../utils/validators';

const router = express.Router();

router.get('/public', getPublicSettings);

router.use(authMiddleware);

router.get('/', roleMiddleware(['admin']), getSettings);
router.patch('/', roleMiddleware(['admin']), validationMiddleware(settingsUpdateSchema), updateSettings);
router.post('/reset', roleMiddleware(['admin']), resetSettings);

export default router;
