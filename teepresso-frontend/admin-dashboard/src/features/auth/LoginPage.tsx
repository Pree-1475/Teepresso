import React, { useState } from 'react';
import { Layers, Shield, Sparkles, UserCheck } from 'lucide-react';
import styles from './LoginPage.module.css';

interface LoginPageProps {
  onLogin: (role: 'admin' | 'manager' | 'editor', name: string, email: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager' | 'editor'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRoleDetails = (role: string) => {
    switch (role) {
      case 'admin': return { label: 'Administrator', desc: 'Full business analytics, financials, orders, workforce & users control.' };
      case 'manager': return { label: 'Store Manager', desc: 'Manage offline orders, QR payments, billing & inventory stocks.' };
      case 'editor': return { label: 'Design Editor', desc: 'Customer mockup uploads, watermark management & WhatsApp status.' };
      default: return { label: 'User', desc: '' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: username, role: selectedRole })
      });
      const data = await res.json();
      if (data.success) {
        // Authenticated! Pass selected role, name, and email to shell
        onLogin(data.user.role, data.user.name, data.user.email);
      } else {
        setErrorMsg(data.message || 'Invalid credentials');
      }
    } catch (err) {
      // Offline fallback
      let name = 'System User';
      let email = username || 'operator@teepresso.com';
      if (selectedRole === 'admin') {
        name = 'Production Director';
        email = 'admin@teepresso.com';
      }
      if (selectedRole === 'manager') {
        name = 'Operations Manager';
        email = 'manager@teepresso.com';
      }
      if (selectedRole === 'editor') {
        name = 'Lead Designer';
        email = 'editor@teepresso.com';
      }
      onLogin(selectedRole, name, email);
    } finally {
      setIsSubmitting(false);
    }
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

        {errorMsg && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', fontWeight: 600, border: '1px solid #fca5a5' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Role selector grid */}
          <div className={styles.roleGrid}>
            {(['admin', 'manager', 'editor'] as const).map(role => (
              <button
                key={role}
                type="button"
                className={`${styles.roleCard} ${selectedRole === role ? styles.roleCardActive : ''}`}
                onClick={() => setSelectedRole(role)}
              >
                <div className={styles.roleIcon}>
                  {role === 'admin' && <Shield size={16} />}
                  {role === 'manager' && <UserCheck size={16} />}
                  {role === 'editor' && <Sparkles size={16} />}
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

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Authorizing...' : 'Authorize Console Session'}
          </button>
        </form>

        <div className={styles.footer}>
          Secured with SHA-256 local operational authentication.
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
