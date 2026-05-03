import { Router } from 'express';
import { getAnnouncements, createAnnouncement, removeAnnouncement } from './communication.controller';
import { authenticateToken, requireSuperAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.use(requireSuperAdmin);

router.get('/', getAnnouncements);
router.post('/', createAnnouncement);
router.delete('/:id', removeAnnouncement);

export default router;
