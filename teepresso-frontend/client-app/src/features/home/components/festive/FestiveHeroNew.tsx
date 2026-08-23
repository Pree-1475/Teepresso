import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './FestiveHeroNew.module.css';

export const FestiveHeroNew = () => {
  return (
    <section className={styles.heroSection}>
      <div className={`container ${styles.heroContainer}`}>
        
        {/* Text Content */}
        <div className={styles.textContent}>
          <div className={styles.eyebrow}>
            <span style={{color: '#E67E22'}}>✦</span> FESTIVE COLLECTION <span style={{color: '#E67E22'}}>✦</span>
          </div>
          <h1 className={styles.title}>
            Festive looks,<br />
            made for your people.
          </h1>
          <p className={styles.subtitle}>
            Custom Kurtas, Pagdis, Panchas & more<br />
            for every celebration.
          </p>
        </div>

      </div>
    </section>
  );
};
