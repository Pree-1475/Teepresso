import { Request, Response } from 'express';
import { usersDatabase } from '../models/userModel.js';
import { saveDb } from '../../../config/jsonDb.js';

export const loginController = (req: Request, res: Response): void => {
  const { emailOrPhone, password, role } = req.body;
  const user = usersDatabase.find(
    u => u.email === emailOrPhone || u.phone === emailOrPhone
  );

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (password && user.password && user.password !== password) {
    res.status(401).json({ success: false, message: 'Invalid password' });
    return;
  }

  res.json({
    success: true,
    message: 'Authentication successful',
    user,
  });
};

export const registerController = (req: Request, res: Response): void => {
  const { name, email, phone, password } = req.body;
  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    phone,
    role: 'customer' as const,
    password: password || 'customer123',
    createdAt: new Date(),
  };

  usersDatabase.push(newUser);
  saveDb();
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: newUser,
  });
};

export const getUsersController = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    users: usersDatabase
  });
};

export const getCustomersController = (_req: Request, res: Response): void => {
  const customers = usersDatabase.filter(u => u.role === 'customer' || !u.role);
  res.json({
    success: true,
    customers
  });
};

export const otpLoginController = (req: Request, res: Response): void => {
  const { phone } = req.body;
  if (!phone) {
    res.status(400).json({ success: false, message: 'Phone number is required' });
    return;
  }

  let user = usersDatabase.find(u => u.phone === phone);
  if (!user) {
    user = {
      id: `c_${Date.now()}`,
      name: '',
      email: '',
      phone,
      orgName: '',
      orgType: '',
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: 'Registered via OTP',
      role: 'customer',
      createdAt: new Date()
    };
    usersDatabase.push(user);
    saveDb();
  }

  res.json({
    success: true,
    message: 'OTP Login successful',
    user
  });
};

export const createUserController = (req: Request, res: Response): void => {
  const { name, email, phone, role, password } = req.body;
  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    phone,
    role: role || 'editor',
    password: password || 'teepresso123',
    createdAt: new Date()
  };

  usersDatabase.push(newUser);
  saveDb();
  res.status(201).json({
    success: true,
    message: 'Staff user created successfully',
    user: newUser
  });
};

export const updateUserController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { name, email, phone, role, password } = req.body;

  const user = usersDatabase.find(u => u.id === id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (role !== undefined) user.role = role;
  if (password !== undefined) user.password = password;

  saveDb();
  res.json({
    success: true,
    message: 'User updated successfully',
    user
  });
};

export const deleteUserController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = usersDatabase.findIndex(u => u.id === id);
  if (index === -1) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  usersDatabase.splice(index, 1);
  saveDb();
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
};

