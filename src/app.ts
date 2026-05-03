import express, { Application, Request, Response, NextFunction } from 'express'; // Triggering re-index
import cors from 'cors';
import path from 'path';

// Import Routes
import authRoutes from './modules/auth/auth.routes';
import departmentRoutes from './modules/department/department.routes';
import sectionRoutes from './modules/section/section.routes';
import hodRoutes from './modules/hod/hod.routes';
import viewRoutes from './modules/readonly-views/views.routes';
import batchRoutes from './modules/batch/batch.routes';
import courseRoutes from './modules/course/course.routes';
import subjectRoutes from './modules/subject/subject.routes';
import financeRoutes from './modules/finance/finance.routes';
import systemRoutes from './modules/system/system.routes';
import commsRoutes from './modules/communication/communication.routes';
import bulkRoutes from './modules/bulk/bulk.routes';
import settingsRoutes from './modules/settings/settings.routes';
import facultyRoutes from './modules/faculty/faculty.routes';
import timetableRoutes from './modules/timetable/timetable.routes';
import subAssignRoutes from './modules/subject_assignment/subject_assignment.routes';
import admissionRoutes from './modules/admission/admission.routes';
import notificationRoutes from './modules/notification/notification.routes';
import studentRoutes from './modules/student/student.routes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Folder for Uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/hods', hodRoutes);
app.use('/api/views', viewRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/announcements', commsRoutes);
app.use('/api/bulk', bulkRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/subject-assignments', subAssignRoutes);
app.use('/api/admission', admissionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/student', studentRoutes);

// Health Check
app.get('/', (req: Request, res: Response) => {
  res.send('College ERP API is running');
});

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

export default app;
