import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import styles from './CTASection.module.css';

export function CTASection() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.container}`}>
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
    </section>
  );
}
