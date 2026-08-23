"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList, CheckCircle2, Shirt,
  Droplet, Check, Shield, ArrowRight,
  Layers, Sprout, Minus, Plus, User
} from 'lucide-react';
import styles from './InstantQuoteSection.module.css';

const checkmarks = [
  'No hidden charges',
  'Best price guaranteed',
  'Bulk discounts auto-applied',
];

export function InstantQuoteSection() {
  const [product, setProduct] = useState('Kurta');
  const [quantity, setQuantity] = useState('50');

  const basePrices: Record<string, number> = {
    'Kurta': 599, 
    'Round Neck': 349, 
    'Polo': 499, 
    'Hoodie': 899, 
    'Sweatshirt': 699,
  };

  const qty = parseInt(quantity) || 50;
  const base = basePrices[product] ?? 349;
  
  let discount = 0;
  let microMsg = '';
  
  if (qty >= 500) {
    discount = 0.30;
    microMsg = 'Max bulk pricing applied! 🔥';
  } else if (qty >= 250) {
    discount = 0.25;
    microMsg = 'Excellent bulk rate unlocked.';
  } else if (qty >= 100) {
    discount = 0.15;
    microMsg = 'Great volume discount active.';
  } else if (qty >= 50) {
    discount = 0.05;
    microMsg = 'Basic volume discount applied.';
  }

  const pricePerPiece = Math.round(base * (1 - discount));
  const estimatedTotal = pricePerPiece * qty;

  return (
    <section className={styles.wrapper}>
      <div className="container">
        <div className={styles.centerContainer}>
          <div className={styles.quoteIntro}>
            <h2 className={styles.quoteTitle}>
              Get an Instant Quote
            </h2>
            <p className={styles.quoteDesc}>
              Fill in a few details and get your estimated price in under 30 seconds.
            </p>
            <div className={styles.quoteChecks}>
              {checkmarks.map((text, i) => (
                <div key={i} className={styles.checkItem}>
                  <div className={styles.checkCircle}>
                    <Check size={13} strokeWidth={3} color="#fff" />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.quoteCard}>
            <div className={styles.calculatorBody}>
              {/* Step 1: Product Selection */}
              <div className={styles.calcSection}>
                <label className={styles.calcLabel}>1. Select Product</label>
                <div className={styles.productChips}>
                  {Object.keys(basePrices).map((p) => (
                    <button 
                      key={p} 
                      type="button" 
                      className={`${styles.productChip} ${product === p ? styles.activeChip : ''} ${p === 'Kurta' ? styles.kurtaHighlightChip : ''}`}
                      onClick={() => setProduct(p)}
                    >
                      {p === 'Kurta' && <span className={styles.festiveBadge}>FESTIVE</span>}
                      <div className={styles.chipIcon}>
                        {p === 'Round Neck' && <Shirt size={20} />}
                        {p === 'Polo' && <User size={20} />}
                        {p === 'Hoodie' && <Layers size={20} />}
                        {p === 'Kurta' && <User size={20} />}
                        {p === 'Sweatshirt' && <Droplet size={20} />}
                      </div>
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Quantity Selection */}
              <div className={styles.calcSection}>
                <div className={styles.calcLabelRow}>
                  <label className={styles.calcLabel}>2. Select Quantity</label>
                  <span className={styles.calcHint}>More pieces = Better price</span>
                </div>
                
                <div className={styles.qtyStepperWrapper}>
                  <button 
                    type="button" 
                    className={styles.stepperBtn} 
                    onClick={() => setQuantity(String(Math.max(1, qty - 10)))}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={20} />
                  </button>
                  
                  <div className={styles.stepperInputWrap}>
                    <input 
                      type="number" 
                      className={styles.stepperInput} 
                      value={quantity} 
                      onChange={e => setQuantity(e.target.value)} 
                      min="1" 
                    />
                    <span className={styles.stepperSuffix}>Pieces</span>
                  </div>
                  
                  <button 
                    type="button" 
                    className={styles.stepperBtn} 
                    onClick={() => setQuantity(String(qty + 10))}
                    aria-label="Increase quantity"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                
                <div className={styles.qtyShortcuts}>
                  {[25, 50, 100, 250, 500].map((n) => (
                    <button 
                      key={n} 
                      type="button" 
                      className={styles.shortcutBtn} 
                      onClick={() => setQuantity(String(n))}
                    >
                      {n}{n === 500 && '+'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer: price + CTA */}
            <div className={styles.cardFooter}>
              <div className={styles.priceBlock}>
                <span className={styles.priceLabel}>Estimated Total</span>
                <div className={styles.priceRow}>
                  <span className={styles.totalPrice}>₹{estimatedTotal.toLocaleString('en-IN')}</span>
                  <span className={styles.perPiecePrice}>@ ₹{pricePerPiece}/pc</span>
                </div>
                <div className={styles.savingsBadge}>
                  {microMsg ? (
                    <><CheckCircle2 size={12} /> {microMsg}</>
                  ) : (
                    <><Sprout size={12} /> Enter a larger quantity for bulk pricing.</>
                  )}
                </div>
              </div>
              <Link href={`/product/${encodeURIComponent(product)}`} className={styles.getQuoteBtn}>
                Continue Order <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Bottom trust indicators */}
          <div className={styles.bottomTrustBar}>
            <div className={styles.bottomTrustItem}>
              <Shield size={14} /> 100% Secure
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.bottomTrustItem}>
              <ClipboardList size={14} /> No Obligation Quote
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.bottomTrustItem}>
              <CheckCircle2 size={14} /> Quick & Easy
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
