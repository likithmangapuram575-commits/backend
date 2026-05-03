import { Request, Response } from 'express';
import * as financeService from './finance.service';

export const getFees = async (req: Request, res: Response) => {
  try {
    const fees = await financeService.getAllFees();
    res.json(fees);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createFees = async (req: Request, res: Response) => {
  try {
    const { batch_id, tuition_fee, bus_fee, hostel_fee, other_charges } = req.body;
    if (!batch_id || tuition_fee === undefined) {
      return res.status(400).json({ message: 'Batch ID and Tuition Fee are required' });
    }
    const result = await financeService.addFees({
      batch_id: Number(batch_id),
      tuition_fee: Number(tuition_fee),
      bus_fee: Number(bus_fee || 0),
      hostel_fee: Number(hostel_fee || 0),
      other_charges: Number(other_charges || 0)
    });
    res.status(201).json({ message: 'Fee structure created successfully', id: result.insertId });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const editFees = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { batch_id, tuition_fee, bus_fee, hostel_fee, other_charges } = req.body;
    await financeService.updateFees(Number(id), {
      batch_id: Number(batch_id),
      tuition_fee: Number(tuition_fee),
      bus_fee: Number(bus_fee || 0),
      hostel_fee: Number(hostel_fee || 0),
      other_charges: Number(other_charges || 0)
    });
    res.json({ message: 'Fee structure updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFees = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await financeService.deleteFees(Number(id));
    res.json({ message: 'Fee structure deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
