import { Router } from 'express';
import { 
  getStudents, 
  getFaculty,
  getAttendance,
  getMarks,
  getDashboardStats,
  getAnalytics,
  getPerformanceAnalytics
} from './views.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

// Views are accessible by both SuperAdmin and HOD
router.get('/students', getStudents);
router.get('/faculty', getFaculty);
router.get('/attendance', getAttendance);
router.get('/marks', getMarks);
router.get('/dashboard-stats', getDashboardStats);
router.get('/analytics/attendance', getAnalytics);
router.get('/analytics/performance', getPerformanceAnalytics);

export default router;
