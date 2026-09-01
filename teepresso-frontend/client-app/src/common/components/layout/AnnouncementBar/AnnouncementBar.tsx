import React, { useState, useEffect } from 'react';
import styles from './AnnouncementBar.module.css';
import { API_BASE_URL } from '@/common/config/api';

const getInitialMode = (): 'STANDARD' | 'FESTIVE' => {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('teepresso_storefront_mode');
    if (cached === 'FESTIVE' || cached === 'STANDARD') {
      return cached;
    }
  }
  return 'STANDARD';
};

export function AnnouncementBar() {
  const [mode, setMode] = useState<'STANDARD' | 'FESTIVE'>(getInitialMode);

  useEffect(() => {
    const fetchSettings = () => {
      fetch(`${API_BASE_URL}/settings`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.settings && data.settings.storefrontMode) {
            const newMode = data.settings.storefrontMode as 'STANDARD' | 'FESTIVE';
            setMode(newMode);
            localStorage.setItem('teepresso_storefront_mode', newMode);
          }
        })
        .catch(() => {});
    };

    fetchSettings();
    const interval = setInterval(fetchSettings, 3000);
    return () => clearInterval(interval);
  }, []);

  const p1 = mode === 'FESTIVE' ? '✦ Custom Kurtas for Every Crew' : '✦ Free Shipping on Bulk Orders Over 500 Units';
  const p2 = mode === 'FESTIVE' ? '✦ Bulk Orders & Group Pricing' : '✦ Premium Custom Apparel Printing';
  const p3 = mode === 'FESTIVE' ? '✦ Fast Nationwide Delivery' : '✦ Bulk Pricing Discounts Available';

  return (
    <div className={`${styles.bar} ${mode === 'FESTIVE' ? styles.festiveBar : ''}`}>
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeTrack}>
          <span>{p1}</span>
          <span>{p2}</span>
          <span>{p3}</span>
          <span>{p1}</span>
          <span>{p2}</span>
          <span>{p3}</span>
        </div>
        <div className={styles.marqueeTrack} aria-hidden="true">
          <span>{p1}</span>
          <span>{p2}</span>
          <span>{p3}</span>
          <span>{p1}</span>
          <span>{p2}</span>
          <span>{p3}</span>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementBar;
