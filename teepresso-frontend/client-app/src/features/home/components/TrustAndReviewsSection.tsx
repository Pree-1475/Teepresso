'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';
import { useScrollReveal } from '@/common/hooks/useScrollReveal';
import styles from './TrustAndReviewsSection.module.css';

const reviews = [
  {
    name: 'Alex Mercer',
    role: 'Startup Founder',
    content: 'The design support team fixed our messy logo files and the final print looked incredible. Truly dedicated service.',
    logo: 'AM'
  },
  {
    name: 'Michael Chang',
    role: 'Director of Student Affairs',
    content: 'We order merchandise for 20+ student clubs every semester. The quality control and transparent pricing have saved us thousands of dollars.',
    logo: 'MC'
  },
  {
    name: 'Sarah Jenkins',
    role: 'Event Coordinator',
    content: 'T Presso delivered 5,000 perfectly printed event tees exactly on time. Their dedicated account manager made the entire process completely stress-free.',
    logo: 'SJ'
  }
];

export function TrustAndReviewsSection() {
  const { ref: headerRef, isVisible: isHeaderVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section className={styles.section}>
      <div className="container">
        <div 
          ref={headerRef} 
          className={`${styles.header} ${isHeaderVisible ? styles.visible : styles.hidden}`}
        >
          <h2 className={styles.title}>What our customers say</h2>
          <div className={styles.ratingSummary}>
             {[1, 2, 3, 4, 5].map(i => (
               <Star key={i} size={18} fill="#F59E0B" color="#F59E0B" />
             ))}
             <span className={styles.ratingText}>4.9/5 from 2,500+ Reviews</span>
          </div>
        </div>

        <div className={styles.reviewsGrid}>
          {reviews.map((review, idx) => (
            <ReviewCard key={idx} review={review} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review, index }: { review: any, index: number }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
  
  return (
    <div 
      ref={ref}
      className={`${styles.reviewCard} ${isVisible ? styles.cardVisible : styles.cardHidden}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <Quote className={styles.quoteIcon} size={24} />
      <p className={styles.reviewText}>"{review.content}"</p>
      <div className={styles.authorArea}>
        <div className={styles.authorLogo}>{review.logo}</div>
        <div className={styles.authorInfo}>
          <div className={styles.authorName}>{review.name}</div>
          <div className={styles.authorRole}>{review.role}</div>
        </div>
      </div>
    </div>
  );
}

export default TrustAndReviewsSection;
