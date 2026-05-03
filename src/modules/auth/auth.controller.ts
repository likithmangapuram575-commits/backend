import { Request, Response } from 'express';
import * as authService from './auth.service';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      res.status(400).json({ message: 'Phone and password are required' });
      return;
    }

    const { user, token } = await authService.authenticateUser(phone, password);
    res.json({ message: 'Login successful', token, user });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const postRequestOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }
    const data = await authService.requestOTP(email);
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const postVerifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ message: 'Email and OTP are required' });
      return;
    }
    const data = await authService.verifyOTP(email, otp);
    res.json(data);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};
