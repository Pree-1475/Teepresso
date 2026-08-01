'use client';
import React from 'react';
import { useOrderFlow } from './OrderFlowContext';
import styles from './OrderSidebar.module.css';

export function OrderSidebar() {
  const { state, totalQuantity } = useOrderFlow();

  return (
    <div className={styles.sidebar}>
      <h3 className={styles.title}>Order Summary</h3>
      
      <div className={styles.section}>
        <div className={styles.row}>
          <span className={styles.label}>Total Quantity:</span>
          <span className={styles.value}>{totalQuantity} pcs</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Products Selected:</span>
          <span className={styles.value}>{state.products.length}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Artwork:</span>
          <span className={styles.value}>{state.artwork.length > 0 ? `${state.artwork.length} files` : 'Pending'}</span>
        </div>
      </div>

      <div className={styles.estimate}>
        <span className={styles.estimateLabel}>Estimated Turnaround</span>
        <span className={styles.estimateValue}>10-14 Days</span>
      </div>
    </div>
  );
}
