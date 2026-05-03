import { Request, Response } from 'express';
import * as subjectService from './subject.service';

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await subjectService.getAllSubjects();
    res.json(subjects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, code, credits, type, department_id, semester } = req.body;
    if (!name || !code || !credits || !type || !department_id || !semester) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const result = await subjectService.addSubject({
      name, code, credits: Number(credits), type, department_id: Number(department_id), semester: Number(semester)
    });
    res.status(201).json({ message: 'Subject created successfully', id: result.insertId });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Subject code already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

export const editSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, credits, type, department_id, semester } = req.body;
    await subjectService.updateSubject(Number(id), {
      name, code, credits: Number(credits), type, department_id: Number(department_id), semester: Number(semester)
    });
    res.json({ message: 'Subject updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await subjectService.deleteSubject(Number(id));
    res.json({ message: 'Subject deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
