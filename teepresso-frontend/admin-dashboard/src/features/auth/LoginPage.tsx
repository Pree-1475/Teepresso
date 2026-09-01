import React, { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import styles from './LoginPage.module.css';
import { API_BASE_URL } from '@/common/config/api';

interface LoginPageProps {
  onLogin: (role: 'admin' | 'manager' | 'editor', name: string, email: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: email, password })
      });
      const data = await res.json();
      
      if (data.success && data.user) {
        // Authenticated! Pass selected role, name, and email to shell
        // Any user logged into admin gets verified here. Only specific roles are allowed.
        const allowedRoles = ['admin', 'manager', 'editor'];
        if (allowedRoles.includes(data.user.role)) {
          onLogin(data.user.role, data.user.name, data.user.email);
        } else {
          setErrorMsg("You do not have administrative privileges.");
        }
      } else {
        setErrorMsg(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error("Login Error:", err);
      setErrorMsg("Network error. Could not connect to authentication server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wagtailContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <LayoutDashboard size={40} color="#007d7e" strokeWidth={1.5} />
          </div>
          <h1 className={styles.title}>Teepresso Admin</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errorMsg && (
            <div className={styles.errorMsg}>
              {errorMsg}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="operator@teepresso.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.input}
              required
              autoFocus
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
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className={styles.footer}>
          Secure Operations Console
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
