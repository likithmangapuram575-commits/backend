import { Router } from 'express';
import * as timetableController from './timetable.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', timetableController.getTimetable);
router.post('/', timetableController.createTimetableEntry);
router.post('/generate-timetable', timetableController.generateTimetable);
router.delete('/:id', timetableController.deleteTimetableEntry);

export default router;
