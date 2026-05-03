import { Router } from 'express';
import { 
  getSections, 
  createSection, 
  updateSection, 
  deleteSection 
} from './section.controller';
import { authenticateToken, requireSuperAdmin, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', requireAdmin, getSections);
router.post('/', requireSuperAdmin, createSection);
router.put('/:id', requireSuperAdmin, updateSection);
router.delete('/:id', requireSuperAdmin, deleteSection);

export default router;
