import { Router } from 'express';
import { getCalendar, createCalendarEvent, removeCalendarEvent, getLogs, handleSearch } from './system.controller';
import { authenticateToken, requireSuperAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.get('/search', handleSearch);
router.use(requireSuperAdmin);

router.get('/calendar', getCalendar);
router.post('/calendar', createCalendarEvent);
router.delete('/calendar/:id', removeCalendarEvent);

router.get('/logs', getLogs);

export default router;
