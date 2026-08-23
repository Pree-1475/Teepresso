import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { PackageCheck, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import styles from './track-order.module.css';

// Mock data for orders
const MOCK_ORDERS = [
  {
    id: 'TP-2026-8842',
    date: 'Aug 18, 2026',
    status: 'In Production',
    items: '50 Pcs (Classic Polo T-Shirt)',
    amount: '₹22,500'
  },
  {
    id: 'TP-2026-7110',
    date: 'Jul 02, 2026',
    status: 'Delivered',
    items: '120 Pcs (Premium Oversized Tee)',
    amount: '₹48,000'
  },
  {
    id: 'TP-2025-9921',
    date: 'Dec 14, 2025',
    status: 'Delivered',
    items: '30 Pcs (Winter Hoodie)',
    amount: '₹28,500'
  }
];

export function MyOrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div className={styles.heroHeader} style={{ textAlign: 'left', alignItems: 'flex-start' }}>
          <h1 className={styles.heroTitle} style={{ fontSize: '2rem' }}>
            My Orders
          </h1>
          <p className={styles.heroDesc} style={{ textAlign: 'left' }}>
            View and manage all your past and current Teepresso orders.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className={styles.searchCard} style={{ textAlign: 'center', padding: '48px 24px' }}>
            <PackageCheck size={48} color="#d1d5db" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ marginBottom: '8px', fontFamily: 'var(--font-heading)', color: '#1a1a1a' }}>Sign in to view orders</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '0.95rem' }}>You need to be logged into your Teepresso account to view your order history.</p>
            <Link to="/login">
              <Button variant="primary" size="md">Sign In / Register</Button>
            </Link>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #f3f4f6', borderTopColor: '#1a1a1a', borderRadius: '50%', margin: '0 auto' }}></div>
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading your orders...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {MOCK_ORDERS.map((order) => (
              <div key={order.id} className={styles.orderMetaCard} style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid #eaeaea' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a', fontFamily: 'var(--font-heading)' }}>{order.id}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>Placed on {order.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: order.status === 'Delivered' ? '#f0fdf4' : '#fffbeb', color: order.status === 'Delivered' ? '#166534' : '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {order.status === 'Delivered' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    {order.status}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px dashed #eaeaea' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 500 }}>{order.items}</div>
                    <div style={{ fontSize: '0.9rem', color: '#1a1a1a', fontWeight: 700, marginTop: '2px' }}>Total: {order.amount}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default MyOrdersPage;
