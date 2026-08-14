import React, { useState, useMemo } from 'react';
import Link from 'next/link'; // Still mapped to react-router via Vite alias
import { ArrowRight, Calculator } from 'lucide-react';
import { useScrollReveal } from '@/common/hooks/useScrollReveal';
import styles from './InstantKurtaQuote.module.css';

export const InstantKurtaQuote = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  const [qty, setQty] = useState<number>(50);
  const [kurtaType, setKurtaType] = useState<string>('premium-slub');

  // Simple placeholder pricing logic
  const pricePerUnit = useMemo(() => {
    let base = kurtaType === 'premium-slub' ? 599 : 499;
    if (qty >= 100) base -= 50;
    else if (qty >= 50) base -= 25;
    return base;
  }, [qty, kurtaType]);

  const totalEstimate = useMemo(() => {
    return pricePerUnit * qty;
  }, [pricePerUnit, qty]);

  return (
    <section className={styles.section} ref={ref}>
      <div className={`container ${styles.container} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.card}>
          <div className={styles.header}>
            <Calculator className={styles.icon} size={28} />
            <h2 className={styles.title}>Instant Quote Calculator</h2>
            <p className={styles.subtitle}>Get a quick estimate for your bulk order.</p>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Fabric Quality</label>
              <select 
                className={styles.select}
                value={kurtaType}
                onChange={(e) => setKurtaType(e.target.value)}
              >
                <option value="premium-slub">Premium Slub Cotton</option>
                <option value="standard-cotton">Standard Cotton Blend</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Quantity (Min 20)</label>
              <input 
                type="number" 
                className={styles.input}
                value={qty}
                onChange={(e) => setQty(Math.max(20, parseInt(e.target.value) || 20))}
                min={20}
              />
            </div>
          </div>

          <div className={styles.resultBox}>
            <div className={styles.resultRow}>
              <span>Est. Price Per Unit</span>
              <strong>₹{pricePerUnit}</strong>
            </div>
            <div className={styles.resultRowTotal}>
              <span>Total Estimate</span>
              <strong>₹{totalEstimate.toLocaleString()}</strong>
            </div>
          </div>

          <Link href={`/bulk-orders?product=custom-kurta-seasonal&qty=${qty}`} className={styles.ctaButton}>
            ORDER NOW <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};
