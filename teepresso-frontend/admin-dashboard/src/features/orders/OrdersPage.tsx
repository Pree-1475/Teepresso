import React, { useState, useEffect } from 'react';
const getUser = () => {
  try {
    const raw = localStorage.getItem('teepresso_user');
    return raw ? JSON.parse(raw) : { role: 'admin' };
  } catch {
    return { role: 'admin' };
  }
};
import { Search, Filter, Download, ShieldAlert, X, CheckCircle, Clock, Save, Truck, CreditCard, Package } from 'lucide-react';
import styles from './OrdersPage.module.css';
import { API_BASE_URL } from '@/common/config/api';

interface OrderItem {
  id?: string;
  name?: string;
  productName?: string;
  color?: string;
  pattern?: string;
  size?: string;
  quantity?: number;
  qty?: number;
  unitPrice?: number;
  totalPrice?: number;
}

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  orgName: string;
  orgType: string;
  productName: string;
  category: string;
  totalPieces: number;
  totalAmount: number;
  orderDate: string;
  estimatedDelivery: string;
  currentStage: string;
  isUrgent: boolean;
  paymentStatus: string;
  paymentDetails: any;
  mockupUrl: string;
  mockupStatus: string;
  notes: string;
  items: OrderItem[] | string;
  dispatchDetails?: any;
}

const PRODUCTION_STAGES = [
  'Order Placed',
  'Design in Progress',
  'Mockup Approved',
  'Printing',
  'Quality Check',
  'Packed',
  'In Transit',
  'Delivered'
];

