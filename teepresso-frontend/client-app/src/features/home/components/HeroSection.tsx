import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useScrollReveal } from '@/common/hooks/useScrollReveal';
import styles from './HeroSection.module.css';

export function HeroSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section className={styles.heroSection} ref={ref}>
      <div className={`container ${styles.heroContainer}`}>
        <div className={`${styles.heroContent} ${isVisible ? 'fade-in' : ''}`}>
          
          <div className={styles.eyebrowWrapper}>
            <span className={styles.eyebrowLine}>WEAR YOUR TEAM.</span>
            <span className={styles.eyebrowLine}>LIVE YOUR IDENTITY.</span>
            <div className={styles.eyebrowDivider} />
          </div>
          
          <h1 className={styles.title}>
            <span className={styles.titleLine1}>Custom T-Shirts</span>
            <span className={styles.titleLine2}>Made for</span>
            <span className={styles.titleLine3}>
              Every{' '}
              <span className={styles.curvedWord}>
                Team
                <svg
                  className={styles.curvedLineSvg}
                  viewBox="0 0 100 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 2 12.5 C 24 3.5 64 2.5 99 10.5 C 66 6.8 26 10.5 2 17 C 0.6 17 0.6 12.5 2 12.5 Z"
                    fill="url(#teamCurveGradient)"
                  />
                  <defs>
                    <linearGradient id="teamCurveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#E2CEBE" />
                      <stop offset="65%" stopColor="#D9C2B0" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#C9AF9C" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </span>
          </h1>
          
          <div className={styles.actions}>
            <Link href="/products" className={styles.btnPrimary}>
              Explore Gallery
            </Link>
            <Link href="#instant-quote" className={styles.btnOutline}>
              <span>Get a Quote</span>
              <ArrowRight size={16} className={styles.btnArrow} />
            </Link>
          </div>
          
        </div>
      </div>
    </section>
  );
}
