import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/features/cart/context/CartContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { CheckCircle, ShieldCheck, ArrowLeft, PackageCheck } from 'lucide-react';
import styles from './CheckoutPage.module.css';
import { API_BASE_URL } from '@/common/config/api';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

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

  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Format all multi-item cart entries cleanly for database JSONB storage
    const formattedItems = cart.items.map(item => ({
      id: item.id,
      productName: item.name,
      category: item.category || 'Custom Apparel',
      totalPieces: item.totalItemQuantity,
      unitPrice: Math.round(item.totalItemPrice / (item.totalItemQuantity || 1)),
      totalPrice: item.totalItemPrice,
      color: item.colorVariants?.[0]?.color || 'Default',
      colorHex: item.colorVariants?.[0]?.color || '',
      artworkMode: item.artwork?.mode || 'none',
      placements: item.artwork?.placements || {}
    }));

    const totalPieces = cart.items.reduce((sum, item) => sum + item.totalItemQuantity, 0);

    const payload = {
      customerName: customerInfo.name.trim(),
      email: customerInfo.email.trim(),
      phone: customerInfo.phone.trim(),
      orgName: customerInfo.organization.trim() || 'Individual',
      orgType: 'Individual',
      productName: cart.items.length === 1 ? cart.items[0].name : `${cart.items[0].name} (+${cart.items.length - 1} more items)`,
      category: cart.items[0]?.category || 'Bulk Order',
      totalPieces,
      totalAmount: grandTotal,
      isUrgent,
      items: formattedItems,
      deliveryAddress: `${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.state} - ${deliveryInfo.pincode}`,
      notes: `Online Order placed via Storefront Checkout. ${isUrgent ? '[URGENT PROCESSING REQUESTED]' : ''}`
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
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    {item.artwork.mode === 'has_design' ? '✓ Design Attached' : item.artwork.mode === 'need_help' ? '✓ Design Help Requested' : 'No Design'}
                  </span>
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
    </div>
  );
}

export default CheckoutPage;
