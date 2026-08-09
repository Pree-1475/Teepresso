'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { User, Lock, LogIn, Sparkles } from 'lucide-react';
import styles from './login.module.css';

export default function LoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState<string>('9876543210');
  const [password, setPassword] = useState<string>('password123');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(emailOrPhone, 'customer');
    router.push('/track-order');
  };

  const handleDemoLogin = (role: UserRole) => {
    login('demo@teepresso.com', role);
    router.push('/track-order');
  };

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        <div className={styles.loginCard}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.desc}>Sign in to track orders, manage mockups, and build custom group apparel.</p>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            <Input
              label="Phone Number or Email *"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="e.g. 9876543210 or name@domain.com"
              leftIcon={<User size={18} color="var(--color-primary-600)" />}
              required
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

            <Button variant="primary" size="lg" fullWidth type="submit" leftIcon={<LogIn size={18} />}>
              Sign In to Teepresso
            </Button>
          </form>

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

          <div className={styles.footerLinks}>
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className={styles.registerLink}>
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
