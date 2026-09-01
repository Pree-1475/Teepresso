import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Users,
  Search,
  Package,
  CheckCircle,
  Sliders,
  X,
  CreditCard,
  QrCode,
  Save
} from 'lucide-react';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const navigate = useNavigate();

  const [storefrontMode, setStorefrontMode] = useState<'STANDARD' | 'FESTIVE'>('FESTIVE');
  const [updatingMode, setUpdatingMode] = useState(false);

  // UPI VPA State
  const [upiVpa, setUpiVpa] = useState('teepresso@upi');
  const [payeeName, setPayeeName] = useState('Teepresso Enterprise');
  const [inputUpiVpa, setInputUpiVpa] = useState('teepresso@upi');
  const [inputPayeeName, setInputPayeeName] = useState('Teepresso Enterprise');
  const [savingUpi, setSavingUpi] = useState(false);
  const [upiSavedMsg, setUpiSavedMsg] = useState(false);

  // Custom Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetMode, setTargetMode] = useState<'STANDARD' | 'FESTIVE' | null>(null);
  const [confirmInput, setConfirmInput] = useState('');

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    recentOrdersList: [] as any[]
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          if (data.settings.storefrontMode) setStorefrontMode(data.settings.storefrontMode);
          if (data.settings.upiVpa) {
            setUpiVpa(data.settings.upiVpa);
            setInputUpiVpa(data.settings.upiVpa);
          }
          if (data.settings.payeeName) {
            setPayeeName(data.settings.payeeName);
            setInputPayeeName(data.settings.payeeName);
          }
        }
      })
      .catch(err => console.error('Failed to load settings:', err));

    Promise.all([
      fetch('http://localhost:5000/api/v1/orders').then(r => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/v1/products').then(r => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/v1/customers').then(r => r.json()).catch(() => ({}))
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
        recentOrdersList: orders.slice(0, 5)
      });
    });
  }, []);

  const triggerModeChange = (newMode: 'STANDARD' | 'FESTIVE') => {
    if (newMode === storefrontMode) return;
    setTargetMode(newMode);
    setConfirmInput('');
    setShowConfirmModal(true);
  };

  const handleConfirmChange = async () => {
    if (!targetMode || confirmInput !== targetMode) return;

    setShowConfirmModal(false);
    setUpdatingMode(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storefrontMode: targetMode })
      });
      const data = await res.json();
      if (data.success && data.settings && data.settings.storefrontMode) {
        setStorefrontMode(data.settings.storefrontMode);
      }
    } catch (err) {
      console.error('Failed to update storefront mode:', err);
    } finally {
      setUpdatingMode(false);
    }
  };

  const handleSaveUpiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUpiVpa.trim()) return;

    setSavingUpi(true);
    setUpiSavedMsg(false);

    try {
      const res = await fetch('http://localhost:5000/api/v1/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          upiVpa: inputUpiVpa.trim(),
          payeeName: inputPayeeName.trim() || 'Teepresso Enterprise'
        })
      });
      const data = await res.json();
      if (data.success && data.settings) {
        if (data.settings.upiVpa) setUpiVpa(data.settings.upiVpa);
        if (data.settings.payeeName) setPayeeName(data.settings.payeeName);
        setUpiSavedMsg(true);
        setTimeout(() => setUpiSavedMsg(false), 3500);
      }
    } catch (err) {
      console.error('Failed to save UPI settings:', err);
    } finally {
      setSavingUpi(false);
    }
  };

  const recentFallbackOrders = [
    { id: 'TP-1042', orderId: 'TP-1042', customerName: 'College Fest 2025', currentStage: 'Order Placed', orderDate: '5 days ago' },
    { id: 'TP-1041', orderId: 'TP-1041', customerName: 'ZettaScale Tech Inc', currentStage: 'Processing', orderDate: '3 weeks ago' },
    { id: 'TP-1040', orderId: 'TP-1040', customerName: 'Greenwood RWA', currentStage: 'Dispatched', orderDate: '1 month ago' },
  ];

  const activeRecentOrders = stats.recentOrdersList.length > 0 ? stats.recentOrdersList : recentFallbackOrders;

  return (
    <div className={styles.dashboardContainer}>
      
      {/* Wagtail-style Header Row */}
      <div className={styles.topHeaderRow}>
        <div className={styles.topLeft}>
          <h1 className={styles.pageTitle}>teepresso</h1>
          <div className={styles.statsRow}>
            <button className={styles.statBtn} onClick={() => navigate('/orders')}>
              <FileText size={14} />
              <span>{stats.totalOrders} Orders</span>
            </button>
            <button className={styles.statBtn} onClick={() => navigate('/products')}>
              <Package size={14} />
              <span>{stats.totalProducts} Line Items</span>
            </button>
            <button className={styles.statBtn} onClick={() => navigate('/customers')}>
              <Users size={14} />
              <span>{stats.totalCustomers} Customers</span>
            </button>
          </div>
        </div>

        <div className={styles.topRight}>
          <div className={styles.siteLogoCircle}>
            <span>TP</span>
          </div>
          <div className={styles.siteInfo}>
            <span className={styles.siteName}>Teepresso</span>
            <a href="#" className={styles.siteLink}>Account</a>
            <a href="#" className={styles.siteLinkAccent}>Teepresso ERP guide <ArrowUpRightIcon /></a>
          </div>
        </div>
      </div>

      {/* Large Search Bar */}
      <div className={styles.searchContainer}>
        <Search size={16} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search all orders..." 
          className={styles.searchInput}
        />
      </div>

      {/* Storefront Mode Configuration Panel */}
      <div className={styles.panel} style={{ marginBottom: '24px' }}>
        <div className={styles.panelHeader}>
          <Sliders size={14} className={styles.panelIcon} />
          <h2>Active Storefront Campaign Mode</h2>
        </div>
        <div className={styles.panelBody} style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Switch the public-facing homepage theme and collection highlights instantly.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              type="button"
              disabled={updatingMode}
              onClick={() => triggerModeChange('STANDARD')}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '8px',
                border: storefrontMode === 'STANDARD' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: storefrontMode === 'STANDARD' ? 'rgba(5, 122, 120, 0.06)' : 'var(--color-surface-white)',
                cursor: storefrontMode === 'STANDARD' ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', color: storefrontMode === 'STANDARD' ? 'var(--color-primary)' : 'var(--color-text-title)', fontWeight: 600 }}>
                Standard Mode
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                Focuses on standard customizable T-Shirts, Polos, and Hoodies.
              </p>
            </button>

            <button
              type="button"
              disabled={updatingMode}
              onClick={() => triggerModeChange('FESTIVE')}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '8px',
                border: storefrontMode === 'FESTIVE' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: storefrontMode === 'FESTIVE' ? 'rgba(5, 122, 120, 0.06)' : 'var(--color-surface-white)',
                cursor: storefrontMode === 'FESTIVE' ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', color: storefrontMode === 'FESTIVE' ? 'var(--color-primary)' : 'var(--color-text-title)', fontWeight: 600 }}>
                Festive Campaign Mode
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                Promotes traditional Kurtas, Pagdis, and Khanduvas for fests and community events.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Merchant UPI VPA Payment Settings & Dynamic QR Generator Panel */}
      <div className={styles.panel} style={{ marginBottom: '24px' }}>
        <div className={styles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={14} className={styles.panelIcon} />
            <h2>Storefront Merchant UPI Payment Settings (VPA / QR Generator)</h2>
          </div>
          {upiSavedMsg && (
            <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={13} /> UPI Settings Saved
            </span>
          )}
        </div>
        <div className={styles.panelBody} style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Configure your merchant UPI VPA ID. Customers scanning checkout payment QRs will pay directly to this UPI ID with their exact custom order amount.
          </p>

          <form onSubmit={handleSaveUpiSettings} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 180px', gap: '20px', alignItems: 'flex-end' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={13} /> Storefront UPI VPA ID *
              </label>
              <input
                type="text"
                value={inputUpiVpa}
                onChange={e => setInputUpiVpa(e.target.value)}
                required
                placeholder="e.g. teepresso@upi or 9876543210@paytm"
                className={styles.formInput}
                style={{ padding: '10px 12px', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Valid VPA address for receiving direct BHIM, GPay, PhonePe, Paytm payments.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-title)' }}>
                Merchant / Payee Title
              </label>
              <input
                type="text"
                value={inputPayeeName}
                onChange={e => setInputPayeeName(e.target.value)}
                placeholder="e.g. Teepresso Enterprise"
                className={styles.formInput}
                style={{ padding: '10px 12px', fontSize: '13px' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Name displayed on customer UPI payment confirmation apps.</span>
            </div>

            <button
              type="submit"
              disabled={savingUpi}
              className="erp-btn-primary"
              style={{ width: '100%', padding: '10px 16px', fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', cursor: 'pointer', height: '40px' }}
            >
              <Save size={14} />
              <span>{savingUpi ? 'Saving...' : 'Save UPI VPA'}</span>
            </button>

          </form>
        </div>
      </div>

      {/* Recent Edits Panel */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <CheckCircle size={14} className={styles.panelIcon} />
          <h2>Your most recent edits</h2>
        </div>
        
        <div className={styles.panelBody}>
          <table className={styles.editsTable}>
            <tbody>
              {activeRecentOrders.map((order: any) => (
                <tr key={order.id} onClick={() => navigate(`/orders`)}>
                  <td className={styles.editTitle}>{order.orderId || order.id} • {order.customerName || order.title}</td>
                  <td className={styles.editStatus}>
                    <span className={styles.statusBadge}>{order.currentStage || order.status}</span>
                  </td>
                  <td className={styles.editTime}>{order.orderDate || order.time}</td>
                  <td className={styles.editActions}>•••</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOM CONFIRMATION MODAL OVERLAY */}
      {showConfirmModal && targetMode && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            
            <div className={styles.modalHeader}>
              <h3>Confirm Campaign Mode Change</h3>
              <button 
                type="button" 
                className={styles.modalCloseBtn}
                onClick={() => setShowConfirmModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalWarning}>
                <strong>WARNING:</strong> This action will instantly swap the public-facing storefront website to <strong>{targetMode === 'FESTIVE' ? 'Festive Kurta Collection' : 'Standard T-Shirt Catalog'}</strong> for all live visitors.
              </div>

              <label className={styles.modalInputLabel}>
                To confirm, type <strong>{targetMode}</strong> in the input field:
              </label>
              <input
                type="text"
                placeholder={targetMode}
                value={confirmInput}
                onChange={e => setConfirmInput(e.target.value)}
                className={styles.modalInput}
                autoFocus
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className="erp-btn-secondary"
                onClick={() => setShowConfirmModal(false)}
                style={{ padding: '8px 16px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="erp-btn-primary"
                disabled={confirmInput !== targetMode}
                onClick={handleConfirmChange}
                style={{ 
                  padding: '8px 24px', 
                  cursor: confirmInput === targetMode ? 'pointer' : 'not-allowed',
                  backgroundColor: confirmInput === targetMode ? 'var(--color-primary)' : 'var(--color-border)',
                  borderColor: confirmInput === targetMode ? 'var(--color-primary)' : 'var(--color-border)'
                }}
              >
                Confirm Mode Change
              </button>
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  );
}

export default DashboardPage;
