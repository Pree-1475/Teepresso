export interface AttendanceRecord {
  id: string;
  employeeName: string;
  role: 'Admin' | 'Manager' | 'Editing Team' | 'Dispatch Team';
  date: string;
  loginTime: string | null;
  logoutTime: string | null;
  status: 'Present' | 'Absent' | 'Late' | 'Active';
}

export const attendanceDatabase: AttendanceRecord[] = [
  {
    id: 'att_1',
    employeeName: 'Amit Shah',
    role: 'Manager',
    date: 'Aug 12, 2026',
    loginTime: '09:12 AM',
    logoutTime: '06:15 PM',
    status: 'Present'
  },
  {
    id: 'att_2',
    employeeName: 'Sunita Rao',
    role: 'Editing Team',
    date: 'Aug 12, 2026',
    loginTime: '09:45 AM',
    logoutTime: '06:30 PM',
    status: 'Late'
  },
  {
    id: 'att_3',
    employeeName: 'Vikram Seth',
    role: 'Dispatch Team',
    date: 'Aug 12, 2026',
    loginTime: '08:55 AM',
    logoutTime: '05:45 PM',
    status: 'Present'
  },
  {
    id: 'att_4',
    employeeName: 'Rajesh Kumar',
    role: 'Dispatch Team',
    date: 'Aug 12, 2026',
    loginTime: null,
    logoutTime: null,
    status: 'Absent'
  },
  // Active employees for today (Aug 13, 2026)
  {
    id: 'att_5',
    employeeName: 'Amit Shah',
    role: 'Manager',
    date: 'Aug 13, 2026',
    loginTime: '09:05 AM',
    logoutTime: null,
    status: 'Active'
  },
  {
    id: 'att_6',
    employeeName: 'Sunita Rao',
    role: 'Editing Team',
    date: 'Aug 13, 2026',
    loginTime: '09:30 AM',
    logoutTime: null,
    status: 'Active'
  }
];
