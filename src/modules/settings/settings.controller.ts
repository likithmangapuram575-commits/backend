import { Request, Response } from 'express';
import * as settingsService from './settings.service';

export const getSystemSettings = async (req: Request, res: Response) => {
  try {
    const settings = await settingsService.getSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    const { college_name } = req.body;
    const college_logo = req.file ? req.file.filename : undefined;
    
    await settingsService.updateSettings({ college_name, college_logo });
    res.json({ message: 'Settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
