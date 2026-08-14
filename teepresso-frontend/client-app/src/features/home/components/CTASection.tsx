import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import styles from './CTASection.module.css';

export function CTASection() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.container}`} style={{ position: 'relative', zIndex: 1 }}>
        <div className={styles.content}>
          <h2 className={styles.title}>Ready to elevate your team&apos;s apparel?</h2>
          <p className={styles.description}>
            Join hundreds of organizations who trust T Presso for their custom bulk apparel needs. 
            Get a custom quote today and experience the difference.
          </p>
          <div className={styles.actions}>
            <Link href="/bulk-orders">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={20} />} className={styles.primaryBtn}>
                Start a Bulk Order
              </Button>
            </Link>
            <Button variant="outline" size="lg" className={styles.outlineBtn}>
              Request a Quote
            </Button>
          </div>
        </div>
      </div>

      {/* Background Thread Winding (Detail 1) */}
      <svg className={styles.threadWinding} viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M -50 150 Q 100 20, 200 120 T 450 80" 
          stroke="rgba(255, 255, 255, 0.12)" 
          strokeWidth="1.5" 
          strokeDasharray="6 6" 
        />
        <path 
          d="M -30 170 Q 120 40, 220 140 T 470 100" 
          stroke="rgba(255, 255, 255, 0.06)" 
          strokeWidth="1" 
          strokeDasharray="3 6" 
        />
      </svg>
    </section>
  );
}
