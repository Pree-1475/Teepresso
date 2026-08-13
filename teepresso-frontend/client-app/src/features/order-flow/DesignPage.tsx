import React from 'react';
import { OrderFlowProvider } from '@/features/order-flow/components/OrderFlowContext';
import { MockupCanvasEditor } from '@/features/order-flow/components/MockupCanvasEditor';
import styles from './design.module.css';

export function DesignPage() {
  return (
    <OrderFlowProvider>
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.heroHeader}>
            <span className={styles.heroBadge}>✨ Visual Mockup Tool</span>
            <h1 className={styles.heroTitle}>Preview Your Group Artwork</h1>
            <p className={styles.heroDesc}>
              Upload your logo, position artwork on front or back views, or request free design assistance from our team.
            </p>
          </div>

          <div className={styles.editorWrapper}>
            <MockupCanvasEditor />
          </div>
        </div>
      </div>
    </OrderFlowProvider>
  );
}

export default DesignPage;
