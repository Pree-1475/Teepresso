"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import styles from './TrustAndReviewsSection.module.css';

interface Review {
  name: string;
  role: string;
  category: string;
  content: string;
  initials: string;
}

const reviews: Review[] = [
  {
    name: 'Aarav Mehta',
    role: 'Founder, StackPulse',
    category: 'Tech Startup',
    content: 'The quality of the pique polo shirts was outstanding. 250 custom shirts arrived 3 days before our annual developer summit with flawless embroidery.',
    initials: 'AM',
  },
  {
    name: 'Priya Sundaram',
    role: 'Convener, BITS Waves Fest',
    category: 'College Fest',
    content: 'We needed 1,800 oversized festival tees on an impossibly tight deadline. Teepresso delivered ahead of schedule and the fabric thickness was praised by everyone.',
    initials: 'PS',
  },
  {
    name: 'Karan Singhania',
    role: 'Head of Operations, NexaCorp',
    category: 'Corporate Uniforms',
    content: 'The free 3D digital mockup review made getting leadership sign-off effortless. Our executive team now wears Teepresso polos across all 6 regional offices.',
    initials: 'KS',
  },
  {
    name: 'Neha Verma',
    role: 'Lead Organizer, RunBangalore 10K',
    category: 'Marathon & Sports',
    content: 'Finding breathable, sweat-wicking apparel that does not bleed color after washing is hard. Teepresso nailed the fit and print clarity for our 3,200 runners.',
    initials: 'NV',
  },
  {
    name: 'Rohan Desai',
    role: 'Creative Director, Roost Roasters',
    category: 'Hospitality & Cafes',
    content: 'Our baristas wash their heavy cotton tees daily. Six months in, the bio-washed fabric and high-density chest print still look as sharp as day one.',
    initials: 'RD',
  },
  {
    name: 'Ananya Roy',
    role: 'Community Lead, DesignSprint India',
    category: 'Creator Community',
    content: 'Zero setup fees and the freedom to mix sizes from S to XXL made ordering our annual merch pack completely headache-free. Will never order elsewhere.',
    initials: 'AR',
  },
];

export function TrustAndReviewsSection() {
  const [activeIndex, setActiveIndex] = useState(1);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasDragged = useRef(false);

  // Scroll to specific index smoothly
  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const cards = track.querySelectorAll<HTMLElement>(`.${styles.card}`);
    if (!cards[index]) return;

    const targetCard = cards[index];
    const trackCenter = track.clientWidth / 2;
    const cardCenter = targetCard.offsetLeft + targetCard.clientWidth / 2;
    const targetScrollLeft = cardCenter - trackCenter;

    track.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: 'smooth',
    });
    setActiveIndex(index);
  }, []);

  // Calculate the active index based on current scroll position
  const updateActiveFromScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const cards = track.querySelectorAll<HTMLElement>(`.${styles.card}`);
    if (cards.length === 0) return;

    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closestIdx = 0;
    let closestDist = Infinity;

    cards.forEach((card, idx) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const dist = Math.abs(cardCenter - trackCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });

    setActiveIndex(closestIdx);
  }, []);

  // Sync scroll on mount to initial card
  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToIndex(1);
    }, 150);
    return () => clearTimeout(timeout);
  }, [scrollToIndex]);

  // Track native scroll events (for mobile swipe and trackpad scrolling)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!isDragging.current) {
            updateActiveFromScroll();
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [updateActiveFromScroll]);

  // Pointer drag events for desktop
  const handlePointerDown = (e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;

    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - track.offsetLeft;
    scrollLeftStart.current = track.scrollLeft;

    try {
      track.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const track = trackRef.current;
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX.current) * 1.35;

    if (Math.abs(walk) > 5) {
      hasDragged.current = true;
    }

    track.scrollLeft = scrollLeftStart.current - walk;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    try {
      trackRef.current?.releasePointerCapture(e.pointerId);
    } catch (_) {}

    // Snap to closest card after momentum ends
    updateActiveFromScroll();
  };

  const handleCardClick = (idx: number) => {
    if (hasDragged.current) return;
    scrollToIndex(idx);
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < reviews.length - 1) {
      scrollToIndex(activeIndex + 1);
    }
  };

  return (
    <section className={styles.section} id="reviews">
      <div className="container">
        
        {/* Simple Editorial Header */}
        <div className={styles.header}>
          <span className={styles.label}>CUSTOMER STORIES</span>
          <h2 className={styles.heading}>Loved by the teams who wear us</h2>
          
          {/* Rating Summary */}
          <div className={styles.ratingSummary}>
            <div className={styles.starsRow} aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#D97706" color="#D97706" />
              ))}
            </div>
            <span className={styles.ratingText}>
              <strong>4.9/5</strong> from 2,500+ reviews
            </span>
          </div>
        </div>

      </div>

      {/* Full-Bleed Draggable & Swipeable Carousel Track */}
      <div className={styles.carouselContainer}>
        <div
          ref={trackRef}
          className={styles.track}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="region"
          aria-label="Customer Testimonials Carousel"
          tabIndex={0}
        >
          {reviews.map((rev, idx) => {
            const isActive = idx === activeIndex;

            return (
              <div
                key={idx}
                className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
                onClick={() => handleCardClick(idx)}
                role="article"
                aria-label={`Testimonial from ${rev.name}`}
              >
                {/* Category Pill and Subtle Quote Icon */}
                <div className={styles.cardTop}>
                  <span className={styles.categoryBadge}>{rev.category}</span>
                  <Quote size={16} className={styles.quoteIcon} aria-hidden="true" />
                </div>

                {/* Testimonial Quote */}
                <p className={styles.quoteText}>
                  "{rev.content}"
                </p>

                {/* Author Info */}
                <div className={styles.authorRow}>
                  <div className={styles.avatarCircle} aria-hidden="true">
                    <span>{rev.initials}</span>
                  </div>
                  <div className={styles.authorMeta}>
                    <div className={styles.authorName}>{rev.name}</div>
                    <div className={styles.authorRole}>{rev.role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Minimal Controls & Track Indicator Bar */}
      <div className="container">
        <div className={styles.controlsRow}>
          
          <button
            type="button"
            className={styles.navBtn}
            onClick={handlePrev}
            disabled={activeIndex === 0}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Interactive Progress Indicator Track */}
          <div className={styles.progressTrack} role="tablist" aria-label="Testimonial slides">
            {reviews.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                className={`${styles.progressDot} ${i === activeIndex ? styles.progressDotActive : ''}`}
                onClick={() => scrollToIndex(i)}
                aria-label={`Jump to review ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            className={styles.navBtn}
            onClick={handleNext}
            disabled={activeIndex === reviews.length - 1}
            aria-label="Next testimonial"
          >
            <ChevronRight size={16} />
          </button>

        </div>
      </div>

    </section>
  );
}

export default TrustAndReviewsSection;
