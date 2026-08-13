import React, { useState, useEffect } from 'react';
import { CheckSquare, FileText, Printer, RefreshCw, Square, Truck, AlertCircle, FileCheck, CheckCircle } from 'lucide-react';
import styles from './DispatchPage.module.css';

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  orgName: string;
  productName: string;
  totalPieces: number;
  totalAmount: number;
  currentStage: string;
  estimatedDelivery: string;
  isUrgent: boolean;
  notes: string;
  dispatchDetails: {
    pieceCountVerified: boolean;
    qualityPassed: boolean;
    shippingLabelGenerated: boolean;
    invoiceGenerated: boolean;
    shippingPartner: string;
    trackingNumber: string;
    ewayBillNumber?: string;
  };
}

export function DispatchPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // QA Checklist states
  const [qaChecks, setQaChecks] = useState({
    pieceCount: false,
    printPosition: false,
    stitchingPassed: false,
    packagingIroned: false
  });

  const [shippingPartner, setShippingPartner] = useState('Delhivery');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/orders');
      const data = await res.json();
      if (data.success) {
        // filter orders that need dispatch (Approved, Printing, Quality Check, Packed, In Transit)
        const dispatchable = data.orders.filter((o: Order) =>
          ['Approved', 'Printing', 'Quality Check', 'Packed', 'In Transit'].includes(o.currentStage)
        );
        setOrders(dispatchable);
      }
    } catch (err) {
      console.error('Failed to fetch orders for dispatch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setQaChecks({
      pieceCount: order.dispatchDetails.pieceCountVerified,
      printPosition: order.dispatchDetails.qualityPassed,
      stitchingPassed: order.dispatchDetails.qualityPassed,
      packagingIroned: order.dispatchDetails.qualityPassed
    });
    setShippingPartner(order.dispatchDetails.shippingPartner || 'Delhivery');
    setTrackingNumber(order.dispatchDetails.trackingNumber || `TRK-${Math.floor(1000000 + Math.random() * 9000000)}`);
  };

  // Toggle QA Checklist item
  const toggleQaCheck = (key: keyof typeof qaChecks) => {
    setQaChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateFulfillment = async (action: 'verify' | 'invoice' | 'ship') => {
    if (!selectedOrder) return;
    setSubmitting(true);

    try {
      let body: any = {};
      if (action === 'verify') {
        body = {
          pieceCountVerified: qaChecks.pieceCount,
          qualityPassed: qaChecks.printPosition && qaChecks.stitchingPassed && qaChecks.packagingIroned
        };
      } else if (action === 'invoice') {
        body = { invoiceGenerated: true };
      } else if (action === 'ship') {
        body = {
          shippingLabelGenerated: true,
          shippingPartner,
          trackingNumber
        };
      }

      const res = await fetch(`http://localhost:5000/api/v1/orders/${selectedOrder.id}/dispatch`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        // Update stage to Packed if verified, or In Transit if shipped
        let nextStage = selectedOrder.currentStage;
        if (action === 'verify' && body.qualityPassed && body.pieceCountVerified) {
          nextStage = 'Quality Check';
        }
        if (action === 'ship') {
          nextStage = 'In Transit';
        }

        if (nextStage !== selectedOrder.currentStage) {
          await fetch(`http://localhost:5000/api/v1/orders/${selectedOrder.id}/stage`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stage: nextStage })
          });
        }

        // reload data
        await fetchOrders();
        // update local modal view
        const refreshedOrder = data.order;
        refreshedOrder.currentStage = nextStage;
        setSelectedOrder(refreshedOrder);
      }
    } catch (err) {
      console.error('Failed to update dispatch details:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
          <RefreshCw className="animate-spin" size={16} />
          <span>Loading logistics pipeline data...</span>
        </div>
      </div>
    );
  }

  const pendingVerificationCount = orders.filter(o => !o.dispatchDetails.pieceCountVerified || !o.dispatchDetails.qualityPassed).length;

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-title)' }}>Dispatch & Shipping Console</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Quality control checklist, label printers & invoice generation</p>
        </div>
        <button onClick={fetchOrders} className={styles.syncBtn}>
          <RefreshCw size={13} /> Sync Pipeline
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Left Side: Dispatchable Orders List */}
        <div style={{ flex: 1 }}>
          <div className={styles.cardHeaderRow}>
            <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Active Logistics Queue ({orders.length})</h2>
            {pendingVerificationCount > 0 && (
              <span className={styles.alertCountBadge}>
                {pendingVerificationCount} pending QA check
              </span>
            )}
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Apparel Specs</th>
                  <th>Quantity</th>
                  <th>Stage</th>
                  <th>QA Status</th>
                  <th>Documents</th>
                  <th style={{ textAlign: 'right' }}>Fulfill</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                      No orders currently ready in the logistics pipeline.
                    </td>
                  </tr>
                ) : (
                  orders.map(order => {
                    const hasEWay = order.totalAmount > 50000;
                    const isQaDone = order.dispatchDetails.pieceCountVerified && order.dispatchDetails.qualityPassed;
                    return (
                      <tr
                        key={order.id}
                        className={`${styles.row} ${selectedOrder?.id === order.id ? styles.rowSelected : ''}`}
                        onClick={() => handleSelectOrder(order)}
                      >
                        <td>
                          <span className="logistics-id">#{order.orderId}</span>
                          {order.isUrgent && <span className={styles.urgentDot}>⚡</span>}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{order.productName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Amount: ₹{order.totalAmount.toLocaleString('en-IN')}</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{order.totalPieces} Pcs</td>
                        <td>
                          <span className={styles.stageText}>{order.currentStage}</span>
                        </td>
                        <td>
                          {isQaDone ? (
                            <span className={styles.badgeSuccess}>QA PASSED</span>
                          ) : (
                            <span className={styles.badgeWarning}>PENDING QA</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', fontSize: '11px' }}>
                            {order.dispatchDetails.invoiceGenerated && <span title="Invoice Generated">📄</span>}
                            {order.dispatchDetails.shippingLabelGenerated && <span title="Label Generated">🏷️</span>}
                            {hasEWay && order.dispatchDetails.ewayBillNumber && <span title="E-Way Bill Generated">⚡</span>}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className={styles.selectBtn}>
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Selected Order Fulfillment Panel */}
        {selectedOrder ? (
          <div className={styles.fulfillmentPanel}>
            <div className={styles.panelHeader}>
              <div>
                <span className="logistics-id">#{selectedOrder.orderId}</span>
                <h2 style={{ fontSize: '16px', color: 'var(--color-text-title)' }}>{selectedOrder.customerName}</h2>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{selectedOrder.orgName}</span>
              </div>
            </div>

            <div className={styles.panelBody}>
              {/* Order Info Summary */}
              <div className={styles.infoSummaryGrid}>
                <div>
                  <div className={styles.label}>Product Spec</div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedOrder.productName}</div>
                </div>
                <div>
                  <div className={styles.label}>Batch Volume</div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedOrder.totalPieces} Pieces</div>
                </div>
              </div>

              {/* Step 1: Piece Count & Quality Verification */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <FileCheck size={15} color="var(--color-brand-primary)" />
                  <h3 style={{ fontSize: '13px', fontWeight: 600 }}>1. Verification & Quality Checklist</h3>
                </div>

                <div className={styles.checkboxList}>
                  <div className={styles.checkboxRow} onClick={() => toggleQaCheck('pieceCount')}>
                    {qaChecks.pieceCount ? <CheckSquare size={16} color="var(--color-brand-primary)" /> : <Square size={16} />}
                    <span>Verify piece count matching invoice ({selectedOrder.totalPieces} Pcs)</span>
                  </div>

                  <div className={styles.checkboxRow} onClick={() => toggleQaCheck('printPosition')}>
                    {qaChecks.printPosition ? <CheckSquare size={16} color="var(--color-brand-primary)" /> : <Square size={16} />}
                    <span>Confirm print positioning and color alignment against mockup</span>
                  </div>

                  <div className={styles.checkboxRow} onClick={() => toggleQaCheck('stitchingPassed')}>
                    {qaChecks.stitchingPassed ? <CheckSquare size={16} color="var(--color-brand-primary)" /> : <Square size={16} />}
                    <span>Inspect stitching seams, hem lines, and neck bindings</span>
                  </div>

                  <div className={styles.checkboxRow} onClick={() => toggleQaCheck('packagingIroned')}>
                    {qaChecks.packagingIroned ? <CheckSquare size={16} color="var(--color-brand-primary)" /> : <Square size={16} />}
                    <span>Ensure products are ironed and individually plastic-wrapped</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpdateFulfillment('verify')}
                  className={styles.primaryActionBtn}
                  disabled={submitting}
                >
                  Save QA Verification Status
                </button>
              </div>

              {/* Step 2: Invoices & Shipping Labels */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <FileText size={15} color="var(--color-brand-primary)" />
                  <h3 style={{ fontSize: '13px', fontWeight: 600 }}>2. Document Generation</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Invoice */}
                  <div className={styles.documentRow}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '12px' }}>Customer Tax Invoice</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {selectedOrder.dispatchDetails.invoiceGenerated ? 'Generated & printed' : 'Awaiting invoice generation'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateFulfillment('invoice')}
                      className={styles.docBtn}
                    >
                      <Printer size={12} /> {selectedOrder.dispatchDetails.invoiceGenerated ? 'Reprint' : 'Generate & Print'}
                    </button>
                  </div>

                  {/* Shipping Label */}
                  <div className={styles.documentRow}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '12px' }}>Courier Shipping Label</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {selectedOrder.dispatchDetails.shippingLabelGenerated ? 'Generated & barcode assigned' : 'Awaiting courier label'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateFulfillment('ship')}
                      className={styles.docBtn}
                      disabled={!selectedOrder.dispatchDetails.pieceCountVerified || !selectedOrder.dispatchDetails.qualityPassed}
                      title={(!selectedOrder.dispatchDetails.pieceCountVerified || !selectedOrder.dispatchDetails.qualityPassed) ? 'Must complete QA first' : ''}
                    >
                      <Printer size={12} /> {selectedOrder.dispatchDetails.shippingLabelGenerated ? 'Reprint' : 'Generate Label'}
                    </button>
                  </div>

                  {/* Automatic E-Way Bill Rule */}
                  {selectedOrder.totalAmount > 50000 && (
                    <div className={styles.ewayBillContainer}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <AlertCircle size={15} color="#D97706" style={{ marginTop: '2px' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '12px', color: '#B45309' }}>E-Way Bill Compliance</div>
                          <div style={{ fontSize: '11px', color: '#B45309', marginBottom: '8px' }}>
                            Order value exceeds ₹50,000 threshold. National E-Way bill mandatory.
                          </div>

                          {selectedOrder.dispatchDetails.ewayBillNumber ? (
                            <div className={styles.ewayBadge}>
                              <strong>EWB-ID:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedOrder.dispatchDetails.ewayBillNumber}</span>
                            </div>
                          ) : (
                            <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#64748B' }}>
                              E-Way Bill will be automatically generated upon printing shipping label.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Dispatch Shipping Details */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <Truck size={15} color="var(--color-brand-primary)" />
                  <h3 style={{ fontSize: '13px', fontWeight: 600 }}>3. Shipment Booking</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                  <div>
                    <label className={styles.label}>Shipping Partner</label>
                    <select
                      value={shippingPartner}
                      onChange={e => setShippingPartner(e.target.value)}
                      className={styles.select}
                      disabled={selectedOrder.currentStage === 'Delivered'}
                    >
                      <option value="Delhivery">Delhivery Express</option>
                      <option value="BlueDart">BlueDart Logistics</option>
                      <option value="DTDC">DTDC Secure Cargo</option>
                      <option value="DHL">DHL Express</option>
                    </select>
                  </div>

                  <div>
                    <label className={styles.label}>Tracking AWB Number</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={e => setTrackingNumber(e.target.value)}
                      className={styles.input}
                      disabled={selectedOrder.currentStage === 'Delivered'}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUpdateFulfillment('ship')}
                    className={styles.dispatchActionBtn}
                    disabled={submitting || !selectedOrder.dispatchDetails.pieceCountVerified || !selectedOrder.dispatchDetails.qualityPassed}
                  >
                    Confirm Courier Dispatch
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.noSelectionCard}>
            <Truck size={36} color="var(--color-text-subtle)" style={{ marginBottom: '12px' }} />
            <h3>Logistics Inspection Panel</h3>
            <p>Select an active batch order from the left table queue to run piece count checklists, print packaging slips, or review E-Way compliance certificates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default DispatchPage;
