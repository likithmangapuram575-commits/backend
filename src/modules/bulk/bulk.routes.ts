import { Router } from 'express';
import { uploadStudents, uploadFaculty } from './bulk.controller';
import { authenticateToken, requireSuperAdmin } from '../../middleware/auth.middleware';
import { auditLog } from '../../middleware/audit.middleware';

const router = Router();

router.use(authenticateToken);
router.use(requireSuperAdmin);

router.post('/students', auditLog('IMPORT', 'students'), uploadStudents);
router.post('/faculty', auditLog('IMPORT', 'faculty'), uploadFaculty);

export default router;
