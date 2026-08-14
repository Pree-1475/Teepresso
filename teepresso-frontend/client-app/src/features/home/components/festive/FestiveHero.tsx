import React from 'react';
import Link from 'next/link';
import { ArrowRight, Users, Shirt, Palette, Clock } from 'lucide-react';
import styles from './FestiveHero.module.css';

export const FestiveHero = () => {
  return (
    <section className={styles.heroSection}>
      <div className={`container ${styles.container}`}>
        <div className={styles.grid}>
          {/* Text Content */}
          <div className={styles.textContent}>
            <h1 className={styles.title}>
              YOUR GROUP.<br/>
              YOUR IDENTITY.<br/>
              <span className={styles.highlight}>YOUR KURTAS.</span>
            </h1>
            <p className={styles.description}>
              Custom printed kurtas for communities,<br/>
              associations and events.
            </p>
            <div className={styles.actions}>
              <Link href="/bulk-orders?product=custom-kurta-seasonal" className={styles.primaryBtn}>
                Start Your Kurta Order <ArrowRight size={18} />
              </Link>
            </div>
            

          </div>

          {/* Right Image Stage (Empty space for background image) */}
          <div className={styles.imageStage}>
             {/* Image is now handled by the background in CSS */}
          </div>
        </div>
      </div>
      

      {/* Decorative Apparel Thread Curl */}
      <svg className={styles.threadCurl} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M -20 220 C 40 180, 80 190, 90 150 C 100 110, 60 70, 110 50 C 160 30, 180 80, 220 20" 
          stroke="#B56C4A" 
          strokeWidth="1.5" 
          strokeDasharray="4 4" 
        />
        <path 
          d="M -40 200 C 20 160, 60 170, 70 130 C 80 90, 40 50, 90 30 C 140 10, 160 60, 200 0" 
          stroke="#2D1A13" 
          strokeWidth="1" 
          strokeDasharray="2 4" 
          opacity="0.5"
        />
      </svg>
    </section>
  );
};
