import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { PackageCheck, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import styles from './track-order.module.css';

interface CustomerOrder {
  id: string;
  orderId: string;
  customerName: string;
  orderDate: string;
  currentStage: string;
  productName: string;
  totalPieces: number;
  totalAmount: number;
  paymentStatus: string;
}

export function MyOrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      const queryParam = user?.phone ? `phone=${encodeURIComponent(user.phone)}` : '';
      const res = await fetch(`http://localhost:5000/api/v1/orders?${queryParam}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch user orders from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  return (
    <div className={styles.pageContainer}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div className={styles.heroHeader} style={{ textAlign: 'left', alignItems: 'flex-start', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h1 className={styles.heroTitle} style={{ fontSize: '2rem' }}>
              My Orders
            </h1>
            <p className={styles.heroDesc} style={{ textAlign: 'left' }}>
              Real-time order history synced live with Teepresso production.
            </p>
          </div>
          {isAuthenticated && (
            <button 
              onClick={fetchUserOrders}
              style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', cursor: 'pointer', display: 'inline-flex', gap: '6px', alignItems: 'center', fontSize: '13px', fontWeight: 600 }}
            >
              <RefreshCw size={14} /> Refresh Orders
            </button>
          )}
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
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading live orders from database...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.searchCard} style={{ textAlign: 'center', padding: '48px 24px' }}>
            <PackageCheck size={48} color="#d1d5db" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ marginBottom: '8px', fontFamily: 'var(--font-heading)', color: '#1a1a1a' }}>No orders found</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '0.95rem' }}>You have not placed any custom orders yet.</p>
            <Link to="/products">
              <Button variant="primary" size="md">Browse Product Catalog</Button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order) => (
              <div key={order.id} className={styles.orderMetaCard} style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid #eaeaea', backgroundColor: '#fff', borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a', fontFamily: 'var(--font-heading)' }}>{order.orderId}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>Placed on {order.orderDate}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: order.currentStage === 'Delivered' ? '#f0fdf4' : '#fffbeb', color: order.currentStage === 'Delivered' ? '#166534' : '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {order.currentStage === 'Delivered' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    {order.currentStage}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px dashed #eaeaea' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 600 }}>{order.productName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '2px' }}>{order.totalPieces} Pieces</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.05rem', color: '#1a1a1a', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>₹{order.totalAmount.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: order.paymentStatus === 'Paid' ? '#27ae60' : '#e67e22' }}>{order.paymentStatus}</div>
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
