"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ClipboardList, CheckCircle2, Star, Users, Shirt,
  Droplet, Check, Shield, ArrowRight,
  Clock, Layers, Sprout, Minus, Plus, User
} from 'lucide-react';
import { useScrollReveal } from '@/common/hooks/useScrollReveal';
import styles from './HowItWorksSection.module.css';

/* ──────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────── */
const steps = [
  {
    title: 'Submit\nRequirements',
    description: 'Tell us what you need. Select apparel types, colors, sizes and quantities for your bulk order.',
    image: '/images/process/step1.png',
    time: '≈ 5 Minutes',
  },
  {
    title: 'Upload\nArtwork',
    description: 'Provide your logo or design. Our experts review it for print readiness or help you create one.',
    image: '/images/process/step2.png',
    time: 'Within 6 Hours',
  },
  {
    title: 'Approve\nMockup',
    description: 'Review the digital proof we send. We never proceed to print without your final sign-off.',
    image: '/images/process/step3.png',
    time: 'Same Day',
  },
  {
    title: 'Production\nBegins',
    description: 'Your order is printed using high-quality techniques and undergoes strict quality control.',
    image: '/images/process/step4.png',
    time: '2 – 4 Days',
  },
  {
    title: 'Order\nDelivered',
    description: 'Fast, reliable nationwide shipping directly to your organization on the promised date.',
    image: '/images/process/step5.png',
    time: '5 – 7 Days',
  },
];

const trustBadges = [
  { text: 'Free Mockup', icon: CheckCircle2 },
  { text: 'No Setup Fee', icon: CheckCircle2 },
  { text: 'Dedicated Support', icon: CheckCircle2 },
  { text: 'Quality Checked', icon: CheckCircle2 },
  { text: 'Pan India Delivery', icon: CheckCircle2 },
];

const checkmarks = [
  'No hidden charges',
  'Best price guaranteed',
  'Bulk discounts auto-applied',
];

/* ──────────────────────────────────────────────
   ANIMATED COUNTER HOOK
   ────────────────────────────────────────────── */
function useCountUp(end: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { ref, value };
}

/* ──────────────────────────────────────────────
   CHEVRON SVG
   ────────────────────────────────────────────── */
const ChevronUpDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="7 15 12 20 17 15" />
    <polyline points="7 9 12 4 17 9" />
  </svg>
);

/* ──────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────── */
export function HowItWorksSection() {
  const [product, setProduct] = useState('Kurta');
  const [quantity, setQuantity] = useState('50');
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  const { ref: headerRef, isVisible: isHeaderVisible } = useScrollReveal({ threshold: 0.5 });
  const ordersCounter = useCountUp(12438);
  const ratingCounter = useCountUp(49, 1200);

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
  const savingsPerPiece = Math.round(base) - pricePerPiece;

  return (
    <section className={styles.wrapper}>
      <div className="container">
        
        <div className={styles.gridContainer}>
          
          {/* ═══════════════════════════════════════════
              LEFT COLUMN — HEADER & VERTICAL TIMELINE
              ═══════════════════════════════════════════ */}
          <div className={styles.leftColumn}>
            
            <div className={`${styles.header} ${isHeaderVisible ? styles.headerVisible : ''}`} ref={headerRef}>
              <div className={styles.journeyPill}>
                <Star size={12} /> YOUR ORDER JOURNEY
              </div>
              <h2 className={styles.mainTitle}>
                <div className={styles.animatedHeadingWrapper}>
                  <span className={styles.ideaText}>Idea</span>
                  <span className={styles.arrowTshirtWrapper}>
                    <span className={styles.arrow}>→</span>
                    <span className={styles.tshirtText}>T-Shirt</span>
                  </span>
                </div>
                <div className={styles.inStepsText}>
                  in 5 Simple Steps
                </div>
              </h2>
              <p className={styles.mainSubtitle}>
                We make custom apparel easy, transparent and reliable.
              </p>
              <div className={styles.topBadgesRow}>
                {trustBadges.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={i} className={styles.topBadge}>
                      <Icon size={15} className={styles.topBadgeIcon} />
                      <span>{b.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.verticalTimeline}>
              {steps.map((step, idx) => {
                const isExpanded = expandedStep === idx;
                return (
                  <div 
                    key={idx} 
                    className={`${styles.timelineStep} ${isExpanded ? styles.isExpanded : ''}`}
                    onClick={() => setExpandedStep(isExpanded ? null : idx)}
                  >
                    <div className={styles.timelineNode}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    
                    <div className={styles.timelineContent} data-step={String(idx + 1).padStart(2, '0')}>
                      <div className={styles.timelineIconWrapper}>
                        <Image
                          src={`${step.image}?v=${Date.now()}`}
                          alt={step.title.replace('\n', ' ')}
                          width={60}
                          height={60}
                          style={{ objectFit: 'contain' }}
                          unoptimized={true}
                        />
                      </div>
                      <div className={styles.timelineText}>
                        <div className={styles.stepTitleRow}>
                          <h3 className={styles.stepTitle}>
                            {step.title.replace('\n', ' ')}
                          </h3>
                          <div className={styles.accordionChevron}>
                            <ChevronUpDown />
                          </div>
                        </div>
                        <div className={styles.accordionBody}>
                          <div className={styles.accordionInner}>
                            <p className={styles.stepDesc}>{step.description}</p>
                            <div className={styles.timePill}>
                              <Clock size={12} />
                              {step.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.statsBarContainer}>
              <div className={styles.statsBar} ref={ordersCounter.ref}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>
                    {ordersCounter.value.toLocaleString('en-IN')}+
                  </div>
                  <div className={styles.statLabel}>Orders Delivered</div>
                </div>

                <div className={styles.statDivider} />

                <div className={styles.statItem} ref={ratingCounter.ref}>
                  <div className={styles.ratingStars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                    ))}
                    <span className={styles.statValue}>
                      {(ratingCounter.value / 10).toFixed(1)}/5
                    </span>
                  </div>
                  <div className={styles.statLabel}>Customer Rating</div>
                </div>
              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════════
              RIGHT COLUMN — STICKY CALCULATOR
              ═══════════════════════════════════════════ */}
          <div className={styles.rightColumn}>
            <div className={styles.stickyCalculator}>
              
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

        </div>
      </div>
    </section>
  );
}
