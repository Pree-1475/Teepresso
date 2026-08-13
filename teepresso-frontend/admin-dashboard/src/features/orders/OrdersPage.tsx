import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import styles from './OrdersPage.module.css';

interface Order {
  id: string;
  orderId: string;
  customerName?: string; // Muted/absent for manager
  email?: string; // Muted/absent for manager
  phone?: string; // Muted/absent for manager
  orgName: string;
  productName: string;
  category: string;
  totalPieces: number;
  totalAmount: number;
  currentStage: string;
  estimatedDelivery: string;
  orderDate: string;
  isUrgent: boolean;
  paymentStatus: string;
  notes?: string;
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Read role from localStorage
  const userStr = localStorage.getItem('teepresso_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user ? user.role : 'admin';

  const STAGE_FILTERS = ['All', 'Order Placed', 'Waiting for Approval', 'Approved', 'Printing', 'Quality Check', 'In Transit', 'Delivered'];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = role === 'manager' 
        ? 'http://localhost:5000/api/v1/orders?role=manager'
        : 'http://localhost:5000/api/v1/orders';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [role]);

  const handleUpdateStage = async (orderId: string, newStage: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/orders/${orderId}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        setSelectedOrder(prev => prev ? { ...prev, currentStage: newStage } : null);
      }
    } catch (err) {
      console.error('Failed to update order stage:', err);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'All' || order.currentStage === activeTab;
    
    // Safety check for text search fields if masked
    const customer = order.customerName || '';
    const org = order.orgName || '';
    const product = order.productName || '';
    const oid = order.orderId || '';

    const matchesSearch = searchQuery === '' ||
      oid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusDot = (stage: string) => {
    switch (stage) {
      case 'Order Placed': return { dot: 'status-dot-amber', text: 'Order Placed' };
      case 'Waiting for Approval': return { dot: 'status-dot-amber', text: 'Waiting for Approval' };
      case 'Approved': return { dot: 'status-dot-emerald', text: 'Approved' };
      case 'Printing': return { dot: 'status-dot-indigo', text: 'Printing' };
      case 'Quality Check': return { dot: 'status-dot-purple', text: 'Quality Check' };
      case 'In Transit': return { dot: 'status-dot-purple', text: 'In Transit' };
      case 'Delivered': return { dot: 'status-dot-emerald', text: 'Delivered' };
      default: return { dot: 'status-dot-amber', text: stage };
    }
  };

  if (loading) {
    return (
      <div className="admin-page-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
          <RefreshCw className="animate-spin" size={16} />
          <span>Syncing orders from fulfillment database...</span>
        </div>
      </div>
    );
  }

  // Alerts
  const urgentOrdersCount = orders.filter(o => o.isUrgent).length;
  const bulkOrdersCount = orders.filter(o => o.totalPieces >= 300).length;

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders Queue</h1>
          <p className={styles.subtitle}>Production pipeline & fulfillment tracking</p>
        </div>
        <button onClick={fetchOrders} className={styles.syncBtn}>
          <RefreshCw size={13} /> Sync Queue
        </button>
      </div>

      {/* High Alert Indicators */}
      {(urgentOrdersCount > 0 || (role === 'admin' && bulkOrdersCount > 0)) && (
        <div className={styles.alertsContainer}>
          {urgentOrdersCount > 0 && (
            <div className={styles.alertBarUrgent}>
              <AlertCircle size={14} />
              <span><strong>High Alert:</strong> {urgentOrdersCount} Urgent orders flagged. Complete piece count & dispatch within 48h.</span>
            </div>
          )}
          {role === 'admin' && bulkOrdersCount > 0 && (
            <div className={styles.alertBarBulk}>
              <AlertCircle size={14} />
              <span><strong>Bulk Action Required:</strong> {bulkOrdersCount} orders exceed 300 pieces. Setup manual call/email follow-up for client satisfaction.</span>
            </div>
          )}
        </div>
      )}

      {/* Controls Row */}
      <div className={styles.controlsRow}>
        <div className={styles.tabsList}>
          {STAGE_FILTERS.map(tab => (
            <button
              key={tab}
              type="button"
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Waiting for Approval' ? 'Approval Required' : tab}
            </button>
          ))}
        </div>

        <div className={styles.searchBox}>
          <Search size={14} color="var(--color-text-subtle)" />
          <input
            type="text"
            placeholder="Search by order ID, product, or org..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* High Density Linear Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer & Organization</th>
              <th>Product Specs</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                  No orders match current filter.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const statusInfo = getStatusDot(order.currentStage);
                return (
                  <tr key={order.id}>
                    <td>
                      <span className="logistics-id">#{order.orderId}</span>
                      {order.isUrgent && <span className={styles.urgentBadge} title="Urgent Order">⚡ URGENT</span>}
                    </td>
                    <td>
                      {role === 'manager' ? (
                        <>
                          <div className={styles.customerName} style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontWeight: 400 }}>
                            PII Masked (Manager Role)
                          </div>
                          <div className={styles.orgName}>{order.orgName}</div>
                        </>
                      ) : (
                        <>
                          <div className={styles.customerName}>{order.customerName}</div>
                          <div className={styles.orgName}>{order.orgName}</div>
                        </>
                      )}
                    </td>
                    <td>
                      <div>{order.productName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-subtle)' }}>{order.category}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{order.totalPieces} Pcs</td>
                    <td style={{ fontWeight: 700, color: '#0F172A' }}>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                    <td>
                      <div className="status-dot-badge">
                        <span className={`status-dot ${statusInfo.dot}`}></span>
                        <span>{statusInfo.text}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className={styles.ghostActionBtn}
                        title="Manage Order"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className="logistics-id">#{selectedOrder.orderId}</span>
                <h2 style={{ fontSize: '17px', marginTop: '2px', color: '#0F172A' }}>
                  {role === 'manager' ? 'Operational Order View' : selectedOrder.customerName}
                </h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              {role === 'manager' ? (
                <div className={styles.maskedAlertBox}>
                  <AlertCircle size={15} />
                  <span>Sensitive customer details, notes, and file access are masked in manager view.</span>
                </div>
              ) : (
                <>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Contact Info:</span>
                    <span>{selectedOrder.phone} • {selectedOrder.email}</span>
                  </div>
                  {selectedOrder.notes && (
                    <div className={styles.detailRow} style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '4px' }}>
                      <span className={styles.detailLabel}>Special Instructions:</span>
                      <p style={{ fontSize: '12px', marginTop: '4px' }}>&quot;{selectedOrder.notes}&quot;</p>
                    </div>
                  )}
                </>
              )}

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Organization:</span>
                <span><strong>{selectedOrder.orgName}</strong></span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Apparel Specifications:</span>
                <span>{selectedOrder.totalPieces} Pcs x {selectedOrder.productName} ({selectedOrder.category})</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Total Volume Cost:</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                  ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Estimated Delivery Date:</span>
                <span>{selectedOrder.estimatedDelivery}</span>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Update Stage:
                </label>
                <select
                  value={selectedOrder.currentStage}
                  onChange={(e) => handleUpdateStage(selectedOrder.id, e.target.value)}
                  className={styles.stageSelect}
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Waiting for Approval">Waiting for Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Design in Progress">Design in Progress</option>
                  <option value="Printing">Printing</option>
                  <option value="Quality Check">Quality Check</option>
                  <option value="Packed">Packed</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default OrdersPage;
