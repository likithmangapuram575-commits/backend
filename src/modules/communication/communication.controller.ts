import { Request, Response } from 'express';
import * as commsService from './communication.service';

export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await commsService.getAllAnnouncements();
    res.json(announcements);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, description, target_role } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and Description are required' });
    }
    const result = await commsService.addAnnouncement({ title, description, target_role: target_role || 'All' });
    res.status(201).json({ message: 'Announcement posted successfully', id: result.insertId });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await commsService.deleteAnnouncement(Number(id));
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
