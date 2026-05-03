import { Router } from 'express';
import { 
  getDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment 
} from './department.controller';
import { authenticateToken, requireSuperAdmin, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', requireAdmin, getDepartments);
router.post('/', requireSuperAdmin, createDepartment);
router.put('/:id', requireSuperAdmin, updateDepartment);
router.delete('/:id', requireSuperAdmin, deleteDepartment);

export default router;
