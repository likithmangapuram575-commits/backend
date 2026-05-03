import { Router } from 'express';
import { getCourses, createCourse, editCourse, removeCourse } from './course.controller';
import { authenticateToken, requireSuperAdmin, requireAdmin } from '../../middleware/auth.middleware';
import { auditLog } from '../../middleware/audit.middleware';

const router = Router();

router.get('/', authenticateToken, requireAdmin, getCourses);
router.post('/', authenticateToken, requireSuperAdmin, auditLog('CREATE', 'courses'), createCourse);
router.put('/:id', authenticateToken, requireSuperAdmin, auditLog('UPDATE', 'courses'), editCourse);
router.delete('/:id', authenticateToken, requireSuperAdmin, auditLog('DELETE', 'courses'), removeCourse);

export default router;
