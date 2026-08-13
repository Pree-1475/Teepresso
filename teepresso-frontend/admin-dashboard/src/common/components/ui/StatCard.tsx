import React from 'react';
import { LucideIcon } from 'lucide-react';
import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
}

export function StatCard({ title, value, change, isPositive = true, icon: Icon }: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <span className={styles.title}>{title}</span>
        <div className={styles.iconBox}>
          <Icon size={16} color="var(--color-zinc-600)" />
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.value}>{value}</div>
        {change && (
          <span className={`${styles.changeBadge} ${isPositive ? styles.positive : styles.negative}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

export default StatCard;
