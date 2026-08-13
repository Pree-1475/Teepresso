import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, UserCheck, UserMinus, Users } from 'lucide-react';
import styles from './AttendancePage.module.css';

interface AttendanceRecord {
  id: string;
  employeeName: string;
  role: 'Admin' | 'Manager' | 'Editing Team' | 'Dispatch Team';
  date: string;
  loginTime: string | null;
  logoutTime: string | null;
  status: 'Present' | 'Absent' | 'Late' | 'Active';
}

export function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [empName, setEmpName] = useState('Sunita Rao');
  const [empRole, setEmpRole] = useState<'Admin' | 'Manager' | 'Editing Team' | 'Dispatch Team'>('Editing Team');
  const [actionMsg, setActionMsg] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/attendance');
      const data = await res.json();
      if (data.success) {
        setRecords(data.attendance);
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handlePunch = async (type: 'in' | 'out') => {
    setActionMsg('');
    try {
      const endpoint = type === 'in' ? 'check-in' : 'check-out';
      const body = type === 'in'
        ? { employeeName: empName, role: empRole }
        : { employeeName: empName };

      const res = await fetch(`http://localhost:5000/api/v1/attendance/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        setActionMsg(`Successfully clocked ${type === 'in' ? 'IN' : 'OUT'}!`);
        fetchAttendance();
      } else {
        setActionMsg(`⚠️ ${data.message}`);
      }
    } catch (err) {
      setActionMsg('⚠️ Failed to connect to server');
    }
  };

  if (loading) {
    return (
      <div className="admin-page-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
          <RefreshCw className="animate-spin" size={16} />
          <span>Syncing attendance ledger...</span>
        </div>
      </div>
    );
  }

  // Calculate active counts
  const activeCount = records.filter(r => r.status === 'Active').length;
  const lateCount = records.filter(r => r.status === 'Late').length;

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-title)' }}>Attendance Register</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Daily operations login/logout sheets, punch logs & status compliance</p>
        </div>
        <button onClick={fetchAttendance} className={styles.refreshBtn}>
          <RefreshCw size={13} /> Sync Register
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Left Side: Attendance Sheet List */}
        <div style={{ flex: 1 }}>
          <div className={styles.statsRow}>
            <div className={styles.miniCard}>
              <Users size={16} color="var(--color-text-muted)" />
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{activeCount} Active</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>On-Duty Right Now</div>
              </div>
            </div>
            <div className={styles.miniCard}>
              <Clock size={16} color="var(--color-text-muted)" />
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{lateCount} Late</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Checked in after 09:15 AM</div>
              </div>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Department / Role</th>
                  <th>Date</th>
                  <th>Login Time</th>
                  <th>Logout Time</th>
                  <th>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-title)' }}>{record.employeeName}</div>
                    </td>
                    <td>{record.role}</td>
                    <td>{record.date}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                      {record.loginTime || '--:--'}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                      {record.logoutTime || '--:--'}
                    </td>
                    <td>
                      {record.status === 'Active' && (
                        <span className={styles.badgeActive}>ACTIVE ON-DUTY</span>
                      )}
                      {record.status === 'Present' && (
                        <span className={styles.badgePresent}>ON-TIME PRESENT</span>
                      )}
                      {record.status === 'Late' && (
                        <span className={styles.badgeLate}>LATE CHECKIN</span>
                      )}
                      {record.status === 'Absent' && (
                        <span className={styles.badgeAbsent}>ABSENT</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Check-in Simulator Terminal */}
        <div className={styles.terminalCard}>
          <div className={styles.terminalHeader}>
            <Clock size={14} color="#FFF" />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Biometric Attendance Terminal</span>
          </div>

          <div className={styles.terminalBody}>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              Simulate manual card swipes or biometric logging for team operations check-in.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label className={styles.label}>Select Employee Name</label>
                <select
                  value={empName}
                  onChange={e => {
                    setEmpName(e.target.value);
                    // Autofill role
                    if (e.target.value === 'Amit Shah') setEmpRole('Manager');
                    if (e.target.value === 'Sunita Rao') setEmpRole('Editing Team');
                    if (e.target.value === 'Vikram Seth' || e.target.value === 'Rajesh Kumar') setEmpRole('Dispatch Team');
                  }}
                  className={styles.select}
                >
                  <option value="Amit Shah">Amit Shah (Manager)</option>
                  <option value="Sunita Rao">Sunita Rao (Editing Team)</option>
                  <option value="Vikram Seth">Vikram Seth (Dispatch Team)</option>
                  <option value="Rajesh Kumar">Rajesh Kumar (Dispatch Team)</option>
                </select>
              </div>

              <div>
                <label className={styles.label}>Assigned Department</label>
                <input
                  type="text"
                  value={empRole}
                  className={styles.input}
                  disabled
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => handlePunch('in')}
                  className={styles.inBtn}
                >
                  <UserCheck size={14} /> Punch In
                </button>
                <button
                  type="button"
                  onClick={() => handlePunch('out')}
                  className={styles.outBtn}
                >
                  <UserMinus size={14} /> Punch Out
                </button>
              </div>

              {actionMsg && (
                <div className={styles.terminalLog}>
                  {actionMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AttendancePage;
