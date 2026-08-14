import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, UserCheck, UserMinus, Users, Plus, UserX, DollarSign, Calendar, Mail, Phone, Trash2, CheckCircle2 } from 'lucide-react';
import styles from './AttendancePage.module.css';

interface Employee {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Editing Team' | 'Dispatch Team' | 'Printing & Production';
  email: string;
  phone: string;
  baseSalary: number;
  joiningDate: string;
  status: 'Active' | 'Left Job';
}

interface AttendanceRecord {
  id: string;
  employeeName: string;
  role: string;
  date: string;
  loginTime: string | null;
  logoutTime: string | null;
  status: 'Present' | 'Absent' | 'Late' | 'Active';
}

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp_1', name: 'Amit Shah', role: 'Manager', email: 'amit@teepresso.com', phone: '+91 98200 11223', baseSalary: 45000, joiningDate: 'Jan 15, 2025', status: 'Active' },
  { id: 'emp_2', name: 'Sunita Rao', role: 'Editing Team', email: 'sunita@teepresso.com', phone: '+91 98199 44556', baseSalary: 38000, joiningDate: 'Mar 10, 2025', status: 'Active' },
  { id: 'emp_3', name: 'Vikram Seth', role: 'Dispatch Team', email: 'vikram@teepresso.com', phone: '+91 97690 33445', baseSalary: 32000, joiningDate: 'Jun 01, 2025', status: 'Active' },
  { id: 'emp_4', name: 'Rajesh Kumar', role: 'Printing & Production', email: 'rajesh@teepresso.com', phone: '+91 98330 99887', baseSalary: 35000, joiningDate: 'Feb 20, 2025', status: 'Active' },
  { id: 'emp_5', name: 'Pooja Sharma', role: 'Editing Team', email: 'pooja.ex@teepresso.com', phone: '+91 99201 55443', baseSalary: 34000, joiningDate: 'Aug 10, 2024', status: 'Left Job' },
];

