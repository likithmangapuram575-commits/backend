import { Router } from 'express';
import * as admissionController from './admission.controller';
import { authenticateToken, authorize } from '../../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';

const router = Router();

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    cb(null, `doc-${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// All routes require authentication and Administrator/SuperAdmin role
router.use(authenticateToken);
router.use(authorize(['Administrator', 'SuperAdmin']));

router.get('/stats', admissionController.getDashboardStats);
router.get('/applications', admissionController.getApplications);
router.post('/apply', admissionController.createApplication);
router.get('/student/:id', admissionController.getStudentDetails);
router.put('/student/:id/status', admissionController.updateStatus);
router.post('/student/:id/activate', admissionController.activateStudent);
router.delete('/student/:id', admissionController.deleteStudent);

router.post('/student/:id/upload-doc', upload.single('file'), admissionController.uploadDocument);
router.put('/document/:docId/verify', admissionController.verifyDocument);
router.delete('/document/:docId', admissionController.deleteDocument);

// Export/Import
router.get('/export/excel', admissionController.exportToExcel);
router.get('/export/pdf/:id', admissionController.exportProfilePDF);
router.post('/import/bulk', upload.single('file'), admissionController.bulkImport);

export default router;
