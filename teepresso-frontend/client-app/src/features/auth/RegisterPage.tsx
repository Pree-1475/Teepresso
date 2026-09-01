import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/common/components/ui/Button/Button';
import { Input } from '@/common/components/ui/Input/Input';
import { User, Phone, Mail, Lock, UserPlus } from 'lucide-react';
import styles from './register.module.css';
import { API_BASE_URL } from '@/common/config/api';

export function RegisterPage() {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { setUserSession } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
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
        setErrorMsg(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error while creating account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        <div className={styles.registerCard}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Create an Account</h1>
            <p className={styles.desc}>Join Teepresso to save designs, manage bulk group orders, and track deliveries.</p>
          </div>

          {errorMsg && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', borderLeft: '4px solid #ef4444', padding: '12px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '20px', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}

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
              label="Phone Number *"
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
              placeholder="rahul@gmail.com"
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

            <Button variant="primary" size="lg" fullWidth type="submit" disabled={isLoading} leftIcon={<UserPlus size={18} />}>
              {isLoading ? 'Creating Account...' : 'Create Account & Sign In'}
            </Button>
          </form>

          <div className={styles.footerLinks}>
            Already have an account?{' '}
            <Link to="/login" className={styles.loginLink}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
