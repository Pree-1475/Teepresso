'use client';

import React from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { Button } from '@/common/components/ui/Button/Button';
import { Check, Zap, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import styles from './Step.module.css';

export function Step6PrintingPreferences() {
  const { 
    state, 
    toggleUrgentOrder, 
    nextStep, 
    prevStep, 
    totalPieces, 
    subtotal, 
    urgentFee, 
    grandTotal 
  } = useOrderFlow();

  const { customer, product, sizes, artwork, mockup, isUrgentOrder } = state;

  return (
    <div className={styles.stepContainer}>
      <span className={styles.stepBadge}>STEP 6 OF 8 • REVIEW & URGENT OPTIONS</span>
      <h2 className={styles.title}>Review Order Specifications</h2>
      <p className={styles.description}>Verify your order items and select whether you need express delivery.</p>

      {/* Summary Box */}
      <div className={styles.reviewSummaryBox}>
        <div className={styles.reviewGrid}>
          <div>
            <div className={styles.reviewLabel}>Customer</div>
            <div className={styles.reviewValue}>{customer.name} ({customer.phone})</div>
          </div>

          <div>
            <div className={styles.reviewLabel}>Apparel & Color</div>
            <div className={styles.reviewValue}>{product.name} ({product.color})</div>
          </div>

          <div>
            <div className={styles.reviewLabel}>Fabric Quality</div>
            <div className={styles.reviewValue}>{product.quality}</div>
          </div>

          <div>
            <div className={styles.reviewLabel}>Size Breakdown ({totalPieces} Pcs)</div>
            <div className={styles.reviewValue}>
              {Object.entries(sizes)
                .filter(([_, qty]) => (qty as number) > 0)
                .map(([size, qty]) => `${size}: ${qty}`)
                .join(' • ') || 'None selected'}
            </div>
          </div>

          <div>
            <div className={styles.reviewLabel}>Artwork & Placement</div>
            <div className={styles.reviewValue}>
              {mockup.designerAssistance 
                ? '✨ Teepresso Designer Team Handling' 
                : artwork.file ? `File: ${artwork.file.name}` : 'Default Teepresso Logo'}
            </div>
          </div>
        </div>

        {/* Pricing Table */}
        <div className={styles.pricingBreakdown}>
          <div className={styles.priceRow}>
            <span>Base Apparel Subtotal ({totalPieces} Pcs)</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          {isUrgentOrder && (
            <div className={`${styles.priceRow} ${styles.urgentPriceRow}`}>
              <span>⚡ Express Urgent Processing (+20%)</span>
              <span>+ ₹{urgentFee.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className={`${styles.priceRow} ${styles.grandTotalRow}`}>
            <span>Total Estimated Price</span>
            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Urgent Order Toggle */}
      <div 
        className={`${styles.urgentToggleBox} ${isUrgentOrder ? styles.urgentToggleBoxActive : ''}`}
        onClick={toggleUrgentOrder}
      >
        <div className={styles.urgentHeader}>
          <Zap size={22} color={isUrgentOrder ? '#d35400' : 'var(--color-primary-600)'} />
          <div>
            <div className={styles.urgentTitle}>Need this order urgently? (Express Delivery)</div>
            <div className={styles.urgentDesc}>
              Standard delivery takes 4–5 days. Checking this adds a <strong>20% additional charge (+₹{Math.round(subtotal * 0.2)})</strong> and prioritizes your batch for 48-hour dispatch!
            </div>
          </div>
        </div>
        <div className={styles.checkboxControl}>
          {isUrgentOrder ? <Check size={18} color="#fff" /> : null}
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="outline" onClick={prevStep} leftIcon={<ArrowLeft size={16} />}>Back</Button>
        <Button variant="primary" size="lg" onClick={nextStep} rightIcon={<ArrowRight size={18} />}>
          Proceed to Delivery Address
        </Button>
      </div>
    </div>
  );
}
