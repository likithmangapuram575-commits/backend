import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as studentService from './student.service';

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const data = await studentService.getStudentDashboard(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTimetable = async (req: AuthRequest, res: Response) => {
  try {
    const data = await studentService.getStudentTimetable(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const data = await studentService.getStudentAttendance(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMarks = async (req: AuthRequest, res: Response) => {
  try {
    const data = await studentService.getStudentMarks(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFees = async (req: AuthRequest, res: Response) => {
  try {
    const data = await studentService.getStudentFees(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const data = await studentService.getStudentProfile(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const data = await studentService.getStudentDocuments(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
