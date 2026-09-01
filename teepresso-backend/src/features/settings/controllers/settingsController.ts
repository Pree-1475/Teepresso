import { Request, Response } from 'express';
import { settingsDatabase } from '../models/settingsModel.js';
import { saveDb } from '../../../config/jsonDb.js';

// Get settings
export const getSettingsController = (_req: Request, res: Response): void => {
  // Convert settings array to key-value object
  const settingsObj: Record<string, any> = {};
  settingsDatabase.forEach(item => {
    settingsObj[item.key] = item.value;
  });

  res.json({
    success: true,
    settings: settingsObj
  });
};

// Update settings
export const updateSettingsController = (req: Request, res: Response): void => {
  const updates = req.body; // e.g. { storefrontMode: 'STANDARD' }

  if (typeof updates !== 'object' || updates === null) {
    res.status(400).json({ success: false, message: 'Invalid updates payload' });
    return;
  }

  Object.entries(updates).forEach(([key, value]) => {
    const existing = settingsDatabase.find(item => item.key === key);
    if (existing) {
      existing.value = value;
    } else {
      settingsDatabase.push({ key, value });
    }
  });

  saveDb();

  // Return full updated settings
  const settingsObj: Record<string, any> = {};
  settingsDatabase.forEach(item => {
    settingsObj[item.key] = item.value;
  });

  res.json({
    success: true,
    message: 'Settings updated successfully',
    settings: settingsObj
  });
};
