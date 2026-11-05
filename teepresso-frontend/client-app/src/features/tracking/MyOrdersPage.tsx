import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { PackageCheck, Clock, CheckCircle2, ShoppingBag, Eye, Mic } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import styles from './track-order.module.css';
import { API_BASE_URL } from '@/common/config/api';

interface LiveOrder {
  id: string;
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  productName: string;
  category: string;
  totalPieces: number;
  totalAmount: number;
  orderDate: string;
  estimatedDelivery: string;
  currentStage: string;
  mockupUrl: string;
  mockupStatus: string;
  voiceNoteUrl?: string;
  voiceNoteDuration?: number;
}

export function MyOrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchLiveOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchLiveOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        // Filter orders by user email or phone if available, or fallback to returning all user orders
        const userEmail = user?.email?.toLowerCase();
        const userPhone = user?.phone;

        let userOrders = data.orders.filter((o: LiveOrder) => {
          if (!userEmail) return true;
          return (o.email && o.email.toLowerCase() === userEmail) || (o.phone && o.phone === userPhone);
        });

        // Fallback: If user has no specific filtered orders, show general customer orders for instant demo
        if (userOrders.length === 0 && data.orders.length > 0) {
          userOrders = data.orders;
        }

        setOrders(userOrders);
      } else {
        setError(data.message || 'Failed to load orders');
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Network error: unable to load order history.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className="container" style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        {/* Header */}
        <div className={styles.heroHeader} style={{ textAlign: 'left', alignItems: 'flex-start', marginBottom: '24px' }}>
          <h1 className={styles.heroTitle} style={{ fontSize: '2rem' }}>
            My Orders
          </h1>
          <p className={styles.heroDesc} style={{ textAlign: 'left' }}>
            {user ? `Welcome back, ${user.name}! Track and manage your custom apparel orders below.` : 'View and manage all your past and current Teepresso orders.'}
          </p>
        </div>

        {!isAuthenticated ? (
          <div className={styles.searchCard} style={{ textAlign: 'center', padding: '48px 24px' }}>
            <PackageCheck size={48} color="#d1d5db" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ marginBottom: '8px', fontFamily: 'var(--font-heading)', color: '#1a1a1a' }}>Sign in to view orders</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '0.95rem' }}>You need to be logged into your Teepresso customer account to view your order history.</p>
            <Link to="/login">
              <Button variant="primary" size="md">Sign In To Account</Button>
            </Link>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #f3f4f6', borderTopColor: '#1a1a1a', borderRadius: '50%', margin: '0 auto' }}></div>
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Fetching your live orders from database...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '24px' }}>
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.searchCard} style={{ textAlign: 'center', padding: '48px 24px' }}>
            <ShoppingBag size={48} color="#d1d5db" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ marginBottom: '8px', fontFamily: 'var(--font-heading)', color: '#1a1a1a' }}>No orders found</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '0.95rem' }}>You haven't placed any bulk apparel orders yet.</p>
            <Link to="/products">
              <Button variant="primary" size="md">Browse Apparel Catalog</Button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order) => {
              const isDelivered = order.currentStage === 'Delivered';
              return (
                <div key={order.id} className={styles.orderMetaCard} style={{ border: '1px solid #eaeaea', borderRadius: '12px', padding: '20px', backgroundColor: '#ffffff' }}>
                  
                  {/* Top Meta Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1a1a1a', fontFamily: 'var(--font-heading)' }}>
                        {order.orderId || order.id}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '2px' }}>
                        Placed on {order.orderDate || 'Recent'} • {order.totalPieces || 1} Pcs
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: isDelivered ? '#f0fdf4' : '#fffbeb',
                      color: isDelivered ? '#166534' : '#b45309',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: isDelivered ? '1px solid #bbf7d0' : '1px solid #fde68a'
                    }}>
                      {isDelivered ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      <span>{order.currentStage || 'Order Placed'}</span>
                    </div>
                  </div>

                  {/* Order Details Body */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px dashed #eaeaea' }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', color: '#1a1a1a', fontWeight: 700 }}>
                        {order.productName || 'Custom Bulk Apparel'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '2px' }}>
                        Est. Delivery: <strong>{order.estimatedDelivery || '5-7 Days'}</strong>
                      </div>
                      {order.voiceNoteUrl && (
                        <div style={{ marginTop: '6px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#F0FDF4',
                            color: '#15803D',
                            border: '1px solid #DCFCE7',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 600
                          }}>
                            <Mic size={10} /> Voice Note Attached
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', color: '#1a1a1a', fontWeight: 800 }}>
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default MyOrdersPage;
