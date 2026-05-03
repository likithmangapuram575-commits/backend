import { Request, Response } from 'express';
import * as systemService from './system.service';

export const getCalendar = async (req: Request, res: Response) => {
  try {
    const events = await systemService.getAllCalendarEvents();
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { event_name, type, start_date, end_date, batch_id } = req.body;
    if (!event_name || !type || !start_date || !end_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const result = await systemService.addCalendarEvent({
      event_name, type, start_date, end_date, batch_id: batch_id ? Number(batch_id) : undefined
    });
    res.status(201).json({ message: 'Event created successfully', id: result.insertId });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await systemService.deleteCalendarEvent(Number(id));
    res.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const logs = await systemService.getAuditLogs();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const handleSearch = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const results = await systemService.globalSearch(q as string);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
