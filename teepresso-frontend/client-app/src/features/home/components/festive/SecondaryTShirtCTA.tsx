import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useScrollReveal } from '@/common/hooks/useScrollReveal';
import styles from './SecondaryTShirtCTA.module.css';

export const SecondaryTShirtCTA = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section className={styles.section} ref={ref}>
      <div className={`container ${isVisible ? styles.visible : ''}`}>
        <div className={styles.content}>
          <h2 className={styles.title}>Looking for custom T-Shirts instead?</h2>
          <Link href="/products" className={styles.link}>
            EXPLORE T-SHIRTS <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};
