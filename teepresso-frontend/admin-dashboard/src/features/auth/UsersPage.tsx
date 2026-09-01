import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Trash2, Edit2, ShieldAlert, X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'editor' | 'customer';
  password?: string;
  createdAt: string;
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'editor'>('editor');
  const [password, setPassword] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Get current user role
  const storedUser = localStorage.getItem('teepresso_user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = currentUser?.role === 'admin';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users.filter((u: any) => u.role !== 'customer'));
      }
    } catch (err) {
      console.error('Failed to fetch staff users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: 'var(--color-status-danger-bg)',
        border: '1px solid var(--color-status-danger)',
        borderRadius: '8px',
        margin: '40px auto',
        maxWidth: '500px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <ShieldAlert size={48} color="var(--color-status-danger)" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ color: 'var(--color-status-danger)', marginBottom: '12px' }}>Access Denied</h2>
        <p style={{ color: 'var(--color-text-body)', fontWeight: 500 }}>Only administrators can access the User Roles & Staff Management Console.</p>
      </div>
    );
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password, phone: '0000000000' }) // Default phone backend fallback
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => [...prev, data.user]);
        setShowAddModal(false);
        setName('');
        setEmail('');
        setPassword('');
        setRole('editor');
      } else {
        setErrorMsg(data.message || 'Failed to create user');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role as any);
    setPassword(user.password || '');
    setErrorMsg('');
    setShowEditModal(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`http://localhost:5000/api/v1/auth/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? data.user : u));
        setShowEditModal(false);
        setEditingUser(null);
        setName('');
        setEmail('');
        setPassword('');
        setRole('editor');
      } else {
        setErrorMsg(data.message || 'Failed to update user');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to revoke staff access for this user?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/auth/users/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  return (
    <div style={{ padding: '32px', minHeight: '100vh', background: 'var(--color-canvas-bg)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0, color: 'var(--color-text-title)' }}>Manage Users</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)', fontSize: '13px' }}>Add, remove, edit and manage authorization levels for Teepresso workers.</p>
        </div>
        <button
          onClick={() => {
            setName('');
            setEmail('');
            setPassword('');
            setRole('editor');
            setErrorMsg('');
            setShowAddModal(true);
          }}
          style={{
            background: 'var(--color-primary)',
            color: '#FFFFFF',
            border: 'none',
            padding: '8px 16px',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Plus size={16} />
          Add Staff Member
        </button>
      </div>

      {/* Users List */}
      {loading ? (
        <div style={{ color: 'var(--color-text-body)' }}>Loading staff directory...</div>
      ) : (
        <div className="erp-table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Password</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600 }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      fontSize: '11px',
                      background: user.role === 'admin' ? 'var(--color-status-danger-bg)' : user.role === 'manager' ? 'var(--color-status-warning-bg)' : 'var(--color-status-info-bg)',
                      color: user.role === 'admin' ? 'var(--color-status-danger)' : user.role === 'manager' ? 'var(--color-status-warning)' : 'var(--color-status-info)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--color-border)'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td className="text-mono" style={{ color: 'var(--color-text-muted)' }}>{user.password || '••••••••'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '12px' }}>
                      <button
                        onClick={() => handleOpenEdit(user)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-primary)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title="Edit User details"
                      >
                        <Edit2 size={16} />
                      </button>

                      {user.email !== currentUser.email ? (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-status-danger)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Delete Operator"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', padding: '0 4px', fontStyle: 'italic' }}>
                          Self
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div style={{
            background: 'var(--color-surface-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            width: '90%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            color: 'var(--color-text-title)'
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowAddModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Add New Operator</h2>

            {errorMsg && (
              <div style={{ background: 'var(--color-status-danger-bg)', color: 'var(--color-status-danger)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '16px', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 600 }}>Full Name *</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-canvas-bg)', color: 'var(--color-text-title)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 600 }}>Email Address *</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-canvas-bg)', color: 'var(--color-text-title)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 600 }}>Operational Role *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-canvas-bg)', color: 'var(--color-text-title)', fontWeight: 600 }}
                >
                  <option value="editor">Editor (Mockup proofing & approvals)</option>
                  <option value="manager">Manager (Offline orders & stocks)</option>
                  <option value="admin">Admin (Full operations & staff control)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 600 }}>Password *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. securePass123"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-canvas-bg)', color: 'var(--color-text-title)' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: 'var(--color-primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  marginTop: '8px'
                }}
              >
                {submitting ? 'Creating...' : 'Authorize Operator'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => { setShowEditModal(false); setEditingUser(null); }}>
          <div style={{
            background: 'var(--color-surface-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            width: '90%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            color: 'var(--color-text-title)'
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setShowEditModal(false); setEditingUser(null); }}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Edit Operator: {editingUser.name}</h2>

            {errorMsg && (
              <div style={{ background: 'var(--color-status-danger-bg)', color: 'var(--color-status-danger)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '16px', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleEditUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 600 }}>Full Name *</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-canvas-bg)', color: 'var(--color-text-title)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 600 }}>Email Address *</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-canvas-bg)', color: 'var(--color-text-title)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 600 }}>Operational Role *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-canvas-bg)', color: 'var(--color-text-title)', fontWeight: 600 }}
                  disabled={editingUser.email === currentUser.email} // Disable role edits for self to prevent locking out admin
                >
                  <option value="editor">Editor (Mockup proofing & approvals)</option>
                  <option value="manager">Manager (Offline orders & stocks)</option>
                  <option value="admin">Admin (Full operations & staff control)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 600 }}>Password *</label>
                <input
                  required
                  type="text"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-canvas-bg)', color: 'var(--color-text-title)' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: 'var(--color-primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  marginTop: '8px'
                }}
              >
                {submitting ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
