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

  const { items, isUrgentOrder, currentStep } = state;

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <div className={styles.sidebar}>
        <h3 className={styles.title}>Order Summary</h3>

        <div className={styles.section}>
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
              <div key={item.id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: index < items.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                <div className={styles.row}>
                  <span className={styles.label}>Product:</span>
                  <span className={styles.value}>{item.name}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Quantity:</span>
                  <span className={styles.value}>{itemPieces} Pcs</span>
                </div>
              </div>
            );
          })}
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
            <span className={styles.mobilePieceLabel}>{totalPieces} Pcs Total</span>
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
