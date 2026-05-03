import { Request, Response } from 'express';
import * as departmentService from './department.service';

export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const departments = await departmentService.getAllDepartments();
    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, course_id } = req.body;
    if (!name || !course_id) {
      res.status(400).json({ message: 'Name and Course ID are required' });
      return;
    }
    const result = await departmentService.addDepartment(name, Number(course_id));
    res.status(201).json({ message: 'Department created successfully', departmentId: result.insertId });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, course_id } = req.body;
    if (!name || !course_id) {
      res.status(400).json({ message: 'Name and Course ID are required' });
      return;
    }
    await departmentService.editDepartment(Number(id), name, Number(course_id));
    res.json({ message: 'Department updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await departmentService.removeDepartment(Number(id));
    res.json({ message: 'Department deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
