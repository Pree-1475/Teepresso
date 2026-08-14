'use client';

import React from 'react';
import { useOrderFlow } from './OrderFlowContext';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import styles from './OrderSidebar.module.css';

export function OrderSidebar() {
  const { 
    state, 
    totalPieces, 
    subtotal, 
    urgentFee, 
    grandTotal,
    nextStep 
  } = useOrderFlow();

  const { product, isUrgentOrder, mockup, currentStep } = state;

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <div className={styles.sidebar}>
        <h3 className={styles.title}>Order Summary</h3>

        <div className={styles.section}>
          <div className={styles.row}>
            <span className={styles.label}>Selected Product:</span>
            <span className={styles.value}>{product.name}</span>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>Color:</span>
            <span className={styles.value} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: product.colorHex, display: 'inline-block' }} />
              {product.color}
            </span>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>Total Quantity:</span>
            <span className={styles.value}>{totalPieces} Pcs</span>
          </div>


        </div>

        <div className={styles.priceBreakdownSection}>
          <div className={styles.row}>
            <span className={styles.label}>Subtotal:</span>
            <span className={styles.value}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          {isUrgentOrder && (
            <div className={styles.row} style={{ color: '#d35400' }}>
              <span className={styles.label}>Express Urgent (+20%):</span>
              <span className={styles.value}>+₹{urgentFee.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className={styles.grandTotalRow}>
            <span className={styles.grandTotalLabel}>Grand Total:</span>
            <span className={styles.grandTotalValue}>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className={styles.estimate}>
          <span className={styles.estimateLabel}>Delivery</span>
          <span className={styles.estimateValue}>
            {isUrgentOrder ? 'Express (48 Hours)' : 'Standard (4-5 Days)'}
          </span>
        </div>
      </div>

      {/* Mobile Sticky Bottom Summary Bar */}
      {currentStep < 4 && (
        <div className={styles.mobileStickyBar}>
          <div className={styles.mobileStickyLeft}>
            <span className={styles.mobilePieceLabel}>{totalPieces} Pcs • {product.name}</span>
            <span className={styles.mobilePrice}>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>

          <button className={styles.mobileNextBtn} onClick={nextStep}>
            Next Step <ArrowRight size={14} />
          </button>
        </div>
      )}
    </>
  );
}
