import React, { useState, useEffect } from 'react';
import { QrCode, FileText, Printer, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';
import styles from './OfflineOrdersPage.module.css';

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  orgName: string;
  productName: string;
  category: string;
  totalPieces: number;
  totalAmount: number;
  currentStage: string;
  paymentStatus: 'Paid' | 'Pending';
  orderDate: string;
}

export function OfflineOrdersPage() {
  const [offlineOrders, setOfflineOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // QR Code Collection state
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // New Order Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [orgName, setOrgName] = useState('');
  const [productName, setProductName] = useState('Heavyweight Oversized Streetwear Tee');
  const [totalPieces, setTotalPieces] = useState(50);
  const [unitPrice, setUnitPrice] = useState(349);
  const [notes, setNotes] = useState('');

  const fetchOfflineOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/orders');
      const data = await res.json();
      if (data.success) {
        // filter offline orders
        const offline = data.orders.filter((o: any) => o.orgType === 'Offline');
        setOfflineOrders(offline);
      }
    } catch (err) {
      console.error('Failed to fetch offline orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfflineOrders();
  }, []);

  const handleCreateOfflineOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = totalPieces * unitPrice;
    const category = productName.includes('Tee') ? 'T-Shirts' : productName.includes('Polo') ? 'Polos' : productName.includes('Kurta') ? 'Kurtas' : 'Hoodies';

    try {
      const res = await fetch('http://localhost:5000/api/v1/orders/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone,
          orgName,
          productName,
          category,
          totalPieces,
          totalAmount,
          notes
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowAddForm(false);
        // Reset fields
        setCustomerName('');
        setPhone('');
        setOrgName('');
        setNotes('');
        fetchOfflineOrders();
      }
    } catch (err) {
      console.error('Failed to create offline order:', err);
    }
  };

  const handleLoadQR = async (order: Order) => {
    setPaymentLoading(true);
    setQrUrl(null);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/orders/${order.id}/payment-qr`);
      const data = await res.json();
      if (data.success) {
        setQrUrl(data.qrUrl);
      }
    } catch (err) {
      console.error('Failed to load QR payment code:', err);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleConfirmPayment = async (order: Order) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/orders/${order.id}/confirm-payment`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        fetchOfflineOrders();
        // Update local status
        setSelectedOrder(prev => prev ? { ...prev, paymentStatus: 'Paid' } : null);
      }
    } catch (err) {
      console.error('Confirm payment failed:', err);
    }
  };

  // Bill computations
  const getBillBreakdown = (amount: number) => {
    const subtotal = Math.round(amount / 1.18);
    const gst = amount - subtotal;
    return { subtotal, gst, total: amount };
  };

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-title)' }}>Offline Order Management</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Register walk-in clients, collect UPI QR payments & print instant billing slips</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowAddForm(true)} className={styles.addBtn}>
            <Plus size={13} /> Create Offline Order
          </button>
          <button onClick={fetchOfflineOrders} className={styles.syncBtn}>
            <RefreshCw size={13} /> Sync List
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Left Side: Offline orders list */}
        <div style={{ flex: 1 }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Apparel Specifications</th>
                  <th>Quantity</th>
                  <th>Total Due</th>
                  <th>Payment Status</th>
                  <th style={{ textAlign: 'right' }}>Checkout</th>
                </tr>
              </thead>
              <tbody>
                {offlineOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                      No offline orders logged.
                    </td>
                  </tr>
                ) : (
                  offlineOrders.map(order => (
                    <tr
                      key={order.id}
                      className={`${styles.row} ${selectedOrder?.id === order.id ? styles.rowSelected : ''}`}
                      onClick={() => {
                        setSelectedOrder(order);
                        setQrUrl(null);
                      }}
                    >
                      <td>
                        <span className="logistics-id">#{order.orderId}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-title)' }}>{order.customerName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{order.phone}</div>
                      </td>
                      <td>
                        <div>{order.productName}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{order.totalPieces} Pcs</td>
                      <td style={{ fontWeight: 700, color: '#0F172A' }}>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                      <td>
                        {order.paymentStatus === 'Paid' ? (
                          <span className={styles.badgePaid}>PAID</span>
                        ) : (
                          <span className={styles.badgePending}>COLLECTION PENDING</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className={styles.selectBtn}>
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Selected checkout panel */}
        {selectedOrder ? (
          <div className={styles.checkoutPanel}>
            <div className={styles.panelHeader}>
              <div>
                <span className="logistics-id">#{selectedOrder.orderId}</span>
                <h2 style={{ fontSize: '15px', color: 'var(--color-text-title)' }}>{selectedOrder.customerName}</h2>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{selectedOrder.phone}</div>
              </div>
            </div>

            <div className={styles.panelBody}>
              {/* Payment Section */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <QrCode size={14} color="var(--color-brand-primary)" />
                  <h3 style={{ fontSize: '12px', fontWeight: 600 }}>QR Payment Collection</h3>
                </div>

                {selectedOrder.paymentStatus === 'Paid' ? (
                  <div className={styles.paymentSuccessBox}>
                    <CheckCircle2 size={24} color="#059669" />
                    <div>
                      <strong style={{ color: '#047857', fontSize: '13px' }}>Payment Completed</strong>
                      <div style={{ fontSize: '11px', color: '#065F46' }}>Verified in internal ledger database.</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    {qrUrl ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <img src={qrUrl} alt="UPI Payment QR Code" className={styles.qrImg} />
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          Scan to pay <strong>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</strong> to Teepresso Business UPI
                        </span>
                        <button
                          type="button"
                          onClick={() => handleConfirmPayment(selectedOrder)}
                          className={styles.confirmPayBtn}
                        >
                          Confirm Offline Cash/UPI Received
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleLoadQR(selectedOrder)}
                        className={styles.primaryActionBtn}
                        disabled={paymentLoading}
                      >
                        {paymentLoading ? 'Generating QR Code...' : 'Generate Payment QR'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Automatic Bill Generation */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <FileText size={14} color="var(--color-brand-primary)" />
                  <h3 style={{ fontSize: '12px', fontWeight: 600 }}>Tax Invoice / Bill Preview</h3>
                </div>

                {(() => {
                  const bill = getBillBreakdown(selectedOrder.totalAmount);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Subtotal (Excl. Tax)</span>
                        <span>₹{bill.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>CGST + SGST (18%)</span>
                        <span>₹{bill.gst.toLocaleString('en-IN')}</span>
                      </div>
                      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span>Total Due</span>
                        <span style={{ color: 'var(--color-brand-primary)' }}>₹{bill.total.toLocaleString('en-IN')}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className={styles.printBtn}
                        disabled={selectedOrder.paymentStatus !== 'Paid'}
                        title={selectedOrder.paymentStatus !== 'Paid' ? 'Must collect payment before generating invoice' : ''}
                      >
                        <Printer size={12} /> Print Tax Bill Receipt
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.noSelectionCard}>
            <QrCode size={36} color="var(--color-text-subtle)" style={{ marginBottom: '12px' }} />
            <h3>Offline Check-out terminal</h3>
            <p>Select an offline order from the left list to fetch client payment QRs or output standard print bills.</p>
          </div>
        )}
      </div>

      {/* Add Offline Order Form Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 style={{ fontSize: '16px', color: '#0F172A' }}>Register Offline Walk-in Order</h2>
              <button className={styles.closeBtn} onClick={() => setShowAddForm(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateOfflineOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label className={styles.label}>Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className={styles.label}>Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={styles.label}>Client Organization / Batch Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Local Sports Club"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div>
                <label className={styles.label}>Apparel Blank Type</label>
                <select
                  value={productName}
                  onChange={e => {
                    setProductName(e.target.value);
                    // Set default prices
                    if (e.target.value.includes('Kurta')) setUnitPrice(399);
                    if (e.target.value.includes('Oversized')) setUnitPrice(349);
                    if (e.target.value.includes('Polo')) setUnitPrice(429);
                    if (e.target.value.includes('Hoodie')) setUnitPrice(799);
                  }}
                  className={styles.select}
                >
                  <option value="Heavyweight Oversized Streetwear Tee">Heavyweight Oversized Streetwear Tee (₹349)</option>
                  <option value="Classic Pique Corporate Polo Shirt">Classic Pique Corporate Polo Shirt (₹429)</option>
                  <option value="Festive & Group Custom Kurta">Festive & Group Custom Kurta (₹399)</option>
                  <option value="Premium Heavyweight Pullover Hoodie">Premium Heavyweight Pullover Hoodie (₹799)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label className={styles.label}>Quantity (Pcs)</label>
                  <input
                    type="number"
                    min={1}
                    value={totalPieces}
                    onChange={e => setTotalPieces(Number(e.target.value))}
                    className={styles.input}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className={styles.label}>Unit Price (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={unitPrice}
                    onChange={e => setUnitPrice(Number(e.target.value))}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={styles.label}>Special Design Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className={styles.textarea}
                  rows={2}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                >
                  Add Offline Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default OfflineOrdersPage;
