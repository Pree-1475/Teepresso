import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Users,
  Search,
  Package,
  CheckCircle,
  Sliders,
  TrendingUp,
  Box,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import styles from './DashboardPage.module.css';
import { API_BASE_URL } from '@/common/config/api';

export function DashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    recentOrdersList: [] as any[]
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/orders`).then(r => r.json()).catch(() => ({})),
      fetch(`${API_BASE_URL}/products`).then(r => r.json()).catch(() => ({})),
      fetch(`${API_BASE_URL}/customers`).then(r => r.json()).catch(() => ({}))
    ]).then(([orderData, productData, customerData]) => {
      const orders = orderData.success && Array.isArray(orderData.orders) ? orderData.orders : [];
      const products = productData.success && Array.isArray(productData.products) ? productData.products : [];
      const customers = customerData.success && Array.isArray(customerData.customers) ? customerData.customers : [];

      const totalRev = orders.reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0);

      setStats({
        totalOrders: orders.length,
        totalRevenue: totalRev,
        totalProducts: products.length,
        totalCustomers: customers.length,
        recentOrdersList: orders.slice(0, 6)
      });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.workspace}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Teepresso Operations Console</h1>
          <p className={styles.subtitle}>Real-time overview of orders, inventory, and business metrics.</p>
        </div>
      </div>

      {/* Primary KPI Metrics Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        
        <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-title)', marginTop: '2px' }}>{stats.totalOrders}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gross Revenue</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-title)', marginTop: '2px' }}>₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Box size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Products</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-title)', marginTop: '2px' }}>{stats.totalProducts}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Accounts</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-title)', marginTop: '2px' }}>{stats.totalCustomers}</div>
          </div>
        </div>

      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div 
          onClick={() => navigate('/orders')}
          style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <strong style={{ fontSize: '14px', color: 'var(--color-text-title)', display: 'block' }}>Manage Order Queue</strong>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Approve mockups, track printing & dispatch</span>
          </div>
          <ArrowRight size={16} color="var(--color-primary)" />
        </div>

        <div 
          onClick={() => navigate('/products')}
          style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <strong style={{ fontSize: '14px', color: 'var(--color-text-title)', display: 'block' }}>Product Catalog & Pricing</strong>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Update volume pricing brackets & variants</span>
          </div>
          <ArrowRight size={16} color="var(--color-primary)" />
        </div>

        <div 
          onClick={() => navigate('/stock-overview')}
          style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <strong style={{ fontSize: '14px', color: 'var(--color-text-title)', display: 'block' }}>Inventory Stock Command</strong>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Audit size/color stock levels & low warnings</span>
          </div>
          <ArrowRight size={16} color="var(--color-primary)" />
        </div>
      </div>

      {/* Recent Orders & Activity Table */}
      <div className={styles.panel}>
        <div className={styles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={14} className={styles.panelIcon} />
            <h2>Recent Orders Activity</h2>
          </div>
          <button 
            onClick={() => navigate('/orders')}
            className="erp-btn-secondary" 
            style={{ fontSize: '12px', padding: '4px 10px', cursor: 'pointer' }}
          >
            View All Orders
          </button>
        </div>
        
        <div className={styles.panelBody}>
          {loading ? (
            <p style={{ padding: '20px' }}>Loading recent activity...</p>
          ) : stats.recentOrdersList.length === 0 ? (
            <p style={{ padding: '20px', color: 'var(--color-text-muted)' }}>No recent orders found.</p>
          ) : (
            <table className={styles.editsTable}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Order ID & Customer</th>
                  <th style={{ padding: '12px 16px' }}>Product</th>
                  <th style={{ padding: '12px 16px' }}>Stage</th>
                  <th style={{ padding: '12px 16px' }}>Amount</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrdersList.map((order: any) => (
                  <tr key={order.id} onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>
                    <td className={styles.editTitle} style={{ padding: '12px 16px' }}>
                      <strong>{order.orderId || order.id}</strong> • {order.customerName || 'Customer'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      {order.productName || 'Custom Order'}
                    </td>
                    <td className={styles.editStatus} style={{ padding: '12px 16px' }}>
                      <span className={styles.statusBadge}>{order.currentStage || 'Processing'}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>
                      ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className={styles.editTime} style={{ padding: '12px 16px' }}>
                      {order.orderDate || 'Today'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}

export default DashboardPage;
