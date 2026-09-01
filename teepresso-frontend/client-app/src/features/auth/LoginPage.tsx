import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/common/components/ui/Button/Button';
import { Input } from '@/common/components/ui/Input/Input';
import { Mail, Lock, User, Phone, LogIn, UserPlus } from 'lucide-react';
import styles from './login.module.css';
import { API_BASE_URL } from '@/common/config/api';

export function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { setUserSession } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: email.trim(), password })
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUserSession({
          id: data.user.id,
          name: data.user.name || 'Customer',
          email: data.user.email || email,
          phone: data.user.phone || '',
          role: data.user.role || 'customer'
        });
        navigate('/my-orders');
      } else {
        setErrorMsg(data.message || 'Invalid email or password credentials');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setErrorMsg('Network error. Could not connect to authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg('Please fill in all required registration fields.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), password })
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUserSession({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          role: 'customer'
        });
        navigate('/my-orders');
      } else {
        setErrorMsg(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Register Error:', err);
      setErrorMsg('Network error while registering account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        <div className={styles.loginCard}>
          
          {/* Header Text */}
          <div className={styles.headerText}>
            <h1 className={styles.title}>{isRegister ? 'Create Customer Account' : 'Customer Sign In'}</h1>
            <p className={styles.desc}>
              {isRegister 
                ? 'Register your organization or squad account to place bulk orders.'
                : 'Sign in to view your orders, proof digital mockups, and track deliveries.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px', backgroundColor: 'var(--color-neutral-100)', padding: '4px', borderRadius: 'var(--radius-lg)' }}>
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMsg(''); }}
              style={{
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: !isRegister ? '#ffffff' : 'transparent',
                color: !isRegister ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                boxShadow: !isRegister ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMsg(''); }}
              style={{
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: isRegister ? '#ffffff' : 'transparent',
                color: isRegister ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                boxShadow: isRegister ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              New Account
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', borderLeft: '4px solid #ef4444', padding: '12px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '20px', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}

          {!isRegister ? (
            /* Sign In Form */
            <form onSubmit={handleLogin} className={styles.form}>
              <Input
                label="Email Address *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@gmail.com"
                leftIcon={<Mail size={18} color="var(--color-primary-600)" />}
                required
                autoFocus
              />

              <Input
                label="Password *"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock size={18} color="var(--color-primary-600)" />}
                required
              />

              <Button variant="primary" size="lg" fullWidth type="submit" disabled={isLoading} leftIcon={<LogIn size={18} />}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className={styles.form}>
              <Input
                label="Full Name *"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                leftIcon={<User size={18} color="var(--color-primary-600)" />}
                required
              />

              <Input
                label="Email Address *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@gmail.com"
                leftIcon={<Mail size={18} color="var(--color-primary-600)" />}
                required
              />

              <Input
                label="Phone Number *"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                leftIcon={<Phone size={18} color="var(--color-primary-600)" />}
                required
              />

              <Input
                label="Create Password *"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock size={18} color="var(--color-primary-600)" />}
                required
              />

              <Button variant="primary" size="lg" fullWidth type="submit" disabled={isLoading} leftIcon={<UserPlus size={18} />}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          )}

          <div className={styles.footerLinks}>
            Protected by Teepresso Customer Security Architecture.
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
