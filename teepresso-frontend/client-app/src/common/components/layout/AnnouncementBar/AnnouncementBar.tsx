import React from 'react';
import styles from './AnnouncementBar.module.css';
import { STOREFRONT_MODE } from '@/common/config/storefront';

export function AnnouncementBar() {
  if (STOREFRONT_MODE === 'FESTIVE') {
    return (
      <div className={`${styles.bar} ${styles.festiveBar}`}>
        <p className={styles.text}>
          <span className={styles.diamond}>✦</span> FESTIVE MODE: Custom Kurtas for Every Crew. Bulk Orders • Special Pricing • On-time Delivery <span className={styles.diamond}>✦</span>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.bar}>
      <p className={styles.text}>
        Free nationwide shipping on all bulk orders over 500 units
      </p>
    </div>
  );
}
