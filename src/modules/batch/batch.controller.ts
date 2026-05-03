import { Request, Response } from 'express';
import * as batchService from './batch.service';

import * as courseService from '../course/course.service';

export const getBatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const batches = await batchService.getAllBatches();
    res.json(batches);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start_year, end_year, course_id } = req.body;
    
    if (!start_year || !end_year || !course_id) {
      res.status(400).json({ message: 'Start year, End year, and Course ID are required' });
      return;
    }

    const course = await courseService.getCourseById(Number(course_id));
    if (!course) {
      res.status(400).json({ message: 'Invalid Course ID' });
      return;
    }

    if (Number(end_year) !== Number(start_year) + course.duration_years) {
      res.status(400).json({ message: `End year must be exactly Start year + ${course.duration_years} (Course Duration)` });
      return;
    }

    const result = await batchService.addBatch(Number(start_year), Number(end_year), Number(course_id));
    res.status(201).json({ message: 'Batch created successfully', batchId: result.insertId });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'This batch already exists for this course' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

export const deleteBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await batchService.removeBatch(Number(id));
    res.json({ message: 'Batch deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
