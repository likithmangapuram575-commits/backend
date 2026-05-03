import { Request, Response } from 'express';
import * as sectionService from './section.service';

export const getSections = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department_id, batch_id, year, semester } = req.query;
    let sections = await sectionService.getAllSections() as any[];
    
    if (department_id) sections = sections.filter(s => s.department_id === Number(department_id));
    if (batch_id) sections = sections.filter(s => s.batch_id === Number(batch_id));
    if (year) sections = sections.filter(s => s.year === Number(year));
    if (semester) sections = sections.filter(s => s.semester === Number(semester));

    res.json(sections);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, department_id, batch_id, year, semester } = req.body;
    if (!name || !department_id || !batch_id || !year || !semester) {
      res.status(400).json({ message: 'Name, department_id, batch_id, year, and semester are required' });
      return;
    }
    const result = await sectionService.addSection(name, Number(department_id), Number(batch_id), Number(year), Number(semester));
    res.status(201).json({ message: 'Section created successfully', sectionId: result.insertId });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, department_id, batch_id, year, semester } = req.body;
    if (!name || !department_id || !batch_id || !year || !semester) {
      res.status(400).json({ message: 'Name, department_id, batch_id, year, and semester are required' });
      return;
    }
    await sectionService.editSection(Number(id), name, Number(department_id), Number(batch_id), Number(year), Number(semester));
    res.json({ message: 'Section updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await sectionService.removeSection(Number(id));
    res.json({ message: 'Section deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
