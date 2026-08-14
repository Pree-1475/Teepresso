'use client';

import React, { useState, useEffect } from 'react';
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % features.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const getCardStyle = (index: number) => {
    const diff = (index - activeIndex + features.length) % features.length;
    
    if (diff === 0) {
      return { zIndex: 10, transform: 'translateY(0) scale(1)', opacity: 1 };
    } else if (diff === 1) {
      return { zIndex: 9, transform: 'translateY(20px) scale(0.95)', opacity: 0.7 };
    } else if (diff === 2) {
      return { zIndex: 8, transform: 'translateY(40px) scale(0.9)', opacity: 0.3 };
    } else if (diff === features.length - 1) {
      // Exiting card: floats upward and fades out on top of the stack for a ultra-smooth fade away
      return { zIndex: 11, transform: 'translateY(-30px) scale(1.02)', opacity: 0, pointerEvents: 'none' as const };
    } else {
      // Hidden cards waiting in background
      return { zIndex: 0, transform: 'translateY(40px) scale(0.9)', opacity: 0, pointerEvents: 'none' as const };
    }
  };

  return (
    <section className={styles.section}>
      {/* Apparel Fabric Label (Detail 6) */}
      <div className={styles.fabricLabel}>
        <span>Teepresso Premium</span>
        <span style={{ fontSize: '9px', opacity: 0.85 }}>• Quality Checked</span>
      </div>
      <div className="container">
        <div className={styles.wrapper}>
          <div className={styles.textContent}>
            <h2 className={styles.title}>Why Teepresso</h2>
            <p className={styles.description}>
              We built our entire platform around the unique needs of bulk buyers. We eliminate the common frustrations of custom apparel ordering.
            </p>
          </div>
          
          <div className={styles.carouselWrapper}>
            <div 
              className={styles.carouselContainer}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const diff = (index - activeIndex + features.length) % features.length;
                const isClickable = diff === 1 || diff === 2;

                return (
                  <div 
                    key={index} 
                    className={`${styles.featureItem} ${isClickable ? styles.clickableCard : ''}`}
                    style={getCardStyle(index)}
                    onClick={() => isClickable && setActiveIndex(index)}
                  >
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

            <div className={styles.dotsContainer}>
              {features.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to feature ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
