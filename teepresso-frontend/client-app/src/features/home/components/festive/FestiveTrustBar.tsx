import React from 'react';
import styles from './FestiveTrustBar.module.css';

const trustSignals = [
  "BULK ORDERS",
  "DESIGN ASSISTANCE",
  "QUALITY PRINTING",
  "RELIABLE DELIVERY"
];

// Duplicate the array to create a seamless infinite loop
const marqueeItems = [...trustSignals, ...trustSignals, ...trustSignals, ...trustSignals];

export function FestiveTrustBar() {
  return (
    <div className={styles.trustBar}>
      <div className={styles.marquee}>
        <div className={styles.marqueeContent}>
          {marqueeItems.map((signal, index) => (
            <React.Fragment key={index}>
              <span className={styles.signalText}>{signal}</span>
              <span className={styles.separator}>✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
