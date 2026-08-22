'use client';

import React, { useState } from 'react';
import { Palette, Receipt, BarChart3, CheckCircle2, Map, Truck, Quote } from 'lucide-react';
import styles from './TrustAndReviewsSection.module.css';
import { Card, CardContent } from '@/common/components/ui/Card/Card';

const features = [
  {
    id: 'design',
    title: 'Dedicated Design Support',
    description: 'Expert designers review every file.',
    icon: Palette,
    testimonial: {
      name: 'Alex Mercer',
      role: 'Startup Founder',
      content: 'The design support team fixed our messy logo files and the final print looked incredible. Truly dedicated service.',
      logo: 'AM'
    }
  },
  {
    id: 'pricing',
    title: 'Transparent Pricing',
    description: 'No hidden fees or surprises.',
    icon: Receipt,
    testimonial: {
      name: 'Michael Chang',
      role: 'Director of Student Affairs',
      content: 'We order merchandise for 20+ student clubs every semester. The quality control and transparent pricing have saved us thousands of dollars.',
      logo: 'SU'
    }
  },
  {
    id: 'bulk',
    title: 'Bulk Expertise',
    description: 'Optimized for large-scale orders.',
    icon: BarChart3,
    testimonial: {
      name: 'Sarah Jenkins',
      role: 'Event Coordinator',
      content: 'T Presso delivered 5,000 perfectly printed event tees exactly on time. Their dedicated account manager made the entire process completely stress-free.',
      logo: 'GT'
    }
  },
  {
    id: 'quality',
    title: 'Strict Quality Checks',
    description: 'Multi-point inspection for perfection.',
    icon: CheckCircle2,
    testimonial: {
      name: 'Priya Sharma',
      role: 'HR Manager',
      content: 'Every single hoodie out of the 500 we ordered was flawless. The employee onboarding kits are now everyone\'s favorite office wear.',
      logo: 'IS'
    }
  },
  {
    id: 'tracking',
    title: 'Real-Time Tracking',
    description: 'Monitor your order end-to-end.',
    icon: Map,
    testimonial: {
      name: 'James Torres',
      role: 'Operations Lead',
      content: 'I loved being able to see exactly where our order was in production. No guessing needed, completely transparent workflow.',
      logo: 'JT'
    }
  },
  {
    id: 'delivery',
    title: 'Reliable Delivery',
    description: 'Guaranteed dates, nationwide logistics.',
    icon: Truck,
    testimonial: {
      name: 'Emily Ross',
      role: 'Marketing Director',
      content: 'They promised it by Friday for our major product launch event, and it arrived Thursday morning. Incredible reliability.',
      logo: 'ER'
    }
  }
];

export function TrustAndReviewsSection() {
  const [activeFeature, setActiveFeature] = useState(features[0].id);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Why Teams Trust Teepresso</h2>
          <p className={styles.description}>
            We combine premium quality with seamless service. Hover over our features to see what our customers say.
          </p>
        </div>

        {/* Desktop Layout */}
        <div className={styles.desktopLayout}>
          <div className={styles.featuresGrid}>
            {features.map((feature) => {
              const Icon = feature.icon;
              const isActive = feature.id === activeFeature;
              return (
                <div 
                  key={feature.id}
                  className={`${styles.featureCard} ${isActive ? styles.featureCardActive : ''}`}
                  onMouseEnter={() => setActiveFeature(feature.id)}
                >
                  <div className={styles.iconWrapper}>
                    <Icon size={24} />
                  </div>
                  <div className={styles.featureContent}>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureDesc}>{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.reviewStickyContainer}>
            <div className={styles.reviewShowcase}>
              {features.map((feature) => {
                const isActive = feature.id === activeFeature;
                return (
                  <Card 
                    key={`review-${feature.id}`} 
                    className={`${styles.testimonialCard} ${isActive ? styles.testimonialCardActive : ''}`}
                  >
                    <CardContent className={styles.cardContent}>
                      <Quote className={styles.quoteIcon} size={48} />
                      <p className={styles.testimonialText}>&quot;{feature.testimonial.content}&quot;</p>
                      <div className={styles.authorArea}>
                        <div className={styles.authorLogo}>{feature.testimonial.logo}</div>
                        <div className={styles.authorInfo}>
                          <h4 className={styles.authorName}>{feature.testimonial.name}</h4>
                          <p className={styles.authorRole}>{feature.testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className={styles.mobileLayout}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={`mobile-${feature.id}`} className={styles.mobileItem}>
                <div className={styles.mobileFeature}>
                  <div className={styles.iconWrapper}>
                    <Icon size={24} />
                  </div>
                  <div className={styles.featureContent}>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureDesc}>{feature.description}</p>
                  </div>
                </div>
                <Card className={styles.mobileTestimonialCard}>
                  <CardContent className={styles.mobileCardContent}>
                    <p className={styles.mobileTestimonialText}>&quot;{feature.testimonial.content}&quot;</p>
                    <div className={styles.mobileAuthorInfo}>
                      <h4 className={styles.authorName}>- {feature.testimonial.name}</h4>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
