import { Request, Response } from 'express';
import { sql } from '../../../config/db.js';

export const getAttendanceController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const records = await sql`SELECT * FROM attendance ORDER BY "createdAt" DESC`;
    res.json({ success: true, records });
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ success: false, message: 'Server error fetching attendance' });
  }
};

export const markAttendanceController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffName, role, date, status, checkIn, checkOut, notes } = req.body;
    if (!staffName || !status) {
      res.status(400).json({ success: false, message: 'Staff name and status are required' });
      return;
    }

    const id = `att_${Date.now()}`;
    const recordDate = date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    await sql`
      INSERT INTO attendance (
        id, "staffName", role, date, status, "checkIn", "checkOut", notes
      ) VALUES (
        ${id}, ${staffName}, ${role || 'Staff'}, ${recordDate}, ${status},
        ${checkIn || '09:00 AM'}, ${checkOut || '06:00 PM'}, ${notes || ''}
      )
    `;

    const newRecord = { id, staffName, role: role || 'Staff', date: recordDate, status, checkIn, checkOut, notes };
    res.status(201).json({ success: true, record: newRecord });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ success: false, message: (err as Error).message || 'Server error' });
  }
};

export const checkInAttendanceController = async (req: Request, res: Response): Promise<void> => {
  return markAttendanceController(req, res);
};

export const checkOutAttendanceController = async (req: Request, res: Response): Promise<void> => {
  return markAttendanceController(req, res);
};
