import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/features/cart/context/CartContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { CheckCircle, ShieldCheck, ArrowLeft, Mic, Lock, X, LogIn, UserPlus } from 'lucide-react';
import styles from './CheckoutPage.module.css';
import { API_BASE_URL } from '@/common/config/api';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated, setUserSession } = useAuth();

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    organization: ''
  });

  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [customNotes, setCustomNotes] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login / Register Modal Gate State (when guest clicks Confirm & Submit Order)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerInfo(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [isAuthenticated, user]);

  if (cart.items.length === 0 && !orderComplete) {
    return (
      <div className={styles.pageContainer} style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>Your cart is empty</h2>
        <Link to="/products" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Continue Shopping</Link>
      </div>
    );
  }

  const urgentFee = isUrgent ? Math.round(cart.subtotal * 0.2) : 0;
  const grandTotal = cart.subtotal + urgentFee;

  // Retrieve voice notes attached to cart items during product configuration
  const itemWithVoice = cart.items.find(i => i.voiceNote || i.artwork?.voiceNote);
  const orderVoiceNote = itemWithVoice?.voiceNote || itemWithVoice?.artwork?.voiceNote || null;
  const orderVoiceNoteDuration = itemWithVoice?.voiceNoteDuration || itemWithVoice?.artwork?.voiceNoteDuration || null;

  const submitOrder = async (overrideUser?: { name: string; email: string; phone: string }) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const activeName = (overrideUser?.name || customerInfo.name).trim();
    const activeEmail = (overrideUser?.email || customerInfo.email).trim();
    const activePhone = (overrideUser?.phone || customerInfo.phone).trim();

    // Format all multi-item cart entries cleanly for database JSONB storage
    const formattedItems = cart.items.map(item => ({
      id: item.id,
      productName: item.name,
      category: item.category || 'Custom Apparel',
      totalPieces: item.totalItemQuantity,
      unitPrice: Math.round(item.totalItemPrice / (item.totalItemQuantity || 1)),
      totalPrice: item.totalItemPrice,
      color: item.colorVariants?.[0]?.color || 'Default',
      colorHex: item.colorVariants?.[0]?.colorHex || '#FFFFFF',
      size: Object.keys(item.colorVariants?.[0]?.sizes || {}).find(k => (item.colorVariants[0].sizes[k] || 0) > 0) || 'M',
      sizes: item.colorVariants?.[0]?.sizes || {},
      quantity: item.totalItemQuantity,
      artworkMode: item.artwork?.mode || 'none',
      placements: item.artwork?.placements || {},
      voiceNote: item.voiceNote || item.artwork?.voiceNote || null,
      voiceNoteDuration: item.voiceNoteDuration || item.artwork?.voiceNoteDuration || null,
    }));

    const totalPieces = cart.items.reduce((sum, item) => sum + item.totalItemQuantity, 0);

    const notesContent = customNotes.trim()
      ? `${customNotes.trim()}${isUrgent ? ' [URGENT PROCESSING REQUESTED]' : ''}`
      : `Online Order placed via Storefront Checkout. ${isUrgent ? '[URGENT PROCESSING REQUESTED]' : ''}`;

    const payload = {
      customerName: activeName,
      email: activeEmail,
      phone: activePhone,
      orgName: customerInfo.organization.trim() || 'Individual',
      orgType: 'Individual',
      productName: cart.items.length === 1 ? cart.items[0].name : `${cart.items[0].name} (+${cart.items.length - 1} more items)`,
      category: cart.items[0]?.category || 'Bulk Order',
      totalPieces,
      totalAmount: grandTotal,
      isUrgent,
      items: formattedItems,
      deliveryAddress: `${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.state} - ${deliveryInfo.pincode}`,
      notes: notesContent,
      voiceNote: orderVoiceNote,
      voiceNoteDuration: orderVoiceNoteDuration
    };

    try {
      const res = await fetch(`${API_BASE_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.order) {
        setConfirmedOrderId(data.order.orderId || data.order.id);
        setOrderComplete(true);
        clearCart();
      } else {
        setErrorMessage(data.message || 'Failed to submit order to database.');
      }
    } catch (err) {
      console.error('Checkout API error:', err);
      setErrorMessage('Network error while placing order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthName(customerInfo.name);
      setAuthPhone(customerInfo.phone);
      setAuthEmail(customerInfo.email);
      setAuthError(null);
      setShowAuthModal(true);
      return;
    }
    await submitOrder();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const endpoint = authMode === 'login' ? `${API_BASE_URL}/auth/login` : `${API_BASE_URL}/auth/register`;
      const bodyPayload = authMode === 'login'
        ? { emailOrPhone: authEmail.trim(), password: authPassword }
        : { name: authName.trim(), email: authEmail.trim(), phone: authPhone.trim(), password: authPassword };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();

      if (data.success && data.user) {
        const loggedUser = {
          id: data.user.id,
          name: data.user.name || authName || customerInfo.name || 'Customer',
          email: data.user.email || authEmail || customerInfo.email,
          phone: data.user.phone || authPhone || customerInfo.phone || '',
          role: data.user.role || 'customer'
        };
        setUserSession(loggedUser);
        setShowAuthModal(false);
        await submitOrder(loggedUser);
      } else {
        setAuthError(data.message || (authMode === 'login' ? 'Invalid email/phone or password' : 'Registration failed'));
      }
    } catch {
      setAuthError('Network error connecting to authentication service.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className={styles.pageContainer} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '24px', textAlign: 'center' }}>
        <CheckCircle size={80} color="#10b981" style={{ margin: '0 auto 24px auto', display: 'block' }} />
        <h1 style={{ marginBottom: '16px', fontSize: 'clamp(24px, 5vw, 32px)', lineHeight: '1.2' }}>Order Confirmed!<br/>({confirmedOrderId})</h1>
        <p style={{ color: '#666', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px auto', lineHeight: '1.5' }}>
          Thank you for choosing Teepresso. We have received your order details and saved it to your account.
          <br/><br/>
          Our design team will review your specs and send proofing mockups shortly.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
          <Link to="/my-orders" className="btn-primary" style={{ padding: '14px 24px', textDecoration: 'none', borderRadius: '8px', backgroundColor: 'var(--color-primary-600)', color: '#fff', fontWeight: 600, width: '100%', boxSizing: 'border-box' }}>
            View My Orders
          </Link>
          <Link to="/products" className="btn-secondary" style={{ padding: '14px 24px', textDecoration: 'none', borderRadius: '8px', border: '1px solid #ccc', color: '#1a1a1a', fontWeight: 600, width: '100%', boxSizing: 'border-box' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        
        <button className="btn-link" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back to Cart
        </button>

        {errorMessage && (
          <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '24px', fontWeight: 600 }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.checkoutLayout}>
          
          <div className={styles.checkoutForm}>
            
            {!isAuthenticated && (
              <div className={styles.sectionBlock} style={{ background: '#f9fafb', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0' }}>Already have an account?</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Log in to automatically save this order to your history.</p>
                  </div>
                  <Link to="/login?redirect=/checkout" className="btn-secondary" style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '6px', color: '#1a1a1a', textDecoration: 'none', fontWeight: 600 }}>Log In</Link>
                </div>
              </div>
            )}

            <div className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>Customer Details</h2>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Full Name *</label>
                  <input required value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Email Address *</label>
                  <input type="email" required value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Phone Number *</label>
                  <input type="tel" required value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Organization / Group Name</label>
                  <input value={customerInfo.organization} onChange={e => setCustomerInfo({...customerInfo, organization: e.target.value})} />
                </div>
              </div>
            </div>

            <div className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>Delivery Address</h2>
              <div className={styles.formGrid}>
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label>Full Address *</label>
                  <input required value={deliveryInfo.address} onChange={e => setDeliveryInfo({...deliveryInfo, address: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>City *</label>
                  <input required value={deliveryInfo.city} onChange={e => setDeliveryInfo({...deliveryInfo, city: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>State *</label>
                  <input required value={deliveryInfo.state} onChange={e => setDeliveryInfo({...deliveryInfo, state: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Pincode *</label>
                  <input required value={deliveryInfo.pincode} onChange={e => setDeliveryInfo({...deliveryInfo, pincode: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Customization & Additional Instructions */}
            <div className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>Customization & Delivery Instructions</h2>
              
              {orderVoiceNote && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #DCFCE7',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '14px',
                  fontSize: '13px',
                  color: '#15803D',
                  fontWeight: 600
                }}>
                  <Mic size={16} />
                  <span>
                    Voice Note recorded during product customisation is attached with this order
                    {orderVoiceNoteDuration ? ` (${Math.floor(orderVoiceNoteDuration / 60)}:${(orderVoiceNoteDuration % 60).toString().padStart(2, '0')})` : ''}
                  </span>
                </div>
              )}

              <div className={styles.inputGroup}>
                <label>Additional Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={e => setCustomNotes(e.target.value)}
                  placeholder="Any final delivery remarks, billing requirements, or special packaging notes..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #E5E7EB)',
                    fontSize: '13.5px',
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>Processing Speed</h2>
              <label className={styles.urgentToggle}>
                <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} />
                <div>
                  <h4>Add Urgent Processing</h4>
                  <p>Fast-track your order for an additional 20% fee. Best for last-minute events.</p>
                </div>
              </label>
            </div>

          </div>

          <div className={styles.checkoutSummary}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            
            <div style={{ marginBottom: '24px' }}>
              {cart.items.map(item => (
                <div key={item.id} className={styles.summaryItem} style={{ flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{item.totalItemQuantity}x {item.name}</strong>
                    <span>₹{item.totalItemPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.85rem', color: '#6b7280' }}>
                    <span>
                      {item.artwork.mode === 'has_design' ? '✓ Design Attached' : item.artwork.mode === 'need_help' ? '✓ Design Help Requested' : 'No Design'}
                    </span>
                    {(item.voiceNote || item.artwork?.voiceNote) && (
                      <span style={{ color: '#15803D', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Mic size={12} /> Voice Note Attached
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summaryDivider} />

            <div className={styles.summaryItem}>
              <span>Subtotal</span>
              <span>₹{cart.subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            {isUrgent && (
              <div className={styles.summaryItem}>
                <span style={{ color: '#a16207' }}>Urgent Processing (+20%)</span>
                <span style={{ color: '#a16207' }}>₹{urgentFee.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className={styles.summaryDivider} />

            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting Order...' : 'Confirm & Submit Order'} <ShieldCheck size={20} />
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', marginTop: '16px' }}>
              Saved directly to your customer account and linked with production queue.
            </p>
          </div>

        </form>
      </div>

      {/* Sign In / Register Modal Gate on Order Confirmation */}
      {showAuthModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(25, 16, 12, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '420px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              border: '1px solid #EFEAE4',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              aria-label="Close login modal"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#77716D'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F6E8DE', color: '#482719', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#482719' }}>
                  Sign In to Place Order
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#6E655F' }}>
                  Please log in or create an account to confirm your custom order.
                </p>
              </div>
            </div>

            {/* Auth Mode Toggle */}
            <div style={{ display: 'flex', gap: '6px', backgroundColor: '#FCF8F4', padding: '4px', borderRadius: '9999px', border: '1px solid #EFEAE4', margin: '16px 0' }}>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(null); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: authMode === 'login' ? '#482719' : 'transparent',
                  color: authMode === 'login' ? '#FFFFFF' : '#6E655F'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setAuthError(null); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: authMode === 'register' ? '#482719' : 'transparent',
                  color: authMode === 'register' ? '#FFFFFF' : '#6E655F'
                }}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '10px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, marginBottom: '12px' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {authMode === 'register' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482719', marginBottom: '4px' }}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={e => setAuthName(e.target.value)}
                      placeholder="Your full name"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6CCC2', fontSize: '13.5px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482719', marginBottom: '4px' }}>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={authPhone}
                      onChange={e => setAuthPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6CCC2', fontSize: '13.5px', boxSizing: 'border-box' }}
                    />
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482719', marginBottom: '4px' }}>
                  {authMode === 'login' ? 'Email or Phone Number *' : 'Email Address *'}
                </label>
                <input
                  type={authMode === 'login' ? 'text' : 'email'}
                  required
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  placeholder={authMode === 'login' ? 'you@example.com or 9876543210' : 'you@example.com'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6CCC2', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482719', marginBottom: '4px' }}>Password *</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6CCC2', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  marginTop: '6px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: '#482719',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: authLoading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {authMode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
                <span>
                  {authLoading
                    ? 'Authenticating...'
                    : authMode === 'login'
                      ? 'Sign In & Place Order'
                      : 'Create Account & Place Order'}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
