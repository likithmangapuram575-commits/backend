import { Router } from 'express';
import { getSystemSettings, updateSystemSettings } from './settings.controller';
import { authenticateToken, requireSuperAdmin } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';
import { auditLog } from '../../middleware/audit.middleware';

const router = Router();

router.get('/', getSystemSettings);
router.put('/', authenticateToken, requireSuperAdmin, upload.single('logo'), auditLog('UPDATE', 'settings'), updateSystemSettings);

export default router;
