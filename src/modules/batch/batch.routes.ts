import { Router } from 'express';
import { authenticateToken, requireSuperAdmin, requireAdmin } from '../../middleware/auth.middleware';
import * as batchController from './batch.controller';

const router = Router();

router.use(authenticateToken);

router.get('/', requireAdmin, batchController.getBatches);
router.post('/', requireSuperAdmin, batchController.createBatch);
router.delete('/:id', requireSuperAdmin, batchController.deleteBatch);

export default router;
