import { Router } from 'express';
import { getSubjects, createSubject, editSubject, removeSubject } from './subject.controller';
import { authenticateToken, requireSuperAdmin, requireAdmin } from '../../middleware/auth.middleware';
import { auditLog } from '../../middleware/audit.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', requireAdmin, getSubjects);
router.post('/', requireSuperAdmin, auditLog('CREATE', 'subjects'), createSubject);
router.put('/:id', requireSuperAdmin, auditLog('UPDATE', 'subjects'), editSubject);
router.delete('/:id', requireSuperAdmin, auditLog('DELETE', 'subjects'), removeSubject);

export default router;
