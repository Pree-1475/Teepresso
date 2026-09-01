import React, { useState, useEffect } from 'react';
import { QrCode, FileText, Printer, Plus, RefreshCw, CheckCircle2, Trash2, X, ShoppingBag, CreditCard, Check, Banknote, Package, Search, AlertTriangle, Grid, ChevronRight } from 'lucide-react';
import styles from './OfflineOrdersPage.module.css';

interface ProductItem {
  id: string;
  name: string;
  price: number;
  category: string;
  shortDesc?: string;
  popularFor?: string;
  requiresColors?: boolean;
  colors?: string[];
  requiresPatterns?: boolean;
  patterns?: string[];
  requiresSizes?: boolean;
  sizes?: string[];
  image?: string;
}

interface PatternSnippet {
  id: string;
  name: string;
  image?: string;
}

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
  items?: POSCartItem[];
}

export interface POSCartItem {
  id: string;
  productId: string;
  productName: string;
  color: string;
  pattern: string;
  size: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export function OfflineOrdersPage() {
  const [offlineOrders, setOfflineOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Products and Merchant Settings from Backend Database
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [patternSnippets, setPatternSnippets] = useState<PatternSnippet[]>([]);
  const [merchantUpiVpa, setMerchantUpiVpa] = useState('teepresso@upi');
  const [merchantPayeeName, setMerchantPayeeName] = useState('Teepresso Enterprise');

  // Catalog Filter State
  const [posSearchQuery, setPosSearchQuery] = useState<string>('');

  // POS Modal State
  const [showAddForm, setShowAddForm] = useState(false);
  const [catalogPickerOpen, setCatalogPickerOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [orgName, setOrgName] = useState('Walk-in Customer');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'CARD'>('UPI');

  // Cart State
  const [cartItems, setCartItems] = useState<POSCartItem[]>([]);

  // Selected Product & Variant Selector State
  const [selectedProdId, setSelectedProdId] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedPattern, setSelectedPattern] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  // QR Modal Payment State
  const [posQrModalOpen, setPosQrModalOpen] = useState(false);
  const [currentBillQr, setCurrentBillQr] = useState<{
    billId: string;
    totalAmount: number;
    upiUrl: string;
    qrImg: string;
    vpa: string;
    pendingOrderId?: string;
  } | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Initial Load
  useEffect(() => {
    fetchOfflineOrders();
    fetchBackendCatalogAndSettings();
  }, []);

  const fetchBackendCatalogAndSettings = async () => {
    try {
      const [prodRes, patRes, setRes] = await Promise.all([
        fetch('http://localhost:5000/api/v1/products').then(r => r.json()).catch(() => ({})),
        fetch('http://localhost:5000/api/v1/patterns').then(r => r.json()).catch(() => ({})),
        fetch('http://localhost:5000/api/v1/settings').then(r => r.json()).catch(() => ({}))
      ]);

      if (prodRes.success && Array.isArray(prodRes.products) && prodRes.products.length > 0) {
        setProductsList(prodRes.products);
        initProductSelection(prodRes.products[0]);
      }

      if (patRes.success && Array.isArray(patRes.patterns)) {
        setPatternSnippets(patRes.patterns);
      }

      if (setRes.success && setRes.settings) {
        if (setRes.settings.upiVpa) setMerchantUpiVpa(setRes.settings.upiVpa);
        if (setRes.settings.payeeName) setMerchantPayeeName(setRes.settings.payeeName);
      }
    } catch (err) {
      console.error('Failed to load products/settings for POS counter:', err);
    }
  };

  const initProductSelection = (product: ProductItem) => {
    setSelectedProdId(product.id);
    setSelectedPrice(product.price || 499);
    setSelectedQty(1);

    // Color variant check
    if (product.requiresColors !== false && Array.isArray(product.colors) && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    } else {
      setSelectedColor('');
    }

    // Pattern variant check
    if (product.requiresPatterns === true && Array.isArray(product.patterns) && product.patterns.length > 0) {
      setSelectedPattern(product.patterns[0]);
    } else {
      setSelectedPattern('');
    }

    // Size variant check
    if (product.requiresSizes !== false && Array.isArray(product.sizes) && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize('');
    }
  };

  const handleProductChange = (prodId: string) => {
    const prod = productsList.find(p => p.id === prodId);
    if (prod) {
      initProductSelection(prod);
    }
  };

  const fetchOfflineOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const offline = data.orders.filter((o: any) => o.orgType === 'Offline');
        setOfflineOrders(offline);
      }
    } catch (err) {
      console.error('Failed to fetch offline orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open Payment QR Popup for Pending Existing Orders
  const handleOpenOrderQrModal = async (order: Order) => {
    let activeVpa = merchantUpiVpa;
    let activePayee = merchantPayeeName;

    try {
      const res = await fetch('http://localhost:5000/api/v1/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        if (data.settings.upiVpa) {
          activeVpa = data.settings.upiVpa;
          setMerchantUpiVpa(data.settings.upiVpa);
        }
        if (data.settings.payeeName) {
          activePayee = data.settings.payeeName;
          setMerchantPayeeName(data.settings.payeeName);
        }
      }
    } catch (err) {
      console.error('Failed to sync UPI settings:', err);
    }

    const upiUrl = `upi://pay?pa=${activeVpa.trim()}&pn=${encodeURIComponent(activePayee.trim() || 'Teepresso')}&am=${order.totalAmount}&tn=Order_${order.orderId}&cu=INR`;
    const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUrl)}`;

    setCurrentBillQr({
      billId: order.orderId,
      totalAmount: order.totalAmount,
      upiUrl,
      qrImg,
      vpa: activeVpa,
      pendingOrderId: order.id
    });
    setPosQrModalOpen(true);
  };

  // Add Variant Item to Cart
  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = productsList.find(p => p.id === selectedProdId);
    if (!prod) return;

    const newItem: POSCartItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      productId: prod.id,
      productName: prod.name,
      color: selectedColor || '',
      pattern: selectedPattern || '',
      size: selectedSize || '',
      qty: Number(selectedQty) > 0 ? Number(selectedQty) : 1,
      unitPrice: Number(selectedPrice) > 0 ? Number(selectedPrice) : prod.price,
      lineTotal: (Number(selectedQty) > 0 ? Number(selectedQty) : 1) * (Number(selectedPrice) > 0 ? Number(selectedPrice) : prod.price)
    };

    setCartItems(prev => [...prev, newItem]);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  // Filtered Products Computation
  const filteredProducts = productsList.filter(p => {
    const query = posSearchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      p.name.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query))
    );
  });

  // Cart Totals
  const grandTotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalPiecesCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // Selected Product Capabilities Check
  const selectedProd = productsList.find(p => p.id === selectedProdId);
  const hasColors = selectedProd ? (selectedProd.requiresColors !== false && Array.isArray(selectedProd.colors) && selectedProd.colors.length > 0) : false;
  const hasPatterns = selectedProd ? (selectedProd.requiresPatterns === true && Array.isArray(selectedProd.patterns) && selectedProd.patterns.length > 0) : false;
  const hasSizes = selectedProd ? (selectedProd.requiresSizes !== false && Array.isArray(selectedProd.sizes) && selectedProd.sizes.length > 0) : false;

  // Generate Payment QR for New Cart Order
  const handleGeneratePaymentQR = async () => {
    if (cartItems.length === 0) {
      alert('Please add at least one product item to the POS cart.');
      return;
    }
    if (!customerName.trim()) {
      alert('Please enter Customer Name.');
      return;
    }

    if (paymentMethod === 'CASH') {
      handleFinalizePOSOrder(true);
      return;
    }

    // Always fetch latest VPA setting from backend database before generating QR
    let activeVpa = merchantUpiVpa;
    let activePayee = merchantPayeeName;

    try {
      const res = await fetch('http://localhost:5000/api/v1/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        if (data.settings.upiVpa) {
          activeVpa = data.settings.upiVpa;
          setMerchantUpiVpa(data.settings.upiVpa);
        }
        if (data.settings.payeeName) {
          activePayee = data.settings.payeeName;
          setMerchantPayeeName(data.settings.payeeName);
        }
      }
    } catch (err) {
      console.error('Failed to sync UPI settings from backend:', err);
    }

    const billId = `POS-${Math.floor(100000 + Math.random() * 900000)}`;
    const upiUrl = `upi://pay?pa=${activeVpa.trim()}&pn=${encodeURIComponent(activePayee.trim() || 'Teepresso')}&am=${grandTotal}&tn=POS-Bill-${billId}&cu=INR`;
    const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUrl)}`;

    setCurrentBillQr({
      billId,
      totalAmount: grandTotal,
      upiUrl,
      qrImg,
      vpa: activeVpa
    });
    setPosQrModalOpen(true);
  };

  // Finalize Order or Confirm Pending Order Payment
  const handleFinalizePOSOrder = async (isPaid: boolean) => {
    setCreatingOrder(true);

    // Case A: Confirming payment for an existing pending order from QR Popup Modal
    if (currentBillQr?.pendingOrderId && isPaid) {
      try {
        const res = await fetch(`http://localhost:5000/api/v1/orders/${currentBillQr.pendingOrderId}/confirm-payment`, {
          method: 'POST'
        });
        const data = await res.json();
        if (data.success) {
          setPosQrModalOpen(false);
          setCurrentBillQr(null);
          setSelectedOrder(prev => prev ? { ...prev, paymentStatus: 'Paid' } : null);
          fetchOfflineOrders();
        } else {
          alert(data.message || 'Failed to confirm payment');
        }
      } catch (err) {
        console.error('Confirm payment failed:', err);
      } finally {
        setCreatingOrder(false);
      }
      return;
    }

    // Case B: Saving a new POS Order from Terminal Modal
    const summaryProductName = cartItems.map(i => {
      const specs = [i.color, i.pattern, i.size].filter(Boolean).join(' / ');
      return `${i.productName}${specs ? ' (' + specs + ')' : ''} x${i.qty}`;
    }).join(', ');

    const primaryCategory = cartItems[0]?.productName.includes('Kurta') ? 'Kurtas' : cartItems[0]?.productName.includes('Polo') ? 'Polos' : 'T-Shirts';

    try {
      const res = await fetch('http://localhost:5000/api/v1/orders/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone,
          orgName: orgName || 'Walk-in Counter',
          productName: summaryProductName,
          category: primaryCategory,
          totalPieces: totalPiecesCount,
          totalAmount: grandTotal,
          paymentStatus: isPaid ? 'Paid' : 'Pending',
          items: cartItems
        })
      });

      const data = await res.json();
      if (data.success) {
        setPosQrModalOpen(false);
        setShowAddForm(false);
        setCartItems([]);
        setCustomerName('');
        setPhone('');
        setOrgName('Walk-in Customer');
        fetchOfflineOrders();
      } else {
        alert(data.message || 'Failed to save POS order');
      }
    } catch (err) {
      console.error('Failed to create POS order:', err);
      alert('Network error while processing POS order');
    } finally {
      setCreatingOrder(false);
    }
  };

  const getBillBreakdown = (amount: number) => {
    const subtotal = Math.round(amount / 1.18);
    const gst = amount - subtotal;
    return { subtotal, gst, total: amount };
  };

  return (
    <div style={{ padding: '24px 32px', background: 'var(--color-canvas-bg)', minHeight: '100vh', color: 'var(--color-text-body)', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0, color: 'var(--color-text-title)' }}>Offline POS Counter Terminal</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)', fontSize: '13px' }}>
            Multi-product checkout counter with dynamic merchant UPI QR payment generation ({merchantUpiVpa}).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 20px',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(5, 122, 120, 0.3)'
            }}
          >
            <Plus size={16} /> New Order
          </button>
          <button
            onClick={fetchOfflineOrders}
            style={{
              background: 'var(--color-surface-white)',
              color: 'var(--color-text-title)',
              border: '1px solid var(--color-border)',
              padding: '10px 20px',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} /> Refresh Directory
          </button>
        </div>
      </div>

      {/* Main Grid: Orders Directory (Left) & Selected Order Receipt Details (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Left Side: Offline orders directory */}
        <div style={{ width: '100%', minWidth: 0 }}>
          {loading ? (
            <div style={{ color: 'var(--color-text-body)' }}>Loading offline orders directory...</div>
          ) : (
            <div className="erp-table-container" style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', overflowX: 'auto' }}>
              <table className="erp-table" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Apparel Specs</th>
                    <th>Quantity</th>
                    <th>Total Due</th>
                    <th>Payment</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {offlineOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                        No offline POS counter orders recorded yet. Click "New Order" above.
                      </td>
                    </tr>
                  ) : (
                    offlineOrders.map((ord) => (
                      <tr 
                        key={ord.id} 
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: selectedOrder?.id === ord.id ? 'var(--color-surface-hover)' : 'transparent' 
                        }}
                        onClick={() => setSelectedOrder(ord)}
                      >
                        <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{ord.orderId}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-title)' }}>{ord.customerName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{ord.phone}</div>
                        </td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ord.productName}</td>
                        <td>{ord.totalPieces} Pcs</td>
                        <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                        <td>
                          <span 
                            style={{ 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              fontSize: '11px', 
                              fontWeight: 600,
                              backgroundColor: ord.paymentStatus === 'Paid' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(230, 126, 34, 0.15)',
                              color: ord.paymentStatus === 'Paid' ? '#27ae60' : '#e67e22'
                            }}
                          >
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(ord);
                              }}
                              style={{ background: 'transparent', border: 'none', color: 'var(--color-primary-light)', cursor: 'pointer', display: 'inline-flex', gap: '4px', alignItems: 'center', fontSize: '12px' }}
                            >
                              <FileText size={14} /> Receipt
                            </button>

                            {ord.paymentStatus === 'Pending' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenOrderQrModal(ord);
                                }}
                                style={{ background: 'rgba(230, 126, 34, 0.2)', border: '1px solid rgba(230, 126, 34, 0.4)', color: '#e67e22', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', display: 'inline-flex', gap: '4px', alignItems: 'center', fontSize: '11px', fontWeight: 600 }}
                              >
                                <QrCode size={13} /> Collect QR
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Receipt Card */}
        <div style={{ width: '100%', minWidth: 0 }}>
          {selectedOrder ? (
            <div style={{ background: 'var(--color-surface-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-text-title)', fontFamily: 'var(--font-mono)' }}>{selectedOrder.orderId}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Date: {selectedOrder.orderDate}</span>
                </div>
                <button
                  onClick={() => window.print()}
                  style={{
                    background: 'var(--color-surface-hover)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-title)',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <Printer size={14} /> Print Receipt
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Customer Name:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-title)' }}>{selectedOrder.customerName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Mobile Phone:</span>
                  <span style={{ color: 'var(--color-text-title)' }}>{selectedOrder.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Org / Walk-in:</span>
                  <span style={{ color: 'var(--color-text-title)' }}>{selectedOrder.orgName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Total Quantity:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-title)' }}>{selectedOrder.totalPieces} Pieces</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Payment Status:</span>
                  <span style={{ fontWeight: 600, color: selectedOrder.paymentStatus === 'Paid' ? '#27ae60' : '#e67e22' }}>{selectedOrder.paymentStatus}</span>
                </div>
              </div>

              {/* Pending Order QR Callout Banner */}
              {selectedOrder.paymentStatus === 'Pending' && (
                <div style={{ backgroundColor: 'rgba(230, 126, 34, 0.12)', border: '1px solid rgba(230, 126, 34, 0.3)', borderRadius: '6px', padding: '14px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#e67e22', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={15} /> Payment Pending (₹{selectedOrder.totalAmount.toLocaleString('en-IN')})
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenOrderQrModal(selectedOrder)}
                    className="erp-btn-primary"
                    style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', marginTop: '4px' }}
                  >
                    <QrCode size={14} /> Open QR
                  </button>
                </div>
              )}

              {/* Tax Breakdown */}
              <div style={{ backgroundColor: 'var(--color-surface-hover)', padding: '16px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Tax Breakdown (18% GST Included)</div>
                {(() => {
                  const bill = getBillBreakdown(selectedOrder.totalAmount);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Taxable Value:</span>
                        <span style={{ color: 'var(--color-text-title)' }}>₹{bill.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>GST (18%):</span>
                        <span style={{ color: 'var(--color-text-title)' }}>₹{bill.gst.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '6px', fontWeight: 700, fontSize: '15px', color: 'var(--color-text-title)' }}>
                        <span>Grand Total Paid:</span>
                        <span style={{ color: 'var(--color-primary-light)', fontFamily: 'var(--font-mono)' }}>₹{bill.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          ) : (
            <div style={{ background: 'var(--color-surface-white)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: '40px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Select an offline order on the left to view receipt and payment tax breakdown.
            </div>
          )}
        </div>

      </div>

      {/* MINIMAL & CLEAN POS TERMINAL MODAL OVERLAY */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'var(--color-surface-white)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            width: '92vw',
            maxWidth: '960px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            color: 'var(--color-text-title)'
          }}>
            
            {/* Modal Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-canvas-bg)' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={18} color="var(--color-primary)" /> New Order Counter Bill
                </h2>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Merchant VPA: <strong style={{ color: 'var(--color-primary-light)', fontFamily: 'var(--font-mono)' }}>{merchantUpiVpa}</strong>
                </span>
              </div>
              <button onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body 2-Column Split Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', flex: 1, overflow: 'hidden' }}>
              
              {/* LEFT COLUMN: Configurator */}
              <div style={{ padding: '20px', borderRight: '1px solid var(--color-border)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Customer Details Block */}
                <div style={{ backgroundColor: 'var(--color-surface-hover)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    1. Customer Information
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: '3px' }}>Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="Customer Name"
                        className={styles.formInput}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: '3px' }}>Mobile Phone *</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        className={styles.formInput}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: '3px' }}>Org / Title</label>
                      <input
                        type="text"
                        value={orgName}
                        onChange={e => setOrgName(e.target.value)}
                        placeholder="Walk-in Customer"
                        className={styles.formInput}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Active Product Selection Card */}
                <div style={{ backgroundColor: 'var(--color-surface-hover)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      2. Catalog Item Selection
                    </span>
                    <button
                      type="button"
                      onClick={() => setCatalogPickerOpen(true)}
                      className="erp-btn-primary"
                      style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <Grid size={13} />
                      <span>Browse Product Catalog...</span>
                    </button>
                  </div>

                  {selectedProd ? (
                    <div style={{ backgroundColor: 'var(--color-canvas-bg)', border: '1px solid var(--color-primary)', borderRadius: '6px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {selectedProd.image ? (
                          <img src={selectedProd.image} alt={selectedProd.name} style={{ width: '38px', height: '38px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--color-border)' }} />
                        ) : (
                          <div style={{ width: '38px', height: '38px', borderRadius: '4px', backgroundColor: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={18} color="var(--color-primary-light)" />
                          </div>
                        )}
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-primary-light)', textTransform: 'uppercase', display: 'block' }}>{selectedProd.category}</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-title)' }}>{selectedProd.name}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary-light)', fontFamily: 'var(--font-mono)' }}>₹{selectedProd.price}</span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>Base Rate</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px', border: '1px dashed var(--color-border)', borderRadius: '6px' }}>
                      No product selected. Click "Browse Product Catalog" above to select an item.
                    </div>
                  )}
                </div>

                {/* Variant Configurator Card */}
                {selectedProd && (
                  <div style={{ backgroundColor: 'var(--color-surface-hover)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Package size={14} color="var(--color-primary)" /> Configure Options for {selectedProd.name}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary-light)', fontFamily: 'var(--font-mono)' }}>Base: ₹{selectedProd.price}</span>
                    </div>

                    <form onSubmit={handleAddToCart} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      
                      {/* Color Swatches */}
                      {hasColors && (
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Color Swatch</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {(selectedProd.colors || []).map(col => {
                              const isSelected = selectedColor === col;
                              const isHex = col.startsWith('#');
                              return (
                                <button
                                  type="button"
                                  key={col}
                                  onClick={() => setSelectedColor(col)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    borderRadius: '16px',
                                    backgroundColor: isSelected ? 'rgba(5, 122, 120, 0.15)' : 'var(--color-canvas-bg)',
                                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    color: 'var(--color-text-title)',
                                    fontSize: '11px',
                                    fontWeight: isSelected ? 700 : 500,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isHex && (
                                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: col, border: '1px solid rgba(0,0,0,0.2)', display: 'inline-block' }} />
                                  )}
                                  <span>{col}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Pattern Buttons */}
                      {hasPatterns && (
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Pattern / Print</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {(selectedProd.patterns || patternSnippets.map(p => p.name)).map(pat => {
                              const isSelected = selectedPattern === pat;
                              return (
                                <button
                                  type="button"
                                  key={pat}
                                  onClick={() => setSelectedPattern(pat)}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    backgroundColor: isSelected ? 'rgba(5, 122, 120, 0.15)' : 'var(--color-canvas-bg)',
                                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    color: 'var(--color-text-title)',
                                    fontSize: '11px',
                                    fontWeight: isSelected ? 700 : 500,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {pat}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Size Pills */}
                      {hasSizes && (
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Size Option</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {(selectedProd.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map(sz => {
                              const isSelected = selectedSize === sz;
                              return (
                                <button
                                  type="button"
                                  key={sz}
                                  onClick={() => setSelectedSize(sz)}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    minWidth: '36px',
                                    backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-canvas-bg)',
                                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    color: isSelected ? '#ffffff' : 'var(--color-text-title)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {sz}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Qty & Price Inputs */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end', marginTop: '4px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>Qty (Pcs)</label>
                          <input
                            type="number"
                            min="1"
                            value={selectedQty}
                            onChange={e => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className={styles.formInput}
                            style={{ textAlign: 'center', fontWeight: 700, padding: '6px 8px' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>Price (₹)</label>
                          <input
                            type="number"
                            min="1"
                            value={selectedPrice}
                            onChange={e => setSelectedPrice(parseInt(e.target.value) || 0)}
                            className={styles.formInput}
                            style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '6px 8px' }}
                          />
                        </div>

                        <button
                          type="submit"
                          className="erp-btn-primary"
                          style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', height: '36px', whiteSpace: 'nowrap' }}
                        >
                          + Add Item
                        </button>
                      </div>

                    </form>
                  </div>
                )}

              </div>

              {/* RIGHT COLUMN: Active Bill Cart & Payment Counter */}
              <div style={{ padding: '20px', backgroundColor: 'var(--color-canvas-bg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                
                <div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-title)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Current Order Cart ({cartItems.length} items • {totalPiecesCount} Pcs)
                  </h3>

                  {cartItems.length === 0 ? (
                    <div style={{ padding: '32px 16px', border: '1px dashed var(--color-border)', borderRadius: '8px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px', backgroundColor: 'var(--color-surface-hover)' }}>
                      No items in bill yet. Select product on the left and click "+ Add Item".
                    </div>
                  ) : (
                    <div className="erp-table-container" style={{ border: '1px solid var(--color-border)', maxHeight: '240px', overflowY: 'auto' }}>
                      <table className="erp-table" style={{ fontSize: '12px' }}>
                        <thead>
                          <tr>
                            <th>Item Specs</th>
                            <th>Qty</th>
                            <th>Total</th>
                            <th style={{ width: '30px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartItems.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <div style={{ fontWeight: 600, color: 'var(--color-text-title)' }}>{item.productName}</div>
                                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                  {[item.color, item.pattern, item.size].filter(Boolean).join(' / ')}
                                </div>
                              </td>
                              <td style={{ fontWeight: 700 }}>{item.qty} Pcs</td>
                              <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-primary-light)' }}>₹{item.lineTotal.toLocaleString('en-IN')}</td>
                              <td>
                                <button
                                  onClick={() => handleRemoveFromCart(item.id)}
                                  style={{ background: 'transparent', border: 'none', color: 'var(--color-status-danger)', cursor: 'pointer', padding: '2px' }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Checkout & Payment Selector Card */}
                <div style={{ backgroundColor: 'var(--color-surface-hover)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', marginTop: '16px' }}>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Payment Mode</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('UPI')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '6px',
                          border: paymentMethod === 'UPI' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                          backgroundColor: paymentMethod === 'UPI' ? 'rgba(5, 122, 120, 0.15)' : 'var(--color-canvas-bg)',
                          color: 'var(--color-text-title)',
                          fontWeight: 600,
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <QrCode size={13} /> Dynamic UPI QR
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CASH')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '6px',
                          border: paymentMethod === 'CASH' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                          backgroundColor: paymentMethod === 'CASH' ? 'rgba(5, 122, 120, 0.15)' : 'var(--color-canvas-bg)',
                          color: 'var(--color-text-title)',
                          fontWeight: 600,
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Banknote size={13} /> Cash Counter
                      </button>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>VPA: <strong style={{ color: 'var(--color-text-title)' }}>{merchantUpiVpa}</strong></div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-title)', marginTop: '4px' }}>
                      Total Due: <span style={{ color: 'var(--color-primary-light)', fontFamily: 'var(--font-mono)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      disabled={cartItems.length === 0 || !customerName.trim()}
                      onClick={handleGeneratePaymentQR}
                      className="erp-btn-primary"
                      style={{ width: '100%', padding: '12px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: (cartItems.length === 0 || !customerName.trim()) ? 'not-allowed' : 'pointer' }}
                    >
                      {paymentMethod === 'UPI' ? <QrCode size={16} /> : <CheckCircle2 size={16} />}
                      <span>{paymentMethod === 'UPI' ? 'Generate UPI Payment QR' : 'Complete Cash Sale'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="erp-btn-secondary"
                      style={{ width: '100%', padding: '8px', fontSize: '11px', cursor: 'pointer', textAlign: 'center' }}
                    >
                      Cancel Session
                    </button>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* MINIMAL & CLEAN PRODUCT CATALOG DIRECTORY POPUP */}
      {catalogPickerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'var(--color-surface-white)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            width: '90vw',
            maxWidth: '780px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            color: 'var(--color-text-title)'
          }}>
            
            {/* Catalog Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-canvas-bg)' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Grid size={16} color="var(--color-primary)" /> Select Product from Catalog
              </h3>
              <button onClick={() => setCatalogPickerOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Clean Full-Width Search Input Bar */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-hover)' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  placeholder="Type to search product name or category (e.g. Kurta, Polo)..."
                  value={posSearchQuery}
                  onChange={e => setPosSearchQuery(e.target.value)}
                  className={styles.formInput}
                  style={{ padding: '8px 12px 8px 34px', fontSize: '12px', width: '100%', boxSizing: 'border-box' }}
                />
                <Search size={15} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {/* Clean Minimalist Product Cards Grid */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {filteredProducts.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  No catalog products match your search.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                  {filteredProducts.map(prod => {
                    const isSelected = selectedProdId === prod.id;
                    return (
                      <div
                        key={prod.id}
                        onClick={() => {
                          handleProductChange(prod.id);
                          setCatalogPickerOpen(false);
                        }}
                        style={{
                          backgroundColor: isSelected ? 'rgba(5, 122, 120, 0.12)' : 'var(--color-surface-hover)',
                          border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                          {prod.image ? (
                            <img src={prod.image} alt={prod.name} style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--color-border)' }} />
                          ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '4px', backgroundColor: 'var(--color-canvas-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Package size={16} color="var(--color-primary-light)" />
                            </div>
                          )}
                          <div style={{ overflow: 'hidden' }}>
                            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--color-text-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</h4>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary-light)', fontFamily: 'var(--font-mono)' }}>₹{prod.price}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface-white)',
                            border: isSelected ? 'none' : '1px solid var(--color-border)',
                            color: isSelected ? '#ffffff' : 'var(--color-text-title)',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* DYNAMIC BACKEND UPI QR PAYMENT MODAL OVERLAY */}
      {posQrModalOpen && currentBillQr && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            backgroundColor: 'var(--color-surface-white)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '440px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            color: 'var(--color-text-title)'
          }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-canvas-bg)' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-title)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={16} color="var(--color-primary)" /> Dynamic UPI Payment QR
              </h3>
              <button onClick={() => setPosQrModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Merchant Payee: <strong>{merchantPayeeName}</strong></div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-light)', fontFamily: 'var(--font-mono)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CreditCard size={13} /> {currentBillQr.vpa}
              </div>

              {/* Dynamic QR Image */}
              <div style={{ padding: '12px', backgroundColor: '#ffffff', border: '2px solid var(--color-border)', borderRadius: '12px', boxShadow: 'var(--shadow-md)', marginBottom: '16px' }}>
                <img 
                  src={currentBillQr.qrImg} 
                  alt="Dynamic UPI QR Code" 
                  style={{ width: '220px', height: '220px', display: 'block' }}
                />
              </div>

              {/* Amount Display */}
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-light)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                ₹{currentBillQr.totalAmount.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                Scan using BHIM, GPay, PhonePe, or Paytm to pay exact custom bill amount.
              </span>

              {/* Action Buttons */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  disabled={creatingOrder}
                  onClick={() => handleFinalizePOSOrder(true)}
                  className="erp-btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '13px', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <CheckCircle2 size={16} />
                  <span>{creatingOrder ? 'Finalizing Sale...' : 'Confirm Payment Received & Complete Sale'}</span>
                </button>

                <button
                  type="button"
                  disabled={creatingOrder}
                  onClick={() => handleFinalizePOSOrder(false)}
                  className="erp-btn-secondary"
                  style={{ width: '100%', padding: '8px', fontSize: '12px', cursor: 'pointer' }}
                >
                  Mark as Payment Pending & Save Order
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default OfflineOrdersPage;
