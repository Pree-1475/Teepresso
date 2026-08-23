import React from 'react';
import { Users, Edit3, ShieldCheck, Truck } from 'lucide-react';
import styles from './FestiveFeaturesBar.module.css';

const features = [
  {
    icon: Users,
    title: 'Made for Groups',
    desc: 'Perfect for communities, colleges & events'
  },
  {
    icon: Edit3,
    title: 'Custom Designs',
    desc: 'Add your logo, name or unique artwork'
  },
  {
    icon: ShieldCheck,
    title: 'Premium Quality',
    desc: 'Comfortable fabrics with neat finishing'
  },
  {
    icon: Truck,
    title: 'On-time Delivery',
    desc: 'We deliver when your event matters'
  }
];

export const FestiveFeaturesBar = () => {
  return (
    <div className={styles.barContainer}>
      <div className="container">
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureItem}>
              <div className={styles.iconWrapper}>
                <feature.icon size={32} color="#1A1A1A" strokeWidth={1.5} />
              </div>
              <div className={styles.textGroup}>
                <span className={styles.title}>{feature.title}</span>
                <p className={styles.desc}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
