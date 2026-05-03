import { Router } from 'express';
import * as subAssignController from './subject_assignment.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', subAssignController.getAssignments);
router.post('/', subAssignController.createAssignment);
router.delete('/:id', subAssignController.deleteAssignment);

export default router;
