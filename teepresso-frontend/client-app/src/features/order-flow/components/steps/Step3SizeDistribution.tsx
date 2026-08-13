'use client';

import React from 'react';
import { useOrderFlow, SizeQtyMap } from '../OrderFlowContext';
import { Button } from '@/common/components/ui/Button/Button';
import { Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react';
import styles from './Step.module.css';

const SIZES_LIST: (keyof SizeQtyMap)[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export function Step3SizeDistribution() {
  const { state, updateSizeQty, nextStep, prevStep, totalPieces } = useOrderFlow();
  const { sizes } = state;

  return (
    <div className={styles.stepContainer}>
      <span className={styles.stepBadge}>STEP 3 OF 8 • SIZES & QUANTITIES</span>
      <h2 className={styles.title}>How many pieces per size?</h2>
      <p className={styles.description}>Specify the count for each size. You can adjust these numbers anytime before final production.</p>

      {/* Dynamic Total Banner */}
      <div className={styles.totalPiecesBox}>
        <div className={styles.totalLeft}>
          <ShoppingBag size={24} color="var(--color-primary-600)" />
          <div>
            <div className={styles.totalLabel}>Total Order Volume</div>
            <div className={styles.totalCount}>{totalPieces} Pieces</div>
          </div>
        </div>

        {totalPieces >= 150 ? (
          <span className={styles.tierDiscountTag}>✨ 20% Volume Discount Applied!</span>
        ) : totalPieces >= 75 ? (
          <span className={styles.tierDiscountTag}>✨ 10% Volume Discount Applied!</span>
        ) : (
          <span className={styles.tierDiscountHint}>Add {75 - totalPieces} more for 10% off!</span>
        )}
      </div>

      {/* Size Counters Grid */}
      <div className={styles.sizeCountersGrid}>
        {SIZES_LIST.map(sizeKey => {
          const qty = sizes[sizeKey] || 0;
          return (
            <div key={sizeKey} className={styles.sizeCounterCard}>
              <span className={styles.sizeLabel}>{sizeKey}</span>
              <div className={styles.counterControls}>
                <button
                  className={styles.counterBtn}
                  onClick={() => updateSizeQty(sizeKey, qty - 5)}
                  disabled={qty <= 0}
                >
                  <Minus size={14} />
                </button>

                <input
                  type="number"
                  min={0}
                  value={qty}
                  onChange={(e) => updateSizeQty(sizeKey, parseInt(e.target.value) || 0)}
                  className={styles.counterInput}
                />

                <button
                  className={styles.counterBtn}
                  onClick={() => updateSizeQty(sizeKey, qty + 5)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <Button variant="outline" onClick={prevStep} leftIcon={<ArrowLeft size={16} />}>Back</Button>
        <Button
          variant="primary"
          size="lg"
          onClick={nextStep}
          disabled={totalPieces <= 0}
          rightIcon={<ArrowRight size={18} />}
        >
          Upload Artwork & Logo
        </Button>
      </div>
    </div>
  );
}
