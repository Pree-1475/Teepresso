import React from 'react';
import { OrderSidebar } from './OrderSidebar';
import { StepProgress } from './StepProgress';
import styles from './OrderFlowLayout.module.css';

export function OrderFlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.mainContent}>
            <StepProgress />
            <div className={styles.stepContainer}>
              {children}
            </div>
          </div>
          <div className={styles.sidebarColumn}>
            <OrderSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
