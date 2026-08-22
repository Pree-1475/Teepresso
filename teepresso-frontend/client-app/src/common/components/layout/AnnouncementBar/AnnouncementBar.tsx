import React from 'react';
import styles from './AnnouncementBar.module.css';
import { STOREFRONT_MODE } from '@/common/config/storefront';

export function AnnouncementBar() {
  const content = STOREFRONT_MODE === 'FESTIVE' ? (
    <>
      <span className={styles.diamond}>✦</span> FESTIVE MODE: Custom Kurtas for Every Crew. Bulk Orders • Special Pricing • On-time Delivery <span className={styles.diamond}>✦</span>
    </>
  ) : (
    <>Free nationwide shipping on all bulk orders over 500 units</>
  );

  return (
    <div className={`${styles.bar} ${STOREFRONT_MODE === 'FESTIVE' ? styles.festiveBar : ''}`}>
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeTrack}>
          {/* Repeat content to create a seamless scrolling loop */}
          <p className={styles.text}>{content}</p>
          <p className={styles.text}>{content}</p>
          <p className={styles.text}>{content}</p>
          <p className={styles.text}>{content}</p>
          <p className={styles.text}>{content}</p>
          <p className={styles.text}>{content}</p>
        </div>
      </div>
    </div>
  );
}
