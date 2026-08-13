import React from 'react';
import { IndianRupee, ShoppingBag, Palette, Layers } from 'lucide-react';
import styles from './MetricStrip.module.css';

interface MetricItem {
  id: string;
  label: string;
  value: string | number;
  subtext: string;
  isAlert?: boolean;
}

interface MetricStripProps {
  metrics: MetricItem[];
}

export function MetricStrip({ metrics }: MetricStripProps) {
  return (
    <div className={styles.stripContainer}>
      {metrics.map((item, idx) => (
        <div key={item.id} className={styles.metricCell}>
          <div className={styles.labelRow}>
            <span className={styles.label}>{item.label}</span>
          </div>
          <div className={styles.valueRow}>
            <span className={styles.value}>{item.value}</span>
            <span className={`${styles.subtext} ${item.isAlert ? styles.subtextAlert : ''}`}>
              {item.subtext}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MetricStrip;
