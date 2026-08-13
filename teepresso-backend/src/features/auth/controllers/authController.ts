import { Request, Response } from 'express';
import { usersDatabase } from '../models/userModel.js';

export const loginController = (req: Request, res: Response): void => {
  const { emailOrPhone, role } = req.body;
  const user = usersDatabase.find(
    u => u.email === emailOrPhone || u.phone === emailOrPhone
  ) || {
    id: `usr_${Date.now()}`,
    name: emailOrPhone ? emailOrPhone.split('@')[0] : 'Demo User',
    email: emailOrPhone || 'demo@teepresso.com',
    phone: '9876543210',
    role: role || 'customer',
    createdAt: new Date(),
  };

  res.json({
    success: true,
    message: 'Authentication successful',
    user,
  });
};

export const registerController = (req: Request, res: Response): void => {
  const { name, email, phone } = req.body;
  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    phone,
    role: 'customer' as const,
    createdAt: new Date(),
  };

  usersDatabase.push(newUser);
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: newUser,
  });
};
