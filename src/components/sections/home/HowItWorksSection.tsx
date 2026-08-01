"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ClipboardList, CheckCircle2, Star, Users, Shirt,
  Droplet, Check, Shield, ArrowRight,
  Clock, Layers, Sprout
} from 'lucide-react';
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
  const [product, setProduct] = useState('T-Shirt');
  const [fabric, setFabric] = useState('Cotton');
  const [printing, setPrinting] = useState('Screen Print');
  const [quantity, setQuantity] = useState('100');

  const ordersCounter = useCountUp(12438);
  const ratingCounter = useCountUp(49, 1200);

  // Placeholder price calculation
  const basePrices: Record<string, number> = {
    'T-Shirt': 125, 'Polo': 175, 'Hoodie': 350, 'Oversized': 195, 'Sweatshirt': 295,
  };
  const fabricMul: Record<string, number> = {
    'Cotton': 1, 'Polyester': 0.85, 'Blend': 0.95, 'Tri-Blend': 1.15,
  };
  const base = (basePrices[product] ?? 125) * (fabricMul[fabric] ?? 1);
  const qty = parseInt(quantity) || 100;
  let discount = 0;
  if (qty >= 500) discount = 15;
  else if (qty >= 250) discount = 10;
  else if (qty >= 100) discount = 5;
  const pricePerPiece = Math.round(base * (1 - discount / 100));
  const savings = Math.round(base) - pricePerPiece;

  return (
    <section className={styles.wrapper}>

      {/* ═══════════════════════════════════════════
          PART 1 — DARK PROCESS TIMELINE
          ═══════════════════════════════════════════ */}
      <div className={styles.darkSection}>
        <div className="container">

          {/* Section header */}
          <div className={styles.header}>
            <div className={styles.journeyPill}>
              <Star size={12} /> YOUR ORDER JOURNEY
            </div>
            <h2 className={styles.mainTitle}>
              From Idea to T-Shirt in 5 Simple Steps
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

          {/* Process timeline */}
          <div className={styles.processContainer}>
            {/* Custom wavy dashed thread line */}
            <div className={styles.threadLine}>
              <svg width="2400" height="150" viewBox="0 0 2400 150" fill="none" className={styles.threadSvg}>
                <path 
                  d="M 0 120 C 400 120, 480 30, 580 30 L 1820 30 C 1920 30, 2000 120, 2400 120" 
                  stroke="#D4C3A3" 
                  strokeWidth="2" 
                  strokeDasharray="8 8"
                  strokeLinecap="round"
                />
              </svg>
              <div className={styles.threadShirt}>
                <div className={styles.shirtIcon}>
                  <Shirt size={18} color="#2D1A13" />
                </div>
              </div>
            </div>

            {/* 5 receipt-style cards */}
            <div className={styles.tagsWrapper}>
              {steps.map((step, idx) => (
                  <div key={idx} className={styles.receiptTag}>
                    
                    {/* Step number circle sits half on top of the card, acting as the node */}
                    <div className={styles.stepNumber}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>

                    {/* Card body with zig-zag edges */}
                    <div className={styles.tagBody}>
                      <div className={styles.tagContent}>
                        <div className={styles.tagIconWrapper}>
                          <Image
                            src={`${step.image}?v=${Date.now()}`}
                            alt={step.title.replace('\n', ' ')}
                            width={110}
                            height={110}
                            style={{ objectFit: 'contain' }}
                            unoptimized={true}
                            className={idx === 2 ? styles.step3Image : ''}
                          />
                        </div>
                        <h3 className={styles.stepTitle}>
                          {step.title.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                              {line}
                              {i < step.title.split('\n').length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </h3>
                        <p className={styles.stepDesc}>{step.description}</p>
                        <div className={styles.timePill}>
                          <Clock size={12} />
                          {step.time}
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════
          FLOATING STATS BAR
          ═══════════════════════════════════════════ */}
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

          <div className={styles.statDivider} />

          <div className={styles.statItemRow}>
            <Users size={24} color="#D4C3A3" />
            <div className={styles.statItemCol}>
              <div className={styles.statValue}>Serving</div>
              <div className={styles.statLabel}>120+ Colleges</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          PART 2 — LIGHT QUOTE CALCULATOR
          ═══════════════════════════════════════════ */}
      <div className={styles.lightSection}>
        <div className="container">
          <div className={styles.quoteGrid}>

            {/* Left — copy & trust bullets */}
            <div className={styles.quoteLeft}>
              <span className={styles.nextStep}>NEXT STEP</span>
              <h2 className={styles.quoteTitle}>
                Get an Instant<br />Quote
                <svg className={styles.squiggly} viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path d="M0 6 Q10 12, 20 6 T40 6 T60 6 T80 6 T100 6" fill="none" stroke="#B89B72" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
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

            {/* Right — calculator card */}
            <div>
              <div className={styles.quoteCard}>

                <div className={styles.formRow}>
                  {/* Product */}
                  <div className={styles.formGroup}>
                    <label htmlFor="calc-product">Product</label>
                    <div className={styles.selectWrap}>
                      <div className={styles.selectIcon}><Shirt size={16} /></div>
                      <select id="calc-product" value={product} onChange={e => setProduct(e.target.value)}>
                        <option>T-Shirt</option>
                        <option>Polo</option>
                        <option>Hoodie</option>
                        <option>Oversized</option>
                        <option>Sweatshirt</option>
                      </select>
                      <div className={styles.selectChevron}><ChevronUpDown /></div>
                    </div>
                  </div>

                  {/* Fabric */}
                  <div className={styles.formGroup}>
                    <label htmlFor="calc-fabric">Fabric</label>
                    <div className={styles.selectWrap}>
                      <div className={styles.selectIcon}><Layers size={16} /></div>
                      <select id="calc-fabric" value={fabric} onChange={e => setFabric(e.target.value)}>
                        <option>Cotton</option>
                        <option>Polyester</option>
                        <option>Blend</option>
                        <option>Tri-Blend</option>
                      </select>
                      <div className={styles.selectChevron}><ChevronUpDown /></div>
                    </div>
                  </div>

                  {/* Printing */}
                  <div className={styles.formGroup}>
                    <label htmlFor="calc-printing">Printing</label>
                    <div className={styles.selectWrap}>
                      <div className={styles.selectIcon}><Droplet size={16} /></div>
                      <select id="calc-printing" value={printing} onChange={e => setPrinting(e.target.value)}>
                        <option>Screen Print</option>
                        <option>Embroidery</option>
                        <option>DTF Print</option>
                        <option>Sublimation</option>
                      </select>
                      <div className={styles.selectChevron}><ChevronUpDown /></div>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className={styles.formGroup}>
                    <label htmlFor="calc-quantity">Quantity</label>
                    <div className={styles.selectWrap}>
                      <div className={styles.selectIcon}><Shirt size={16} /></div>
                      <select id="calc-quantity" value={quantity} onChange={e => setQuantity(e.target.value)}>
                        <option>50</option>
                        <option>100</option>
                        <option>250</option>
                        <option>500</option>
                        <option>1000</option>
                      </select>
                      <div className={styles.selectChevron}><ChevronUpDown /></div>
                    </div>
                  </div>

                  {/* Colors in Design */}
                  <div className={styles.formGroup}>
                    <label>Colors in Design</label>
                    <div className={styles.selectWrap}>
                      <div className={styles.colorDots}>
                        <div className={styles.colorDot} style={{ backgroundColor: '#1A1A1A' }} />
                        <div className={styles.colorDot} style={{ backgroundColor: '#1C3F60' }} />
                        <div className={styles.colorDot} style={{ backgroundColor: '#9E2A2B' }} />
                        <div className={styles.colorDot} style={{ backgroundColor: '#FFFFFF', border: '1px solid #ddd' }} />
                      </div>
                      <div className={styles.selectChevron}><ChevronUpDown /></div>
                    </div>
                  </div>
                </div>

                {/* Footer: price + CTA */}
                <div className={styles.cardFooter}>
                  <div className={styles.priceBlock}>
                    <span className={styles.priceLabel}>Estimated Price</span>
                    <div className={styles.priceRow}>
                      <span className={styles.priceAmount}>₹{pricePerPiece}</span>
                      <span className={styles.priceUnit}>/ piece</span>
                      {savings > 0 && (
                        <div className={styles.savingsBadge}>
                          <Sprout size={12} /> You save ₹{savings} per piece
                        </div>
                      )}
                    </div>
                  </div>
                  <Link href="/bulk-orders" className={styles.getQuoteBtn}>
                    Get Detailed Quote <ArrowRight size={16} />
                  </Link>
                </div>

              </div>
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
