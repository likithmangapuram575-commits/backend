import { Router } from 'express';
import { 
  getHods, 
  createHod, 
  updateHod, 
  deleteHod,
  getStats,
  getProfile
} from './hod.controller';
import { authenticateToken, requireSuperAdmin, requireAdmin } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';

const router = Router();

router.use(authenticateToken);

// Accessible by HOD and SuperAdmin
router.get('/stats', getStats);
router.get('/profile/:userId', requireAdmin, getProfile);

// Super Admin Only Routes
router.use(requireSuperAdmin);
router.get('/', getHods);
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'documents', maxCount: 5 }]), createHod);
router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'documents', maxCount: 5 }]), updateHod);
router.delete('/:id', deleteHod);

export default router;
