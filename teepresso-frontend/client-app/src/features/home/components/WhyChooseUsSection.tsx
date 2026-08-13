import React from 'react';
import { Palette, Receipt, BarChart3, CheckCircle2, Map, Truck } from 'lucide-react';
import styles from './WhyChooseUsSection.module.css';

const features = [
  {
    title: 'Dedicated Design Support',
    description: 'Our expert designers review every file and help you create print-ready artwork at no extra cost.',
    icon: Palette
  },
  {
    title: 'Transparent Pricing',
    description: 'No hidden fees or surprise setups. The quote you receive is exactly what you pay for the order.',
    icon: Receipt
  },
  {
    title: 'Bulk Expertise',
    description: 'From 50 to 50,000 pieces, our facilities are optimized specifically for large-scale custom apparel.',
    icon: BarChart3
  },
  {
    title: 'Strict Quality Checks',
    description: 'Every garment undergoes a multi-point inspection to ensure perfect prints and consistent sizing.',
    icon: CheckCircle2
  },
  {
    title: 'Real-Time Tracking',
    description: 'Monitor your order from approval to production to final delivery through our dedicated portal.',
    icon: Map
  },
  {
    title: 'Reliable Delivery',
    description: 'Events have hard deadlines. We offer guaranteed delivery dates and nationwide logistics support.',
    icon: Truck
  }
];

export function WhyChooseUsSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.wrapper}>
          <div className={styles.textContent}>
            <h2 className={styles.title}>Why organizations choose T Presso</h2>
            <p className={styles.description}>
              We built our entire platform around the unique needs of bulk buyers. We eliminate the common frustrations of custom apparel ordering.
            </p>
          </div>
          
          <div className={styles.grid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className={styles.featureItem}>
                  <div className={styles.iconWrapper}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureDesc}>{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
