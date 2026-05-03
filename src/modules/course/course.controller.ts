import { Request, Response } from 'express';
import * as courseService from './course.service';

export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await courseService.getAllCourses();
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { name, duration_years, total_semesters } = req.body;
    if (!name || !duration_years || !total_semesters) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const result = await courseService.addCourse(name, Number(duration_years), Number(total_semesters));
    res.status(201).json({ message: 'Course created successfully', id: result.insertId });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const editCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, duration_years, total_semesters } = req.body;
    await courseService.updateCourse(Number(id), name, Number(duration_years), Number(total_semesters));
    res.json({ message: 'Course updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await courseService.deleteCourse(Number(id));
    res.json({ message: 'Course deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
