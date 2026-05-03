import { Router } from 'express';
import * as facultyController from './faculty.controller';
import { authenticateToken, requireFaculty } from '../../middleware/auth.middleware';
import { auditLog } from '../../middleware/audit.middleware';

const router = Router();

// All faculty routes require authentication and Faculty role
router.use(authenticateToken);
router.use(requireFaculty);

// CRUD Routes (Used by HOD/SuperAdmin)
router.get('/', facultyController.getFaculties);
router.post('/', auditLog('CREATE', 'faculty'), facultyController.postCreateFaculty);
router.put('/:id', auditLog('UPDATE', 'faculty'), facultyController.putUpdateFaculty);
router.delete('/:id', auditLog('DELETE', 'faculty'), facultyController.deleteFaculty);

// Faculty Self Routes
router.get('/dashboard', facultyController.getDashboard);
router.get('/schedule', facultyController.getSchedule);
router.get('/subjects', facultyController.getSubjects);
router.get('/students', facultyController.getStudents);
router.get('/profile', facultyController.getProfile);
router.get('/status', facultyController.getStatus);
router.get('/current-class', facultyController.getCurrentClass);

router.post('/attendance', auditLog('SUBMIT', 'attendance'), facultyController.postAttendance);
router.post('/marks', auditLog('SUBMIT', 'marks'), facultyController.postMarks);

// HOD Approval Routes
router.get('/pending-attendance', facultyController.getPendingAttendance);
router.put('/attendance-status', auditLog('APPROVE', 'attendance'), facultyController.putUpdateAttendanceStatus);

router.post('/leave', facultyController.postLeave);
router.get('/leaves', facultyController.getLeaves);

export default router;
