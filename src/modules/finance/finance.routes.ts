import { Router } from 'express';
import { getFees, createFees, editFees, removeFees } from './finance.controller';
import { authenticateToken, requireSuperAdmin } from '../../middleware/auth.middleware';
import { auditLog } from '../../middleware/audit.middleware';

const router = Router();

router.use(authenticateToken);
router.use(requireSuperAdmin);

router.get('/', getFees);
router.post('/', auditLog('CREATE', 'fees_structure'), createFees);
router.put('/:id', auditLog('UPDATE', 'fees_structure'), editFees);
router.delete('/:id', auditLog('DELETE', 'fees_structure'), removeFees);

export default router;
