'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { User, Phone, Mail, Lock, UserPlus } from 'lucide-react';
import styles from './register.module.css';

export default function RegisterPage() {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register(name, email, phone);
    router.push('/track-order');
  };

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        <div className={styles.registerCard}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Create an Account</h1>
            <p className={styles.desc}>Join Teepresso to save designs, manage bulk group orders, and track deliveries.</p>
          </div>

          <form onSubmit={handleRegister} className={styles.form}>
            <Input
              label="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              leftIcon={<User size={18} color="var(--color-primary-600)" />}
              required
            />

            <Input
              label="Phone / WhatsApp Number *"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              leftIcon={<Phone size={18} color="var(--color-primary-600)" />}
              required
            />

            <Input
              label="Email Address *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              leftIcon={<Mail size={18} color="var(--color-primary-600)" />}
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

            <Button variant="primary" size="lg" fullWidth type="submit" leftIcon={<UserPlus size={18} />}>
              Create Account & Sign In
            </Button>
          </form>

          <div className={styles.footerLinks}>
            Already have an account?{' '}
            <Link href="/login" className={styles.loginLink}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
