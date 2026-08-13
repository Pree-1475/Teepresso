import React, { useState, useEffect } from 'react';
import { UploadCloud, ExternalLink, AlertCircle, RefreshCw, Send, CheckCircle2, ShieldAlert, Download } from 'lucide-react';
import styles from './MockupsQueuePage.module.css';

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  orgName: string;
  productName: string;
  category: string;
  totalPieces: number;
  currentStage: string;
  mockupUrl: string;
  mockupStatus: 'Pending Editing' | 'Customer Approval Pending' | 'Approved' | 'Revision Requested';
  revisionNote?: string;
  softCopyUrl: string | null;
  hasWatermark: boolean;
  whatsappNotificationSent: boolean;
}

export function MockupsQueuePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form states
  const [mockupUrlText, setMockupUrlText] = useState('');
  const [softCopyUrlText, setSoftCopyUrlText] = useState('');
  const [mockupStatusText, setMockupStatusText] = useState<'Pending Editing' | 'Customer Approval Pending' | 'Approved' | 'Revision Requested'>('Customer Approval Pending');
  const [statusMsg, setStatusMsg] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch mockups queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenUpload = (order: Order) => {
    setSelectedOrder(order);
    setMockupUrlText(order.mockupUrl);
    setSoftCopyUrlText(order.softCopyUrl || '');
    setMockupStatusText(order.mockupStatus);
    setStatusMsg('');
  };

  const handleUpdateMockup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setStatusMsg('');

    try {
      const res = await fetch(`http://localhost:5000/api/v1/orders/${selectedOrder.id}/mockup`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mockupUrl: mockupUrlText,
          softCopyUrl: softCopyUrlText || null,
          status: mockupStatusText
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg('Mockup proof settings saved successfully!');
        fetchOrders();
        // Close modal after brief delay
        setTimeout(() => {
          setSelectedOrder(null);
        }, 1000);
      }
    } catch (err) {
      setStatusMsg('⚠️ Connection failed');
    }
  };

  const handleSendWhatsApp = async (order: Order) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/orders/${order.id}/mockup`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_whatsapp'
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`[WhatsApp Simulation] Link sent to ${order.customerName} (${order.phone}): \nhttp://localhost:3000/approve-mockup?order=${order.orderId}`);
        fetchOrders();
      }
    } catch (err) {
      console.error('WhatsApp trigger failed:', err);
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'Approved': return { dot: 'status-dot-emerald', text: 'Approved' };
      case 'Revision Requested': return { dot: 'status-dot-rose', text: 'Revision Requested' };
      case 'Customer Approval Pending': return { dot: 'status-dot-amber', text: 'Pending Approval' };
      default: return { dot: 'status-dot-indigo', text: status };
    }
  };

  if (loading) {
    return (
      <div className="admin-page-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
          <RefreshCw className="animate-spin" size={16} />
          <span>Syncing vector assets & customer proofs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-title)' }}>Proofing & Design Queue</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Watermarked client mockups, vector soft copy downloads & WhatsApp approval workflows</p>
        </div>
        <button onClick={fetchOrders} className={styles.syncBtn}>
          <RefreshCw size={13} /> Sync Proofs
        </button>
      </div>

      {/* Grid of Proof Cards */}
      <div className={styles.proofsGrid}>
        {orders.map(item => {
          const statusInfo = getStatusDot(item.mockupStatus);
          return (
            <div key={item.id} className={styles.proofCard}>
              <div className={styles.cardHeader}>
                <div>
                  <span className="logistics-id">#{item.orderId}</span>
                  <h3 className={styles.orgText}>{item.orgName}</h3>
                </div>
                <div className="status-dot-badge">
                  <span className={`status-dot ${statusInfo.dot}`}></span>
                  <span>{statusInfo.text}</span>
                </div>
              </div>

              {/* Image Stage with Watermark Layer */}
              <div className={styles.imageStage}>
                <img src={item.mockupUrl} alt="Customer Proof" className={styles.proofImg} />
                {item.hasWatermark ? (
                  <div className={styles.watermarkOverlay}>
                    <div className={styles.watermarkPattern}>TEEPRESSO SECURE PROOF</div>
                  </div>
                ) : (
                  <div className={styles.unlockedOverlay}>
                    <CheckCircle2 size={16} color="#059669" />
                    <span>Watermark Unlocked</span>
                  </div>
                )}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <span>Customer:</span> <strong style={{ color: '#0F172A' }}>{item.customerName}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>WhatsApp:</span> <span style={{ fontFamily: 'monospace' }}>{item.phone}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Batch Specs:</span> <span>{item.totalPieces} Pcs • {item.productName}</span>
                </div>

                {/* Soft Copy Vector (Visible ONLY to editors) */}
                <div className={styles.softCopyContainer}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Vector Assets:</span>
                  {item.softCopyUrl ? (
                    <a href={item.softCopyUrl} className={styles.softCopyLink} download>
                      <Download size={12} /> {item.softCopyUrl.split('/').pop()}
                    </a>
                  ) : (
                    <span className={styles.vectorMissing}>Vector soft-copy (.AI/.EPS) not uploaded</span>
                  )}
                </div>

                {item.revisionNote && (
                  <div className={styles.revisionAlert}>
                    <AlertCircle size={13} color="#E11D48" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>Revision Notes:</strong> &quot;{item.revisionNote}&quot;
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.actionBtnPrimary}
                  onClick={() => handleOpenUpload(item)}
                >
                  Edit / Upload Proof
                </button>
                <button
                  type="button"
                  className={`${styles.actionBtnOutline} ${item.whatsappNotificationSent ? styles.whatsappSent : ''}`}
                  onClick={() => handleSendWhatsApp(item)}
                >
                  <Send size={12} />
                  <span>{item.whatsappNotificationSent ? 'Resend WhatsApp' : 'WhatsApp Link'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className="logistics-id">#{selectedOrder.orderId}</span>
                <h2 style={{ fontSize: '16px', marginTop: '2px', color: '#0F172A' }}>Configure Production Proof</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ fontSize: '16px', color: 'var(--color-text-subtle)' }}>✕</button>
            </div>

            <form onSubmit={handleUpdateMockup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className={styles.label}>Mockup Image URL</label>
                <input
                  type="text"
                  value={mockupUrlText}
                  onChange={e => setMockupUrlText(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div>
                <label className={styles.label}>Soft Copy Vector URL (.AI, .EPS, .CDR)</label>
                <input
                  type="text"
                  placeholder="https://designs.teepresso.com/client-asset.ai"
                  value={softCopyUrlText}
                  onChange={e => setSoftCopyUrlText(e.target.value)}
                  className={styles.input}
                />
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                  This vector design file download is only visible to the internal editorial team.
                </span>
              </div>

              <div>
                <label className={styles.label}>Approval Status</label>
                <select
                  value={mockupStatusText}
                  onChange={e => setMockupStatusText(e.target.value as any)}
                  className={styles.select}
                >
                  <option value="Pending Editing">Pending Editing</option>
                  <option value="Customer Approval Pending">Customer Approval Pending</option>
                  <option value="Approved">Approved (Removes Watermark & Approves Stage)</option>
                  <option value="Revision Requested">Revision Requested</option>
                </select>
              </div>

              {statusMsg && (
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-brand-primary)' }}>
                  {statusMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '6px 16px', borderRadius: '6px', background: 'var(--color-brand-primary)', color: '#fff', fontSize: '13px', fontWeight: 600 }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MockupsQueuePage;