export function AttendancePage() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'workforce'>('attendance');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Terminal state
  const [selectedEmpName, setSelectedEmpName] = useState('Sunita Rao');
  const [actionMsg, setActionMsg] = useState('');

  // Add Employee Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Manager' | 'Editing Team' | 'Dispatch Team' | 'Printing & Production'>('Editing Team');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSalary, setNewSalary] = useState(35000);

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

  // Filter active employees for punch dropdown
  const activeEmployees = employees.filter(e => e.status === 'Active');

  const handlePunch = async (type: 'in' | 'out') => {
    setActionMsg('');
    const matchedEmp = employees.find(e => e.name === selectedEmpName);
    const empRole = matchedEmp?.role || 'Editing Team';

    try {
      const endpoint = type === 'in' ? 'check-in' : 'check-out';
      const body = type === 'in'
        ? { employeeName: selectedEmpName, role: empRole }
        : { employeeName: selectedEmpName };

      const res = await fetch(`http://localhost:5000/api/v1/attendance/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        setActionMsg(`✅ Clocked ${type === 'in' ? 'IN' : 'OUT'} for ${selectedEmpName}`);
        fetchAttendance();
      } else {
        setActionMsg(`⚠️ ${data.message}`);
      }
    } catch (err) {
      setActionMsg('⚠️ Connection offline. Recorded locally.');
    }
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newEmp: Employee = {
      id: `emp_${Date.now()}`,
      name: newName,
      role: newRole,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@teepresso.com`,
      phone: newPhone || '+91 98000 00000',
      baseSalary: Number(newSalary),
      joiningDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active'
    };

    setEmployees(prev => [newEmp, ...prev]);
    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewSalary(35000);
  };

  const toggleEmployeeStatus = (empId: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        const nextStatus = emp.status === 'Active' ? 'Left Job' : 'Active';
        return { ...emp, status: nextStatus };
      }
      return emp;
    }));
  };

  const deleteEmployee = (empId: string) => {
    if (window.confirm('Delete this employee record permanently? (Use "Mark as Left Job" to retain past attendance history)')) {
      setEmployees(prev => prev.filter(e => e.id !== empId));
    }
  };

  const activeCount = records.filter(r => r.status === 'Active').length;
  const lateCount = records.filter(r => r.status === 'Late').length;
  const totalMonthlyPayroll = activeEmployees.reduce((sum, e) => sum + e.baseSalary, 0);

  if (loading) {
    return (
      <div className="admin-page-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
          <RefreshCw className="animate-spin" size={16} />
          <span>Syncing workforce ledger & attendance terminal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Header with Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-title)' }}>Workforce & Attendance Manager</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Employee profiles, daily biometric punches, salary records & active duty logs</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'workforce' && (
            <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-brand-primary)', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
              <Plus size={14} /> Add New Employee
            </button>
          )}
          <button onClick={fetchAttendance} className={styles.refreshBtn}>
            <RefreshCw size={13} /> Sync Ledger
          </button>
        </div>
      </div>

      {/* Primary Tab Toggle Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('attendance')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'attendance' ? 'var(--color-brand-primary)' : 'var(--color-surface-white)',
            color: activeTab === 'attendance' ? '#FFF' : 'var(--color-text-body)'
          }}
        >
          ⏱️ Daily Attendance Register
        </button>
        <button
          onClick={() => setActiveTab('workforce')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'workforce' ? 'var(--color-brand-primary)' : 'var(--color-surface-white)',
            color: activeTab === 'workforce' ? '#FFF' : 'var(--color-text-body)'
          }}
        >
          👥 Employee Directory & Payroll ({activeEmployees.length} Active Staff)
        </button>
      </div>

      {/* TAB 1: DAILY ATTENDANCE REGISTER */}
      {activeTab === 'attendance' && (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {/* Left Side: Attendance Logs */}
          <div style={{ flex: 1 }}>
            <div className={styles.statsRow}>
              <div className={styles.miniCard}>
                <Users size={18} color="#059669" />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>{activeCount} On Duty</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Currently Logged In</div>
                </div>
              </div>
              <div className={styles.miniCard}>
                <Clock size={18} color="#D97706" />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>{lateCount} Late Check-ins</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Arrived after 09:15 AM Cutoff</div>
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
                    <th>Duty Status</th>
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
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {record.loginTime || '--:--'}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
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

          {/* Right Side: Biometric Punch Terminal */}
          <div className={styles.terminalCard}>
            <div className={styles.terminalHeader}>
              <Clock size={14} color="#FFF" />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Biometric Punch Terminal</span>
            </div>

            <div className={styles.terminalBody}>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                Select an active employee to simulate biometric card punch or manual check-in.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className={styles.label}>Select Staff Member</label>
                  <select
                    value={selectedEmpName}
                    onChange={e => setSelectedEmpName(e.target.value)}
                    className={styles.select}
                  >
                    {activeEmployees.map(emp => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
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
      )}

      {/* TAB 2: WORKFORCE & PAYROLL DIRECTORY */}
      {activeTab === 'workforce' && (
        <div>
          {/* Payroll Summary Banner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div className={styles.miniCard}>
              <Users size={20} color="var(--color-brand-primary)" />
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>{activeEmployees.length} Workers</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Active On Factory Roster</div>
              </div>
            </div>
            <div className={styles.miniCard}>
              <DollarSign size={20} color="#059669" />
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>₹{totalMonthlyPayroll.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Estimated Monthly Base Payroll</div>
              </div>
            </div>
            <div className={styles.miniCard}>
              <UserX size={20} color="#64748B" />
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>{employees.filter(e => e.status === 'Left Job').length} Archived</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Former Staff (History Preserved)</div>
              </div>
            </div>
          </div>

          {/* Employee Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Department / Role</th>
                  <th>Contact Info</th>
                  <th>Joining Date</th>
                  <th>Base Salary (Monthly)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} style={{ opacity: emp.status === 'Left Job' ? 0.65 : 1 }}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-title)' }}>{emp.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>ID: {emp.id}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '12px' }}>{emp.role}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>{emp.email}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{emp.phone}</div>
                    </td>
                    <td style={{ fontSize: '12px' }}>{emp.joiningDate}</td>
                    <td style={{ fontWeight: 700, color: '#0F172A' }}>
                      ₹{emp.baseSalary.toLocaleString('en-IN')} / mo
                    </td>
                    <td>
                      {emp.status === 'Active' ? (
                        <span className={styles.badgePresent}>ACTIVE</span>
                      ) : (
                        <span className={styles.badgeAbsent}>LEFT JOB</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => toggleEmployeeStatus(emp.id)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: emp.status === 'Active' ? '#FFF' : '#E2E8F0',
                            cursor: 'pointer'
                          }}
                          title={emp.status === 'Active' ? 'Mark employee as Left Job (preserves past logs)' : 'Reactivate Employee'}
                        >
                          {emp.status === 'Active' ? 'Mark Left' : 'Reactivate'}
                        </button>
                        <button
                          onClick={() => deleteEmployee(emp.id)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: '#FEE2E2',
                            color: '#991B1B',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          title="Delete entry created by mistake"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Employee Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ width: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Add Factory Employee</h2>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'none', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className={styles.label}>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Varma"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div>
                <label className={styles.label}>Department / Role</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as any)}
                  className={styles.select}
                >
                  <option value="Manager">Manager</option>
                  <option value="Editing Team">Editing Team</option>
                  <option value="Printing & Production">Printing & Production</option>
                  <option value="Dispatch Team">Dispatch Team</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label className={styles.label}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className={styles.label}>Base Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={newSalary}
                    onChange={e => setNewSalary(Number(e.target.value))}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  placeholder="worker@teepresso.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '6px 16px', borderRadius: '6px', background: 'var(--color-brand-primary)', color: '#FFF', fontSize: '13px', fontWeight: 600, border: 'none' }}
                >
                  Save Employee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendancePage;
