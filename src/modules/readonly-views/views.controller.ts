import { Request, Response } from 'express';
import * as viewsService from './views.service';
import * as hodService from '../hod/hod.service';

const getDepartmentId = async (req: any) => {
  if (req.user.role === 'HOD') {
    const hod = await hodService.getHodByUserId(req.user.id);
    return hod?.department_id;
  }
  return undefined;
};

export const getStudents = async (req: any, res: Response): Promise<void> => {
  try {
    const deptId = await getDepartmentId(req);
    const students = await viewsService.getAllStudents(deptId);
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFaculty = async (req: any, res: Response): Promise<void> => {
  try {
    const deptId = await getDepartmentId(req);
    const faculty = await viewsService.getAllFaculty(deptId);
    res.json(faculty);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendance = async (req: any, res: Response): Promise<void> => {
  try {
    const deptId = await getDepartmentId(req);
    const attendance = await viewsService.getAllAttendance(deptId);
    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMarks = async (req: any, res: Response): Promise<void> => {
  try {
    const deptId = await getDepartmentId(req);
    const marks = await viewsService.getAllMarks(deptId);
    res.json(marks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await viewsService.getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { section_id } = req.query;
    const analytics = await viewsService.getAttendanceAnalytics(section_id ? Number(section_id) : undefined);
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPerformanceAnalytics = async (req: any, res: Response): Promise<void> => {
  try {
    const deptId = await getDepartmentId(req);
    const analytics = await viewsService.getMarksAnalytics(deptId);
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
