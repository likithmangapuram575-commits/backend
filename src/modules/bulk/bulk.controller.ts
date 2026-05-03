import { Request, Response } from 'express';
import * as bulkService from './bulk.service';

export const uploadStudents = async (req: Request, res: Response) => {
  try {
    const { students } = req.body; // Expecting array of objects
    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }
    await bulkService.importStudents(students);
    res.json({ message: `Successfully imported \${students.length} students` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadFaculty = async (req: Request, res: Response) => {
  try {
    const { faculty } = req.body;
    if (!faculty || !Array.isArray(faculty)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }
    await bulkService.importFaculty(faculty);
    res.json({ message: `Successfully imported \${faculty.length} faculty members` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
