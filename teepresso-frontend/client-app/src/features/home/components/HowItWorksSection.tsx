"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CheckCircle2, Star, Clock, ChevronDown } from 'lucide-react';
import { useScrollReveal } from '@/common/hooks/useScrollReveal';
import styles from './HowItWorksSection.module.css';
import { InstantQuoteSection } from './InstantQuoteSection';

/* ──────────────────────────────────────────────
   DATA (Crisp & Concise)
   ────────────────────────────────────────────── */
const steps = [
  {
    title: 'Submit Requirements',
    description: 'Select apparel styles, colors, and quantities for your bulk custom order.',
    image: '/images/process/step1.png',
    time: '≈ 5 Minutes',
  },
  {
    title: 'Upload Artwork',
    description: 'Provide your logo or artwork. Our team reviews it for print readiness or assists with design.',
    image: '/images/process/step2.png',
    time: 'Within 6 Hours',
  },
  {
    title: 'Approve Mockup',
    description: 'Review digital 3D proof. Production only begins after your final sign-off.',
    image: '/images/process/step3.png',
    time: 'Same Day',
  },
  {
    title: 'Production Begins',
    description: 'Crafted with premium fabrics using precision screen or sublimation printing.',
    image: '/images/process/step4.png',
    time: '2 – 4 Days',
  },
  {
    title: 'Order Delivered',
    description: 'Reliable nationwide doorstep delivery directly to your organization on schedule.',
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
   COMPONENT
   ────────────────────────────────────────────── */
export function HowItWorksSection() {
  const { ref: headerRef, isVisible: isHeaderVisible } = useScrollReveal({ threshold: 0.5 });
  const ordersCounter = useCountUp(12438);
  const ratingCounter = useCountUp(49, 1200);
  const [openStep, setOpenStep] = useState<number | null>(0);

  const handleToggle = (idx: number) => {
    setOpenStep((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className={styles.wrapper} id="instant-quote">
      <div className="container">
        
        <div className={styles.gridContainer}>
          
          {/* ═══════════════════════════════════════════
              LEFT COLUMN — INSTANT QUOTE CALCULATOR (LOCKED)
              ═══════════════════════════════════════════ */}
          <div className={styles.rightColumn}>
            <div className={styles.stickyCalculator}>
              <InstantQuoteSection embedded={true} />
            </div>
          </div>

          {/* ═══════════════════════════════════════════
              RIGHT COLUMN — ORDER JOURNEY TIMELINE (SCROLLING)
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
                      <Icon size={13} className={styles.topBadgeIcon} />
                      <span>{b.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.verticalTimeline}>
              {steps.map((step, idx) => {
                const isOpen = openStep === idx;
                return (
                  <div key={idx} className={`${styles.timelineStep} ${isOpen ? styles.stepOpen : ''}`}>
                    <div className={styles.timelineNode}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    
                    <div 
                      className={`${styles.timelineCard} ${isOpen ? styles.cardActive : ''}`}
                      onClick={() => handleToggle(idx)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isOpen}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleToggle(idx);
                        }
                      }}
                    >
                      <div className={styles.timelineIconWrapper}>
                        <Image
                          src={step.image}
                          alt={step.title}
                          width={36}
                          height={36}
                          style={{ objectFit: 'contain' }}
                          unoptimized={true}
                        />
                      </div>
                      <div className={styles.timelineText}>
                        <div className={styles.stepHeaderRow}>
                          <h3 className={styles.stepTitle}>{step.title}</h3>
                          <span 
                            className={`${styles.chevronWrap} ${isOpen ? styles.chevronOpen : ''}`} 
                            aria-hidden="true"
                          >
                            <ChevronDown size={15} />
                          </span>
                        </div>

                        <div className={`${styles.stepCollapsible} ${isOpen ? styles.stepCollapsibleOpen : ''}`}>
                          <div className={styles.stepInner}>
                            <p className={styles.stepDesc}>{step.description}</p>
                            <div className={styles.timePill}>
                              <Clock size={11} />
                              <span>{step.time}</span>
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
                      <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
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

        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
