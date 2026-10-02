import React from 'react';
import Link from 'next/link';
import { ArrowRight, Coffee } from 'lucide-react';
import { useScrollReveal } from '@/common/hooks/useScrollReveal';
import styles from './HeroSection.module.css';

export function HeroSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section className={styles.heroSection} ref={ref}>
      <div className={`container ${styles.heroContainer}`}>
        <div className={`${styles.heroContent} ${isVisible ? 'fade-in' : ''}`}>
          
          <span className={styles.subtitle}>
            WEAR YOUR TEAM. LIVE YOUR IDENTITY.
          </span>
          
          <h1 className={styles.title}>
            <span className={styles.mobileTitle}>Custom T-Shirts<br />Made For All!</span>
            <span className={styles.desktopTitle}>Custom T-Shirts<br />Made for Every Team</span>
          </h1>
          
          
          
          <div className={styles.actions}>
            <Link href="/products" className={styles.btnPrimary}>
              Explore Gallery
            </Link>
            <Link href="#instant-quote" className={styles.btnOutline}>
              Get a Quote <ArrowRight size={16} />
            </Link>
          </div>
          
        </div>
      </div>
      
    </section>
  );
}
