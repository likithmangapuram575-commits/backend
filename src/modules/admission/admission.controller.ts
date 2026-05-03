import { Request, Response } from 'express';
import * as admissionService from './admission.service';
import path from 'path';
import fs from 'fs';

export const createApplication = async (req: Request, res: Response) => {
  try {
    const studentId = await admissionService.createApplication(req.body);
    res.status(201).json({ message: 'Application submitted successfully', studentId });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getApplications = async (req: Request, res: Response) => {
  try {
    const applications = await admissionService.getApplications(req.query);
    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentDetails = async (req: Request, res: Response) => {
  try {
    const student = await admissionService.getStudentDetails(parseInt(req.params.id));
    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status, remarks } = req.body;
    await admissionService.updateStudentStatus(parseInt(req.params.id), status, remarks);
    res.json({ message: 'Status updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { type } = req.body;
    const studentId = parseInt(req.params.id);
    
    const fileName = req.file.filename;
    const filePath = req.file.path;

    await admissionService.uploadDocument(studentId, type, fileName, filePath);
    res.json({ message: 'Document uploaded successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyDocument = async (req: Request, res: Response) => {
  try {
    const { status, remarks } = req.body;
    await admissionService.verifyDocument(parseInt(req.params.docId), status, remarks);
    res.json({ message: 'Document verification status updated' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const activateStudent = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.body;
    const result = await admissionService.activateStudent(parseInt(req.params.id), sectionId);
    res.json({ message: 'Student activated successfully', ...result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await admissionService.getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        await admissionService.deleteDocument(parseInt(req.params.docId));
        res.json({ message: 'Document deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Export features
export const exportToExcel = async (req: Request, res: Response) => {
    try {
        const workbook = await admissionService.exportStudentsToExcel();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const exportProfilePDF = async (req: Request, res: Response) => {
    try {
        const doc = await admissionService.generateStudentPDF(parseInt(req.params.id));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=student_${req.params.id}.pdf`);
        doc.pipe(res);
        doc.end();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const bulkImport = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        await admissionService.bulkImportStudents(req.file.path);
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        res.json({ message: 'Bulk import completed successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};export const deleteStudent = async (req: Request, res: Response) => {
    try {
        await admissionService.deleteStudent(parseInt(req.params.id));
        res.json({ message: 'Student deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
