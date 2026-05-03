import { Router } from 'express';
import * as notificationController from './notification.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', notificationController.getMyNotifications);
router.put('/:id/read', notificationController.markRead);
router.put('/read-all', notificationController.markAllRead);

export default router;
