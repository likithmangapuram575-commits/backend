import { Request, Response } from 'express';
import * as subAssignService from './subject_assignment.service';
import * as hodService from '../hod/hod.service';

export const getAssignments = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const hod = await hodService.getHodByUserId(userId);
    if (!hod) {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }
    const assignments = await subAssignService.getAssignmentsByDepartment(hod.department_id);
    res.json(assignments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createAssignment = async (req: any, res: Response): Promise<void> => {
  try {
    await subAssignService.addAssignment(req.body);
    res.status(201).json({ message: 'Subject(s) assigned successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAssignment = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await subAssignService.deleteAssignment(Number(id));
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
