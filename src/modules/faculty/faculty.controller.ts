import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as facultyService from './faculty.service';
import pool from '../../config/db';

export const getFaculties = async (req: AuthRequest, res: Response) => {
  try {
    let deptId;
    if (req.user?.role === 'HOD') {
      const [hod]: any = await pool.query('SELECT department_id FROM faculty_details WHERE user_id = ?', [req.user.id]);
      if (hod.length > 0) deptId = hod[0].department_id;
    }
    const data = await facultyService.getAllFaculties(deptId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const postCreateFaculty = async (req: AuthRequest, res: Response) => {
  try {
    let deptId = req.body.department_id;
    if (!deptId && req.user?.role === 'HOD') {
      const [hod]: any = await pool.query('SELECT department_id FROM faculty_details WHERE user_id = ?', [req.user.id]);
      if (hod.length > 0) deptId = hod[0].department_id;
    }
    const data = await facultyService.createFaculty(req.body, deptId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const putUpdateFaculty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = await facultyService.updateFaculty(Number(id), req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFaculty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = await facultyService.deleteFaculty(Number(id));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const data = await facultyService.getFacultyDashboard(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const data = await facultyService.getFacultySchedule(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubjects = async (req: AuthRequest, res: Response) => {
  try {
    const data = await facultyService.getFacultySubjects(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const { section_id } = req.query;
    if (!section_id) return res.status(400).json({ message: 'Section ID required' });
    const data = await facultyService.getStudentsForSection(Number(section_id));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const postAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const data = await facultyService.submitAttendance({
      ...req.body,
      faculty_id: req.user!.id
    });
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const postMarks = async (req: AuthRequest, res: Response) => {
  try {
    const data = await facultyService.submitMarks({
      ...req.body,
      faculty_id: req.user!.id
    });
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const postLeave = async (req: AuthRequest, res: Response) => {
  try {
    const data = await facultyService.applyLeave(req.user!.id, req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const data = await facultyService.getLeaveHistory(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const data = await facultyService.getFacultyProfile(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStatus = async (req: AuthRequest, res: Response) => {
  try {
    const data = await facultyService.getSubmissionStatus(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCurrentClass = async (req: AuthRequest, res: Response) => {
  try {
    const data = await facultyService.getCurrentClass(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const data = await facultyService.getPendingAttendanceForHOD(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const putUpdateAttendanceStatus = async (req: AuthRequest, res: Response) => {
  try {
    const data = await facultyService.updateAttendanceStatus(req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
