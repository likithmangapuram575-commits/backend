import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as notificationService from './notification.service';

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const data = await notificationService.getNotifications(req.user!.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markRead = async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.markAsRead(Number(req.params.id), req.user!.id);
    res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.markAllAsRead(req.user!.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
