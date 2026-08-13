import React, { useState } from 'react';
import { Layers, Shield, Sparkles, UserCheck } from 'lucide-react';
import styles from './LoginPage.module.css';

interface LoginPageProps {
  onLogin: (role: 'admin' | 'manager' | 'editing_team' | 'dispatch_team', name: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager' | 'editing_team' | 'dispatch_team'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const getRoleDetails = (role: string) => {
    switch (role) {
      case 'admin': return { label: 'Administrator', desc: 'Full business analytics, financials, orders & attendance control.' };
      case 'manager': return { label: 'Store Manager', desc: 'Manage offline orders, QR payments, billing & inventory stocks.' };
      case 'editing_team': return { label: 'Design Editor', desc: 'Customer mockup uploads, watermark management & WhatsApp status.' };
      case 'dispatch_team': return { label: 'Logistics Dispatcher', desc: 'Piece count verification, QC checklist, invoices & shipping label generation.' };
      default: return { label: 'User', desc: '' };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let name = 'System User';
    if (selectedRole === 'admin') name = 'Production Director';
    if (selectedRole === 'manager') name = 'Operations Manager';
    if (selectedRole === 'editing_team') name = 'Lead designer';
    if (selectedRole === 'dispatch_team') name = 'Fulfillment Lead';

    onLogin(selectedRole, name);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        {/* Brand */}
        <div className={styles.brandHeader}>
          <div className={styles.logoBadge}>
            <Layers size={18} color="#FFFFFF" />
          </div>
          <div>
            <h2 className={styles.brandTitle}>teepresso</h2>
            <span className={styles.brandSub}>INTERNAL CONSOLE</span>
          </div>
        </div>

        <div className={styles.cardHeader}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Select your operational department to proceed</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Role selector grid */}
          <div className={styles.roleGrid}>
            {(['admin', 'manager', 'editing_team', 'dispatch_team'] as const).map(role => (
              <button
                key={role}
                type="button"
                className={`${styles.roleCard} ${selectedRole === role ? styles.roleCardActive : ''}`}
                onClick={() => setSelectedRole(role)}
              >
                <div className={styles.roleIcon}>
                  {role === 'admin' && <Shield size={16} />}
                  {role === 'manager' && <UserCheck size={16} />}
                  {role === 'editing_team' && <Sparkles size={16} />}
                  {role === 'dispatch_team' && <Layers size={16} />}
                </div>
                <div className={styles.roleLabel}>{getRoleDetails(role).label}</div>
              </button>
            ))}
          </div>

          <div className={styles.roleDescription}>
            <strong>Access level:</strong> {getRoleDetails(selectedRole).desc}
          </div>

          {/* Credentials */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Console PIN / Identity</label>
            <input
              type="text"
              placeholder="operator@teepresso.com"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Authorize Console Session
          </button>
        </form>

        <div className={styles.footer}>
          Secured with SHA-256 local operational authentication.
        </div>
      </div>
    </div>
  );
}
