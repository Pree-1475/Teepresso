import React from 'react';
import { useScrollReveal } from '@/common/hooks/useScrollReveal';
import styles from './FestiveWhyUs.module.css';

const reasons = [
  {
    title: "Bulk Expertise",
    desc: "We specialize in large group orders. Whether it's 50 or 5,000 kurtas, we deliver consistently without compromising quality.",
    spanClass: styles.span2
  },
  {
    title: "Design Assistance",
    desc: "Need help preparing your society logo? Our expert team will assist you.",
    spanClass: styles.span1
  },
  {
    title: "Quality Checking",
    desc: "Every garment undergoes strict quality control. No misprints, no bad stitching.",
    spanClass: styles.span1
  },
  {
    title: "Custom Printing",
    desc: "Premium, durable prints that won't fade during celebrations. Perfect for long-term community branding and memories.",
    spanClass: styles.span2
  },
  {
    title: "Reliable Delivery Nationwide",
    desc: "We respect your event deadlines. Fast, tracked shipping ensures your group is ready before the festival begins.",
    spanClass: styles.span3
  }
];

export const FestiveWhyUs = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section className={styles.section} ref={ref}>
      <div className="container">
        <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
          <h2 className={styles.title}>Why Communities Choose Us.</h2>
          <p className={styles.subtitle}>
            Organizing apparel for a large group is stressful. We make it completely effortless.
          </p>
        </div>
        
        <div className={styles.bentoGrid}>
          {reasons.map((reason, idx) => (
            <div 
              key={idx} 
              className={`${styles.bentoCard} ${reason.spanClass} ${isVisible ? styles.cardVisible : ''}`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className={styles.cardGlow}></div>
              <div className={styles.cardContent}>
                <h3 className={styles.featureTitle}>{reason.title}</h3>
                <p className={styles.featureDesc}>{reason.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
