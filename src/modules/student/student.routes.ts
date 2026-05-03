import { Router } from 'express';
import * as studentController from './student.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

// All student routes require authentication
router.use(authenticateToken);

router.get('/dashboard', studentController.getDashboard);
router.get('/timetable', studentController.getTimetable);
router.get('/attendance', studentController.getAttendance);
router.get('/marks', studentController.getMarks);
router.get('/fees', studentController.getFees);
router.get('/profile', studentController.getProfile);
router.get('/documents', studentController.getDocuments);

export default router;
