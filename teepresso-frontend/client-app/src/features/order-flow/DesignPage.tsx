import React from 'react';
import { OrderFlowProvider, useOrderFlow } from '@/features/order-flow/components/OrderFlowContext';
import { MockupCanvasEditor } from '@/features/order-flow/components/MockupCanvasEditor';
import styles from './design.module.css';

function DesignPageContent() {
  const { state } = useOrderFlow();
  const firstItemId = state.items[0]?.id;

  return (
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
          {firstItemId ? (
            <MockupCanvasEditor itemId={firstItemId} />
          ) : (
            <p>No product selected to design.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function DesignPage() {
  return (
    <OrderFlowProvider>
      <DesignPageContent />
    </OrderFlowProvider>
  );
}

export default DesignPage;
