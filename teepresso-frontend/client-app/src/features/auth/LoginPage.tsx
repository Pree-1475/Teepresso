import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/features/auth/context/AuthContext';
import { Button } from '@/common/components/ui/Button/Button';
import { Input } from '@/common/components/ui/Input/Input';
import { Phone, KeyRound, LogIn, Lock } from 'lucide-react';
import styles from './login.module.css';
import { API_BASE_URL } from '@/common/config/api';


export function LoginPage() {
  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    setIsLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 800);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      alert("Please enter a valid OTP");
      return;
    }
    setIsLoading(true);
    try {
      await fetch(`${API_BASE_URL}/auth/otp-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
    } catch (err) {
      console.error('Failed to sync OTP login to backend:', err);
    } finally {
      setIsLoading(false);
      login(phone, 'customer');
      navigate('/my-orders');
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    login('9876543210', role);
    navigate('/my-orders');
  };

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        <div className={styles.loginCard}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.desc}>Sign in to track orders, manage mockups, and build custom group apparel.</p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className={styles.form}>
              <Input
                label="Phone Number *"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="e.g. 9876543210"
                leftIcon={<Phone size={18} color="var(--color-primary-600)" />}
                required
                maxLength={10}
              />

              <Button variant="primary" size="lg" fullWidth type="submit" disabled={isLoading} leftIcon={<KeyRound size={18} />}>
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className={styles.form}>
              <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>{phone}</span>
                <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.8rem', textDecoration: 'underline' }}>
                  Change
                </button>
              </div>
              <Input
                label="Enter OTP *"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                leftIcon={<Lock size={18} color="var(--color-primary-600)" />}
                required
                maxLength={6}
              />

              <Button variant="primary" size="lg" fullWidth type="submit" disabled={isLoading} leftIcon={<LogIn size={18} />}>
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>
            </form>
          )}

          {/* Quick Demo Credentials */}
          <div className={styles.demoBox}>
            <div className={styles.demoTitle}>✨ Quick Demo Account Login</div>
            <div className={styles.demoGrid}>
              <button className={styles.demoBtn} onClick={() => handleDemoLogin('customer')}>
                Customer Demo
              </button>
              <button className={styles.demoBtn} onClick={() => handleDemoLogin('manager')}>
                Manager Demo
              </button>
              <button className={styles.demoBtn} onClick={() => handleDemoLogin('editing_team')}>
                Editing Team Demo
              </button>
              <button className={styles.demoBtn} onClick={() => handleDemoLogin('admin')}>
                Admin Demo
              </button>
            </div>
          </div>

          {/* Register link removed because OTP handles both login and register */}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
