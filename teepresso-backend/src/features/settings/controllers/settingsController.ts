import { Request, Response } from 'express';
import { sql } from '../../../config/db.js';

export const getSettingsController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await sql`SELECT * FROM settings`;
    res.json({ success: true, settings });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ success: false, message: 'Server error fetching settings' });
  }
};

export const updateSettingController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, value } = req.body;
    if (!key) {
      res.status(400).json({ success: false, message: 'Setting key is required' });
      return;
    }

    const id = `set_${key}`;
    const valueJson = JSON.stringify(value);

    await sql`
      INSERT INTO settings (id, key, value)
      VALUES (${id}, ${key}, ${valueJson}::jsonb)
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value
    `;

    const updated = await sql`SELECT * FROM settings WHERE key = ${key}`;
    res.json({ success: true, setting: updated[0] });
  } catch (err) {
    console.error('Error updating setting:', err);
    res.status(500).json({ success: false, message: (err as Error).message || 'Server error' });
  }
};

export const updateSettingsController = updateSettingController;
