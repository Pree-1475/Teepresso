import React, { useState, useEffect } from 'react';
import { Search, Truck, Check, X, AlertCircle } from 'lucide-react';
import styles from './DispatchPage.module.css';
import { API_BASE_URL } from '@/common/config/api';

interface Order {
  id: string;
  orderId: string;
  orgName: string;
  customerName: string;
  totalPieces: number;
  currentStage: string;
}

export function DispatchPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{ orderId: string, stage: string, orgName: string, ref: string } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        // Show orders that are approved and not yet delivered/dispatched
        const filtered = data.orders.filter((o: any) => 
          o.mockupStatus === 'Approved' && 
          o.currentStage !== 'Delivered'
        );
        setOrders(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

    const executeUpdateStage = async (orderId: string, stage: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStage: stage })
      });
      if (res.ok) {
        setConfirmModal(null);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = orders.filter(item => {
    return (
      item.orderId.toLowerCase().includes(search.toLowerCase()) ||
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.orgName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className={styles.workspace}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dispatch Management</h1>
          <p className={styles.subtitle}>Select ready orders and add them to the dispatched list.</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} className="text-muted" />
          <input
            type="text"
            placeholder="Search Order ID, Client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className="erp-table-container">
        {loading ? (
           <div style={{ padding: '24px' }}>Loading...</div>
        ) : orders.length === 0 ? (
           <div style={{ padding: '24px' }}>No orders ready for dispatch.</div>
        ) : (
          <table className="erp-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Client / Organization</th>
                <th>Pieces</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="text-mono" style={{ fontWeight: 600 }}>{item.orderId}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.orgName}</div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>{item.customerName}</div>
                  </td>
                  <td>{item.totalPieces} pcs</td>
                  <td>
                    <span className={`badge ${item.currentStage === 'In Transit' ? 'badge-info' : 'badge-warning'}`}>{item.currentStage}</span>
                  </td>
                  <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => setConfirmModal({ orderId: item.id, stage: 'In Transit', orgName: item.orgName, ref: item.orderId })}
                      className="erp-btn-secondary" 
                      disabled={item.currentStage === 'In Transit'}
                      style={{ padding: '6px 12px', opacity: item.currentStage === 'In Transit' ? 0.5 : 1, cursor: item.currentStage === 'In Transit' ? 'not-allowed' : 'pointer' }}
                    >
                      <Truck size={14} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }}/> Mark Dispatched
                    </button>
                    <button 
                      onClick={() => setConfirmModal({ orderId: item.id, stage: 'Delivered', orgName: item.orgName, ref: item.orderId })}
                      className="erp-btn-primary" 
                      disabled={item.currentStage !== 'In Transit'}
                      style={{ 
                        padding: '6px 12px', 
                        backgroundColor: item.currentStage !== 'In Transit' ? '#6ee7b7' : '#10b981', 
                        borderColor: item.currentStage !== 'In Transit' ? '#6ee7b7' : '#10b981',
                        opacity: item.currentStage !== 'In Transit' ? 0.6 : 1,
                        cursor: item.currentStage !== 'In Transit' ? 'not-allowed' : 'pointer',
                        color: '#fff'
                      }}
                    >
                      <Check size={14} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }}/> Mark Delivered
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CONFIRMATION MODAL OVERLAY */}
      {confirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            backgroundColor: 'var(--color-surface-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            width: '100%',
            maxWidth: '440px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--color-text-title)', fontFamily: 'var(--font-mono)' }}>
                Confirm {confirmModal.stage === 'In Transit' ? 'Dispatch' : 'Delivery'}
              </h3>
              <button 
                type="button" 
                onClick={() => setConfirmModal(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{
                backgroundColor: confirmModal.stage === 'Delivered' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(14, 165, 233, 0.08)',
                borderLeft: confirmModal.stage === 'Delivered' ? '4px solid #10b981' : '4px solid #0ea5e9',
                padding: '12px 16px',
                borderRadius: '2px',
                color: 'var(--color-text-body)',
                fontSize: '13px',
                lineHeight: '1.5',
                marginBottom: '20px'
              }}>
                You are about to mark order <strong>{confirmModal.ref}</strong> ({confirmModal.orgName}) as <strong>{confirmModal.stage}</strong>.
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-body)', lineHeight: '1.4' }}>
                {confirmModal.stage === 'In Transit' 
                  ? 'This indicates the order has been handed over to the courier and is on its way to the client.' 
                  : 'This indicates the order has successfully reached the client and will clear it from the dispatch radar.'}
                <br /><br />
                Are you sure you want to proceed?
              </p>
            </div>

            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                type="button"
                className="erp-btn-secondary"
                onClick={() => setConfirmModal(null)}
                style={{ padding: '8px 16px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeUpdateStage(confirmModal.orderId, confirmModal.stage)}
                className="erp-btn-primary"
                style={{ 
                  padding: '8px 24px', 
                  cursor: 'pointer',
                  backgroundColor: confirmModal.stage === 'Delivered' ? '#10b981' : 'var(--color-primary)',
                  borderColor: confirmModal.stage === 'Delivered' ? '#10b981' : 'var(--color-primary)',
                }}
              >
                Yes, Mark as {confirmModal.stage}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default DispatchPage;
