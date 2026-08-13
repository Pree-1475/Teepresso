import React from 'react';
import Link from 'next/link';
import { ArrowRight, Coffee } from 'lucide-react';
import styles from './HeroSection.module.css';

export function HeroSection() {
  return (
    <section className={styles.heroSection}>
      <div className={`container ${styles.heroContainer}`}>
        <div className={styles.heroContent}>
          
          <span className={styles.subtitle}>
            WEAR YOUR TEAM. LIVE YOUR IDENTITY.
          </span>
          
          <h1 className={styles.title}>
            Custom T-Shirts<br />
            Made for Every Team
          </h1>
          
          <p className={styles.description}>
            From schools to societies, events to enterprises &ndash;<br />
            we create custom tees that speak for you.
          </p>
          
          <div className={styles.actions}>
            <Link href="/bulk-orders" className={styles.btnPrimary}>
              Start Designing <ArrowRight size={16} />
            </Link>
            <Link href="/gallery" className={styles.btnOutline}>
              Explore Gallery
            </Link>
          </div>
          
        </div>
      </div>
      
    </section>
  );
}
