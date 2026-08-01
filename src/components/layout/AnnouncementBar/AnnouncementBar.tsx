import React from 'react';
import styles from './AnnouncementBar.module.css';

export function AnnouncementBar() {
  return (
    <div className={styles.bar}>
      <p className={styles.text}>
        Free nationwide shipping on all bulk orders over 500 units
      </p>
    </div>
  );
}
