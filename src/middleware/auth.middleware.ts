import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export interface AuthRequest extends Request {
  user?: {
    id: number;
    phone: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access Denied: No Token Provided' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey123', (err: any, user: any) => {
    if (err) {
      res.status(403).json({ message: 'Invalid Token' });
      return;
    }
    req.user = user;
    next();
  });
};

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'SuperAdmin') {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: Requires Super Admin Role' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && (req.user.role === 'SuperAdmin' || req.user.role === 'HOD' || req.user.role === 'Administrator')) {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: Requires Admin Role' });
  }
};

export const requireFaculty = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && (req.user.role === 'Faculty' || req.user.role === 'HOD' || req.user.role === 'SuperAdmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: Requires Faculty Role' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: `Access Denied: Requires one of [${roles.join(', ')}] roles` });
    }
  };
};
