'use client';

import React, { useState } from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { 
  CheckCircle2, 
  ArrowLeft, 
  ShoppingBag, 
  User, 
  Phone, 
  Mail, 
  Building, 
  MapPin, 
  Edit2,
  Zap,
  Sparkles
} from 'lucide-react';
import styles from './Step.module.css';

export function Step4ReviewAndOrder() {
  const { 
    state, 
    totalPieces, 
    subtotal, 
    urgentFee, 
    grandTotal, 
    updateDelivery,
    toggleUrgentOrder,
    setStep,
    completePayment, 
    resetOrder,
    prevStep 
  } = useOrderFlow();

  const { 
    items, 
    customer, 
    delivery, 
    isUrgentOrder, 
    paymentCompleted, 
    orderId 
  } = state;

  const [submittedId, setSubmittedId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivery.address || !delivery.city) {
      alert('Please enter your delivery street address and city.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedId = completePayment();
      setSubmittedId(generatedId);
      setIsSubmitting(false);
    }, 800);
  };

  const customizableItems = items.filter(item => item.requiresMockup);

  // Render Confirmation Screen after success
  if (paymentCompleted || submittedId) {
    return (
      <div className={styles.stepCard}>
        <div className={styles.successStateContainer}>
          <div className={styles.successIconCircle}>
            <CheckCircle2 size={48} color="#ffffff" />
          </div>
          <h2 className={styles.successTitle}>Order Placed</h2>
          <p className={styles.successSubtitle}>
            Thank you, <strong>{customer.name || 'Customer'}</strong>. Your order has been recorded.
          </p>

          <div className={styles.orderBadgeBox}>
            <span className={styles.orderIdLabel}>Order Reference ID</span>
            <span className={styles.orderIdValue}>{orderId || submittedId || 'TP-2026-9812'}</span>
          </div>

          <div className={styles.successInfoGrid}>
            <div className={styles.successInfoCard}>
              <h4><ShoppingBag size={16} /> Selected Apparel</h4>
              <p>{totalPieces} Pcs Total</p>
            </div>
            <div className={styles.successInfoCard}>
              <h4><MapPin size={16} /> Delivery Destination</h4>
              <p>{delivery.address}, {delivery.city}</p>
            </div>
          </div>

          <p className={styles.nextStepsNotice}>
            We will call you at <strong>{customer.phone}</strong> within 2 hours to confirm.
          </p>

          <div className={styles.actionRowCenter} style={{ gap: '16px', flexWrap: 'wrap' }}>
            <button 
              type="button"
              className={styles.primaryBtnLarge} 
              onClick={() => window.location.href = '/track-order'}
            >
              Track Order Status <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button 
              type="button"
              className={styles.secondaryBtn} 
              onClick={() => resetOrder()}
              style={{ borderRadius: '999px', padding: '12px 28px' }}
            >
              Start New Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepCard}>
      <div className={styles.stepHeaderRow}>
        <div className={styles.stepTitleGroup}>
          <span className={styles.stepNumberBadge}>04</span>
          <h2 className={styles.stepTitle}>Review & Order</h2>
        </div>
        <div className={styles.actionRowCompact}>
          <button type="button" className={styles.secondaryBtnCompact} onClick={prevStep}>
            <ArrowLeft size={16} /> Back
          </button>
          <button type="button" className={styles.primaryBtnCompact} onClick={handlePlaceOrder} disabled={isSubmitting}>
            {isSubmitting ? 'Placing Order...' : 'Place Order →'}
          </button>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className={styles.formContainer}>
        {/* Editable Summary Sections */}
        <div className={styles.reviewSummaryGrid}>
          {/* 1. Customer Info Summary */}
          <div className={styles.summaryCardBlock}>
            <div className={styles.summaryCardHeader}>
              <h3><User size={18} /> Customer Details</h3>
              <button type="button" className={styles.editStepBtn} onClick={() => setStep(1)}>
                <Edit2 size={14} /> Edit
              </button>
            </div>
            <div className={styles.summaryCardBody}>
              <p><strong>Name:</strong> {customer.name || 'Not specified'}</p>
              <p><strong>Phone:</strong> {customer.phone || 'Not specified'}</p>
              {customer.email && <p><strong>Email:</strong> {customer.email}</p>}
              {customer.organization && <p><strong>Organization:</strong> {customer.organization}</p>}
            </div>
          </div>

          {/* 2. Product & Quantities Summary */}
          <div className={styles.summaryCardBlock}>
            <div className={styles.summaryCardHeader}>
              <h3><ShoppingBag size={18} /> Products ({totalPieces} Pcs)</h3>
              <button type="button" className={styles.editStepBtn} onClick={() => setStep(2)}>
                <Edit2 size={14} /> Edit
              </button>
            </div>
            <div className={styles.summaryCardBody}>
              {items.map((item, index) => {
                let itemPieces = 0;
                if (item.requiresSizes || item.requiresColors) {
                  itemPieces = item.colorVariants.reduce((total, variant) => {
                    return total + (Object.values(variant.sizes) as number[]).reduce((sum, qty) => sum + (qty || 0), 0);
                  }, 0);
                } else {
                  itemPieces = item.quantity || 0;
                }

                return (
                  <div key={item.id} style={{ marginBottom: index < items.length - 1 ? '16px' : '0', paddingBottom: index < items.length - 1 ? '16px' : '0', borderBottom: index < items.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                    <p style={{ margin: '0 0 8px 0' }}>
                      <strong>{item.name}</strong> — {itemPieces} Pcs
                    </p>
                    
                    {item.requiresSizes && item.requiresColors ? (
                      item.colorVariants.map(v => (
                        <div key={v.id} className={styles.summaryVariantRow}>
                          <span className={styles.colorDot} style={{ backgroundColor: v.colorHex }} />
                          <span>{v.color}:</span>
                          <span className={styles.sizeBreakdownSummaryText}>
                            {(Object.entries(v.sizes) as [string, number][])
                              .filter(([_, q]) => q > 0)
                              .map(([s, q]) => `${s}×${q}`)
                              .join(', ')}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>Standard sizing/no color options</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Artwork & Placements Summary */}
          {customizableItems.length > 0 && (
            <div className={styles.summaryCardBlock}>
              <div className={styles.summaryCardHeader}>
                <h3><Sparkles size={18} /> Artwork & Design</h3>
                <button type="button" className={styles.editStepBtn} onClick={() => setStep(3)}>
                  <Edit2 size={14} /> Edit
                </button>
              </div>
              <div className={styles.summaryCardBody}>
                {customizableItems.map((item, index) => (
                  <div key={item.id} style={{ marginBottom: index < customizableItems.length - 1 ? '12px' : '0' }}>
                    <p style={{ margin: '0 0 4px 0' }}><strong>{item.name}</strong></p>
                    {Object.keys(item.artwork.placements).length > 0 ? (
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        Placements: {Object.keys(item.artwork.placements).map(p => p.toUpperCase()).join(', ')}
                      </p>
                    ) : (
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>No design files uploaded.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Delivery Address Section */}
          <div className={styles.summaryCardBlockFull}>
            <h3 className={styles.sectionHeader}><MapPin size={18} /> Shipping & Delivery Destination</h3>
            <div className={styles.inputGrid}>
              <div className={`${styles.inputField} ${styles.fullWidth}`}>
                <label htmlFor="shipping-address">Street Address *</label>
                <input
                  id="shipping-address"
                  type="text"
                  placeholder="Building, Street, Area"
                  value={delivery.address}
                  onChange={(e) => updateDelivery({ address: e.target.value })}
                  required
                />
              </div>
              <div className={styles.inputField}>
                <label htmlFor="shipping-city">City *</label>
                <input
                  id="shipping-city"
                  type="text"
                  placeholder="e.g. Mumbai, Bengaluru"
                  value={delivery.city}
                  onChange={(e) => updateDelivery({ city: e.target.value })}
                  required
                />
              </div>
              <div className={styles.inputField}>
                <label htmlFor="shipping-pincode">Pincode</label>
                <input
                  id="shipping-pincode"
                  type="text"
                  placeholder="e.g. 400001"
                  value={delivery.pincode}
                  onChange={(e) => updateDelivery({ pincode: e.target.value })}
                />
              </div>
            </div>

            {/* Express Delivery Banner */}
            <div 
              className={`${styles.urgentBanner} ${isUrgentOrder ? styles.urgentActive : ''}`}
              onClick={toggleUrgentOrder}
              style={{ marginTop: 14 }}
            >
              <div className={styles.urgentLeft}>
                <div className={styles.urgentIconCircle}>
                  <Zap size={18} />
                </div>
                <div>
                  <h4 className={styles.urgentTitle}>Express 48-Hour Priority Rush Delivery</h4>
                  <p className={styles.urgentDesc}>Fast-track production dispatch (+20% rush fee).</p>
                </div>
              </div>
              <input type="checkbox" checked={isUrgentOrder} onChange={() => {}} className={styles.urgentCheckbox} />
            </div>
          </div>

          {/* Price Breakdown Bar */}
          <div className={styles.priceSummaryCardFull}>
            <div className={styles.priceRow}>
              <span>Subtotal ({totalPieces} Pcs):</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {isUrgentOrder && (
              <div className={`${styles.priceRow} ${styles.urgentPrice}`}>
                <span>Express (+20%):</span>
                <span>+₹{urgentFee.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className={styles.priceRowTotal}>
              <span>Grand Total:</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}

export default Step4ReviewAndOrder;
