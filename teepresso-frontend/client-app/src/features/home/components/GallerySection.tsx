import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './GallerySection.module.css';

interface ShowcaseProject {
  id: string;
  client: string;
  category: 'all' | 'college' | 'corporate' | 'sports' | 'hospitality';
  categoryLabel: string;
  subtitle: string;
  imageUrl: string;
}

const ALL_PROJECTS: ShowcaseProject[] = [
  {
    id: 'proj-bits',
    client: 'BITS Pilani – Waves Festival',
    category: 'college',
    categoryLabel: 'Colleges & Fests',
    subtitle: 'College Fest Merch',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj-iit',
    client: 'IIT Hyderabad – TechFest',
    category: 'college',
    categoryLabel: 'Colleges & Fests',
    subtitle: 'Event Merchandise',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj-razorpay',
    client: 'Razorpay – Annual Offsite',
    category: 'corporate',
    categoryLabel: 'Corporate & Startups',
    subtitle: 'Corporate Merch',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj-marathon',
    client: 'Bengaluru 10K City Run',
    category: 'sports',
    categoryLabel: 'Sports & Marathons',
    subtitle: 'Marathon Apparel',
    imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj-roost',
    client: 'Roost Specialty Coffee Roasters',
    category: 'hospitality',
    categoryLabel: 'Cafés & Hospitality',
    subtitle: 'Café & Hospitality',
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj-stripe',
    client: 'Stripe – DevSummit 2024',
    category: 'corporate',
    categoryLabel: 'Corporate & Startups',
    subtitle: 'Developer Capsule Merch',
    imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj-runclub',
    client: 'Cult.fit – Summer Run Club',
    category: 'sports',
    categoryLabel: 'Sports & Marathons',
    subtitle: 'Athletic Performance Tees',
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj-brew',
    client: 'Subko Specialty Coffee',
    category: 'hospitality',
    categoryLabel: 'Cafés & Hospitality',
    subtitle: 'Barista Aprons & Uniforms',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
  },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Projects' },
  { id: 'college', label: 'Colleges & Fests' },
  { id: 'corporate', label: 'Corporate & Startups' },
  { id: 'sports', label: 'Sports & Marathons' },
  { id: 'hospitality', label: 'Cafés & Hospitality' },
] as const;

export function GallerySection() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeIndex, setActiveIndex] = useState<number>(2); // Default to Razorpay center
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const filteredProjects = activeCategory === 'all'
    ? ALL_PROJECTS
    : ALL_PROJECTS.filter((p) => p.category === activeCategory);

  // Keep active index in bounds when category changes
  useEffect(() => {
    setActiveIndex(Math.min(Math.floor(filteredProjects.length / 2), filteredProjects.length - 1));
  }, [activeCategory, filteredProjects.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => Math.min(filteredProjects.length - 1, prev + 1));
  };

  // Drag / swipe handlers for touch & desktop
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (diff > 40) handleNext();
    else if (diff < -40) handlePrev();
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = startX - e.clientX;
    if (diff > 45) handleNext();
    else if (diff < -45) handlePrev();
    setIsDragging(false);
  };

  return (
    <section className={styles.section} id="recent-work">
      <div className="container">
        
        {/* Minimal Section Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <Sparkles size={12} className={styles.sparkleIcon} />
            <span>OUR RECENT WORK</span>
          </div>

          <h2 className={styles.title}>
            Crafted, Printed <span className={styles.ampersand}>&amp;</span> Delivered
          </h2>

          <p className={styles.subtitle}>
            A curated glimpse into custom apparel we&apos;ve created for colleges, startups, events, and more.
          </p>
        </div>

        {/* Clean Pill Category Filter */}
        <div className={styles.filterBar}>
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`${styles.filterPill} ${isActive ? styles.filterPillActive : ''}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 3D Arc / Fan Showcase Carousel */}
        <div
          className={styles.carouselContainer}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <div className={styles.cardsStage}>
            {filteredProjects.map((project, idx) => {
              const offset = idx - activeIndex;
              const isCenter = offset === 0;

              return (
                <div
                  key={project.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`${styles.projectCard} ${isCenter ? styles.projectCardCenter : ''}`}
                  style={{
                    '--card-offset': offset,
                  } as React.CSSProperties}
                  aria-label={project.client}
                >
                  <img
                    src={project.imageUrl}
                    alt={project.client}
                    className={styles.cardImage}
                    loading={Math.abs(offset) <= 2 ? 'eager' : 'lazy'}
                  />

                  {/* Gradient Scrim */}
                  <div className={styles.gradientOverlay}></div>

                  {/* Minimal Project Footer Info */}
                  <div className={styles.cardContent}>
                    <div className={styles.cardMeta}>
                      <h3 className={styles.clientTitle}>{project.client}</h3>
                      <span className={styles.cardSubtitle}>{project.subtitle}</span>
                    </div>

                    <div className={styles.arrowCircle}>
                      <ArrowUpRight size={15} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Minimal Dash Pagination */}
        <div className={styles.paginationBar}>
          {filteredProjects.map((_, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`${styles.pageDash} ${isActive ? styles.pageDashActive : ''}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Minimalist Bottom Statistics */}
        <div className={styles.bottomStatsRow}>
          <div className={styles.statMetric}>
            <span className={styles.statNumber}>150,000+</span>
            <span className={styles.statLabel}>Garments Delivered</span>
          </div>

          <div className={styles.statDot}>•</div>

          <div className={styles.statMetric}>
            <span className={styles.statNumber}>★ 4.9/5</span>
            <span className={styles.statLabel}>Customer Rating</span>
          </div>

          <div className={styles.statDot}>•</div>

          <div className={styles.statMetric}>
            <span className={styles.statNumber}>100% Free</span>
            <span className={styles.statLabel}>Digital Mockup</span>
          </div>
        </div>

      </div>
    </section>
  );
}

export default GallerySection;
