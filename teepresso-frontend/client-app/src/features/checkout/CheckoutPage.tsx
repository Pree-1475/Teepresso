'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/features/cart/context/CartContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import styles from './CheckoutPage.module.css';
import { ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';

export function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerInfo(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
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
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderComplete(true);
      clearCart();
    }, 1500);
  };

  if (orderComplete) {
    return (
      <div className={styles.pageContainer} style={{ textAlign: 'center', paddingTop: '100px' }}>
        <CheckCircle size={64} color="#10b981" style={{ marginBottom: '24px' }} />
        <h1 style={{ marginBottom: '16px' }}>Order Confirmed!</h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          Thank you for choosing Teepresso. We have received your order details.<br/>
          Our team will review your designs and get in touch shortly.
        </p>
        <Link to="/" className="btn-primary">Return Home</Link>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        
        <button className="btn-link" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back to Cart
        </button>

        <form onSubmit={handleSubmit} className={styles.checkoutLayout}>
          
          <div className={styles.checkoutForm}>
            
            {!isAuthenticated && (
              <div className={styles.sectionBlock} style={{ background: '#f9fafb', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0' }}>Already have an account?</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Log in for faster checkout.</p>
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
              {isSubmitting ? 'Processing...' : 'Confirm Order'} <ShieldCheck size={20} />
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', marginTop: '16px' }}>
              By confirming your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CheckoutPage;
