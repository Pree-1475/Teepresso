'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Card, CardContent } from '@/common/components/ui/Card/Card';
import styles from './TestimonialsSection.module.css';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Event Coordinator',
    organization: 'Global Tech Summit',
    content: 'T Presso delivered 5,000 perfectly printed event tees exactly on time. Their dedicated account manager made the entire process completely stress-free.',
    logo: 'GT'
  },
  {
    id: 2,
    name: 'Michael Chang',
    role: 'Director of Student Affairs',
    organization: 'State University',
    content: 'We order merchandise for 20+ student clubs every semester. The quality control and transparent pricing have saved us thousands of dollars.',
    logo: 'SU'
  },
  {
    id: 3,
    name: 'Priya Sharma',
    role: 'HR Manager',
    organization: 'Innovate Solutions',
    content: 'The employee onboarding kits they helped us design and print are fantastic. The hoodies are now everyone\'s favorite office wear.',
    logo: 'IS'
  }
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000); // Subtle, not too fast
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Trusted by the best</h2>
          <p className={styles.description}>Don&apos;t just take our word for it.</p>
        </div>

        <div className={styles.carouselContainer}>
          <button className={styles.navButton} onClick={prevSlide} aria-label="Previous testimonial">
            <ChevronLeft size={24} />
          </button>

          <div className={styles.carouselTrack}>
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
                style={{ transform: `translateX(${100 * (index - currentIndex)}%)` }}
              >
                <Card className={styles.testimonialCard}>
                  <CardContent className={styles.cardContent}>
                    <Quote className={styles.quoteIcon} size={48} />
                    <p className={styles.testimonialText}>&quot;{testimonial.content}&quot;</p>
                    <div className={styles.authorArea}>
                      <div className={styles.authorLogo}>{testimonial.logo}</div>
                      <div className={styles.authorInfo}>
                        <h4 className={styles.authorName}>{testimonial.name}</h4>
                        <p className={styles.authorRole}>{testimonial.role}</p>
                        <p className={styles.authorOrg}>{testimonial.organization}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <button className={styles.navButton} onClick={nextSlide} aria-label="Next testimonial">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className={styles.dots}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
