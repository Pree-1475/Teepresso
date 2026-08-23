import React from 'react';
import Link from 'next/link';
import { GraduationCap, Briefcase, Sparkles, CalendarDays, HeartHandshake, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import styles from './industries.module.css';

const industries = [
  {
    icon: GraduationCap,
    title: 'Universities & Student Groups',
    desc: 'Custom t-shirts, hoodies, and event merchandise for college festivals, department clubs, and housing dorms. Student-friendly bulk discount rates.'
  },
  {
    icon: Briefcase,
    title: 'Corporate Teams & Offices',
    desc: 'Premium collared polo shirts, crewnecks, and hoodies embroidered with company logo. Perfect for office wear, conferences, and onboardings.'
  },
  {
    icon: Sparkles,
    title: 'Startups & Tech Teams',
    desc: 'Modern relaxed and oversized tees made of heavyweight cotton. Styled, retail-ready apparel with high-end print finishes for brand advocates.'
  },
  {
    icon: CalendarDays,
    title: 'Event Organizers',
    desc: 'Rapid production runs for festivals, concerts, and campaigns. High-visibility staff uniforms, volunteer shirts, and attendee merch.'
  },
  {
    icon: Trophy,
    title: 'Sports Clubs & Gyms',
    desc: 'Breathable, moisture-wicking dry-fit activewear customized with participant numbers, team names, and sponsor logos.'
  },
  {
    icon: HeartHandshake,
    title: 'NGOs & Communities',
    desc: 'Cost-efficient, budget-friendly high-volume printing options for non-profit organizations, colony groups, and social awareness drives.'
  }
];

export function IndustriesPage() {
  return (
    <div className={styles.pageContainer}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.subtitle}>Who We Serve</span>
          <h1 className={styles.title}>Custom Printing by Industry</h1>
          <p className={styles.description}>
            We design and manufacture premium custom apparel tailored to the needs, quantities, and budgets of every kind of organization.
          </p>
        </div>

        <div className={styles.grid}>
          {industries.map((ind, idx) => {
            const Icon = ind.icon;
            return (
              <div key={idx} className={styles.card}>
                <div className={styles.iconWrapper}>
                  <Icon size={22} />
                </div>
                <h3 className={styles.cardTitle}>{ind.title}</h3>
                <p className={styles.cardDesc}>{ind.desc}</p>
              </div>
            );
          })}
        </div>

        <div className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Have custom requirements?</h2>
          <p className={styles.ctaText}>
            Our printing consultants can help you choose the best fabrics, print techniques, and price brackets for your organization.
          </p>
          <Link href="/products">
            <Button rightIcon={<ArrowRight size={16} />}>Get a Custom Quote</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default IndustriesPage;