export function OrdersPage() {
  const user = getUser();
  const isManager = user?.role === 'manager';

  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Modal Edit States
  const [editStage, setEditStage] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInspector = (order: Order) => {
    setSelectedOrder(order);
    setEditStage(order.currentStage || 'Order Placed');
    setEditPaymentStatus(order.paymentStatus || 'Pending');
    setEditNotes(order.notes || '');
    setSaveSuccess(null);
    setSaveError(null);
  };

  const handleSaveOrderUpdates = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStage: editStage,
          paymentStatus: editPaymentStatus,
          notes: editNotes
        })
      });
      const data = await res.json();
      if (data.success && data.order) {
        setSaveSuccess('Order updated successfully!');
        setSelectedOrder(data.order);
        // Refresh full table
        fetchOrders();
        setTimeout(() => setSaveSuccess(null), 3000);
      } else {
        setSaveError(data.message || 'Failed to update order');
      }
    } catch (err) {
      console.error(err);
      setSaveError('Network error while saving order details');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return (
      (o.orderId && o.orderId.toLowerCase().includes(q)) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.orgName && o.orgName.toLowerCase().includes(q)) ||
      (o.productName && o.productName.toLowerCase().includes(q))
    );
  });

  const parsedItems = (items: OrderItem[] | string | undefined): OrderItem[] => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    try {
      return JSON.parse(items);
    } catch {
      return [];
    }
  };

  return (
    <div className={styles.workspace}>
      {/* Header */}
      <div className={styles.header} style={{ marginBottom: '24px' }}>
        <div>
          <h1 className={styles.title}>Orders Queue</h1>
          <p className={styles.subtitle}>View newly placed orders and track overall progress.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar} style={{ marginBottom: '20px' }}>
        <div className={styles.searchBox}>
          <Search size={14} className="text-muted" />
          <input
            type="text"
            placeholder="Search Order ID, Customer Name, Organization..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <button className="erp-btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Filter size={14} />
            <span>Filter</span>
          </button>
          <button className="erp-btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Clean Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Loading orders database...</div>
      ) : (
        <div className="erp-table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer & Org</th>
                <th>Apparel Specs</th>
                <th>Quantity</th>
                <th>Total Amount</th>
                <th>Payment</th>
                <th>Production Stage</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} onClick={() => handleOpenInspector(item)} style={{ cursor: 'pointer' }}>
                  <td className="text-mono" style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{item.orderId || item.id}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-title)' }}>
                      {isManager ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                          <ShieldAlert size={10} /> Masked
                        </span>
                      ) : (item.customerName || 'Customer')}
                    </div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>{item.orgName || 'Individual'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.productName || 'Custom Apparel'}</div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>{item.category || 'Bulk Order'}</div>
                  </td>
                  <td><strong>{item.totalPieces || 0}</strong> pcs</td>
                  <td style={{ fontWeight: 700 }}>₹{Number(item.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: item.paymentStatus === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: item.paymentStatus === 'Paid' ? '#10b981' : '#d97706',
                      border: item.paymentStatus === 'Paid' ? '1px solid #10b981' : '1px solid #d97706'
                    }}>
                      {item.paymentStatus || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: item.currentStage === 'Delivered' ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-surface-hover)',
                      color: item.currentStage === 'Delivered' ? '#10b981' : 'var(--color-text-title)',
                      border: '1px solid var(--color-border)'
                    }}>
                      {item.currentStage || 'Order Placed'}
                    </span>
                  </td>
                  <td>
                    {item.isUrgent ? (
                      <span className="badge badge-danger">Express</span>
                    ) : (
                      <span className="text-muted">Standard</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Redesigned Clean Wagtail-Style Order Inspector Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            backgroundColor: 'var(--color-surface-white)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            width: '92%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            
            {/* Modal Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-title)' }}>
                    Order Inspection: <strong>{selectedOrder.orderId || selectedOrder.id}</strong>
                  </h2>
                  {selectedOrder.isUrgent && (
                    <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                      EXPRESS PRIORITY
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Placed on {selectedOrder.orderDate || 'Recent'}</span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Notifications */}
            {saveSuccess && (
              <div style={{ padding: '10px 14px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', color: '#065f46', borderRadius: '4px', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} />
                <span>{saveSuccess}</span>
              </div>
            )}

            {saveError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', borderLeft: '4px solid #ef4444', color: '#b91c1c', borderRadius: '4px', marginBottom: '16px', fontWeight: 600 }}>
                {saveError}
              </div>
            )}

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              
              {/* Customer Info Box */}
              <div style={{ backgroundColor: 'var(--color-surface-hover)', padding: '16px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--color-text-title)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Customer Details
                </h4>
                {isManager ? (
                  <div style={{ color: '#991b1b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldAlert size={14} /> Contact Details Masked (Manager Role)
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong>Name:</strong> {selectedOrder.customerName || 'N/A'}</div>
                    <div><strong>Email:</strong> {selectedOrder.email || 'N/A'}</div>
                    <div><strong>Phone:</strong> {selectedOrder.phone || 'N/A'}</div>
                    <div><strong>Organization:</strong> {selectedOrder.orgName} ({selectedOrder.orgType || 'Individual'})</div>
                  </div>
                )}
              </div>

              {/* Order Financials Box */}
              <div style={{ backgroundColor: 'var(--color-surface-hover)', padding: '16px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--color-text-title)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Financials & Payment
                </h4>
                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>Total Quantity:</strong> {selectedOrder.totalPieces || 0} Pieces</div>
                  <div><strong>Total Amount:</strong> ₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <strong>Payment Status:</strong>
                    <select
                      value={editPaymentStatus}
                      onChange={e => setEditPaymentStatus(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '12px', fontWeight: 600 }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial Deposit">Partial Deposit</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Production Stage Control Section */}
            <div style={{ border: '1px solid var(--color-border)', padding: '16px', borderRadius: '6px', marginBottom: '24px', backgroundColor: 'var(--color-surface-white)' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '14px', marginBottom: '8px', color: 'var(--color-text-title)' }}>
                Update Production Stage:
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select
                  disabled={updating}
                  value={editStage}
                  onChange={e => setEditStage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontWeight: 600,
                    fontSize: '14px',
                    backgroundColor: 'var(--color-surface-hover)',
                    color: 'var(--color-text-title)'
                  }}
                >
                  {PRODUCTION_STAGES.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Itemized Order Breakdown Table */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--color-text-title)' }}>
                Ordered Items Breakdown
              </h4>
              {parsedItems(selectedOrder.items).length === 0 ? (
                <div style={{ padding: '12px', backgroundColor: 'var(--color-surface-hover)', borderRadius: '6px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {selectedOrder.productName} ({selectedOrder.totalPieces} Pcs)
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-surface-hover)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px' }}>Item</th>
                      <th style={{ padding: '8px 12px' }}>Color</th>
                      <th style={{ padding: '8px 12px' }}>Pattern</th>
                      <th style={{ padding: '8px 12px' }}>Size</th>
                      <th style={{ padding: '8px 12px' }}>Qty</th>
                      <th style={{ padding: '8px 12px' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedItems(selectedOrder.items).map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{item.productName || item.name || selectedOrder.productName}</td>
                        <td style={{ padding: '8px 12px' }}>{item.color || 'Default'}</td>
                        <td style={{ padding: '8px 12px' }}>{item.pattern || 'Standard'}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{item.size || 'M'}</td>
                        <td style={{ padding: '8px 12px' }}>{item.quantity || item.qty || 1} Pcs</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>₹{Number(item.totalPrice || item.unitPrice || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Notes Section */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: 'var(--color-text-title)' }}>
                Production & Order Notes:
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                className={styles.searchInput}
                style={{ width: '100%', padding: '10px', fontSize: '13px', borderRadius: '4px' }}
                placeholder="Enter internal production or customer notes..."
              />
            </div>

            {/* Footer Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <button
                type="button"
                className="erp-btn-secondary"
                onClick={() => setSelectedOrder(null)}
                style={{ padding: '8px 16px', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={handleSaveOrderUpdates}
                className="erp-btn-primary"
                style={{ padding: '8px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={14} />
                <span>{updating ? 'Saving Changes...' : 'Save Order Details'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
