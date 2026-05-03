import { Request, Response } from 'express';
import * as timetableService from './timetable.service';
import * as hodService from '../hod/hod.service';

export const getTimetable = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const hod = await hodService.getHodByUserId(userId);
    if (!hod) {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }
    const timetable = await timetableService.getTimetableByDepartment(hod.department_id);
    res.json(timetable);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTimetableEntry = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const hod = await hodService.getHodByUserId(userId);
    if (!hod) {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    const { section_id, subject_id, faculty_id, day, period, day_of_week, start_time, end_time, room_number } = req.body;
    
    const conflict = await timetableService.checkConflict({
      section_id, faculty_id, day, period, day_of_week, start_time, end_time
    });

    if (conflict.facultyConflict) {
      res.status(400).json({ message: 'Conflict: Faculty is already assigned at this time.' });
      return;
    }
    if (conflict.sectionConflict) {
      res.status(400).json({ message: 'Conflict: Section already has a class at this time.' });
      return;
    }

    await timetableService.addTimetableEntry({
      department_id: hod.department_id,
      section_id, subject_id, faculty_id, day, period, day_of_week, start_time, end_time, room_number
    });

    res.status(201).json({ message: 'Timetable entry created successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTimetableEntry = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await timetableService.deleteTimetableEntry(Number(id));
    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const generateTimetable = async (req: any, res: Response): Promise<void> => {
  try {
    const { batch_id, year, semester } = req.body;
    if (!batch_id || !year || !semester) {
      res.status(400).json({ message: 'batch_id, year, and semester are required.' });
      return;
    }
    const result = await timetableService.generateTimetable(Number(batch_id), Number(year), Number(semester));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
