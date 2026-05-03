import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import * as hodService from './hod.service';

export const getHods = async (req: Request, res: Response): Promise<void> => {
  try {
    const hods = await hodService.getAllHods();
    res.json(hods);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createHod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, password, experience, qualification, position, department_id } = req.body;
    
    let documents: string[] = [];
    let image_url: string | undefined;

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.documents) {
        documents = files.documents.map(f => f.filename);
      }
      if (files.image) {
        image_url = files.image[0].filename;
      }
    }
    
    if (!name || !phone || !password || !department_id) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await hodService.addHod({
      name, phone, hashedPassword, experience, qualification, position, image_url,
      department_id, documents: JSON.stringify(documents)
    });

    res.status(201).json({ message: 'HOD created successfully', hodId: result.insertId });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phone, experience, qualification, position, department_id } = req.body;
    
    let documents: string[] | undefined;
    let image_url: string | undefined;

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.documents) {
        documents = files.documents.map(f => f.filename);
      }
      if (files.image) {
        image_url = files.image[0].filename;
      }
    }
    
    await hodService.editHod(Number(id), {
      name, phone, experience, qualification, position, image_url, department_id, 
      documents: documents ? JSON.stringify(documents) : undefined
    });

    res.json({ message: 'HOD updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await hodService.removeHod(Number(id));
    res.json({ message: 'HOD deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getStats = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const hod = await hodService.getHodByUserId(userId);
    if (!hod) {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }
    const stats = await hodService.getDashboardStats(hod.department_id);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const hod = await hodService.getHodByUserId(Number(userId));
    if (!hod) {
      res.status(404).json({ message: 'HOD profile not found' });
      return;
    }
    res.json(hod);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
