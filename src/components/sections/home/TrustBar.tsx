import React from 'react';
import styles from './TrustBar.module.css';

const trustSignals = [
  "500+ CORPORATE CLIENTS",
  "100K+ ORDERS FULFILLED",
  "10 YEARS OF EXCELLENCE",
  "FAST NATIONWIDE SHIPPING",
  "PREMIUM QUALITY FABRICS",
  "DEDICATED ACCOUNT MANAGERS"
];

// Duplicate the array to create a seamless infinite loop
const marqueeItems = [...trustSignals, ...trustSignals, ...trustSignals];

export function TrustBar() {
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
