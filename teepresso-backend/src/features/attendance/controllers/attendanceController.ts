import { Request, Response } from 'express';
import { attendanceDatabase, AttendanceRecord } from '../models/attendanceModel.js';
import { saveDb } from '../../../config/jsonDb.js';

export const getAttendanceController = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    attendance: attendanceDatabase,
  });
};

export const checkInAttendanceController = (req: Request, res: Response): void => {
  const { employeeName, role } = req.body;
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Check if already checked in today
  const existingRecord = attendanceDatabase.find(
    r => r.employeeName === employeeName && r.date === dateStr && r.loginTime !== null
  );

  if (existingRecord) {
    res.status(400).json({ success: false, message: 'Already checked in today' });
    return;
  }

  // Determine if check-in is late (cutoff 09:15 AM)
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(9, 15, 0);
  const status = now > cutoff ? 'Late' : 'Active';

  const newRecord: AttendanceRecord = {
    id: `att_${Date.now()}`,
    employeeName,
    role,
    date: dateStr,
    loginTime: timeStr,
    logoutTime: null,
    status
  };

  attendanceDatabase.unshift(newRecord);
  saveDb();
  res.status(201).json({ success: true, message: 'Checked in successfully', record: newRecord });
};

export const checkOutAttendanceController = (req: Request, res: Response): void => {
  const { employeeName } = req.body;
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const record = attendanceDatabase.find(
    r => r.employeeName === employeeName && r.date === dateStr && r.logoutTime === null
  );

  if (!record) {
    res.status(404).json({ success: false, message: 'Active check-in record not found for today' });
    return;
  }

  record.logoutTime = timeStr;
  record.status = record.status === 'Late' ? 'Late' : 'Present';

  saveDb();
  res.json({ success: true, message: 'Checked out successfully', record });
};

