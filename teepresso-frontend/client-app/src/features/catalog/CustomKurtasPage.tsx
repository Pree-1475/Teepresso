import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import { KURTA_STYLES, CUSTOMIZATION_EXAMPLES } from '@/features/catalog/data/kurtaData';
import styles from './custom-kurtas.module.css';

export function CustomKurtasPage() {
  const [activePlacementView, setActivePlacementView] = useState<'front' | 'back'>('front');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const placementData = {
    front: [
      { id: 'left-chest', label: 'Left Chest', x: 65, y: 35, desc: 'Ideal for society logos or committee emblems' },
      { id: 'right-chest', label: 'Right Chest', x: 35, y: 35, desc: 'Great for sponsor logos or batch year' },
      { id: 'sleeve-left', label: 'Left Sleeve', x: 88, y: 45, desc: 'Event branding or individual names' },
      { id: 'sleeve-right', label: 'Right Sleeve', x: 12, y: 45, desc: 'Secondary sponsors or taglines' }
    ],
    back: [
      { id: 'upper-back', label: 'Upper Back', x: 50, y: 25, desc: 'Large group names and loud graphics' },
      { id: 'mid-back', label: 'Mid Back', x: 50, y: 45, desc: 'Oversized festive artwork' },
      { id: 'nape', label: 'Nape / Yoke', x: 50, y: 15, desc: 'Small tagline or founding year' }
    ]
  };

  return (
    <div className={styles.pageContainer}>
      
      {/* 1. COMPACT PAGE HEADER */}
      <section className={styles.heroSection}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Custom Kurtas <span className={styles.heroTitleAccent}>for Groups</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Premium printed Kurtas for associations, societies, and events.
            </p>
          </div>
          <div className={styles.heroActions}>
            <Link href="/bulk-orders?product=custom-kurta-seasonal">
              <Button variant="primary" size="md" rightIcon={<ArrowRight size={16} />} className={styles.heroCta}>
                Start Order
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. KURTA OPTIONS (SURPRISE PILLS) */}
      <section className={styles.optionsSection}>
        <div className="container">
          <div className={styles.sectionHeaderCompact}>
            <h2 className={styles.sectionTitle}>Available Styles</h2>
            <p className={styles.sectionDesc}>Curated fabrics and fits optimized for group comfort.</p>
          </div>
          
          <div className={styles.optionsListSurprise}>
            {KURTA_STYLES.map((style, index) => (
              <div key={style.id} className={styles.surpriseStyleBox} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={styles.surpriseStyleIcon}>✦</div>
                <div className={styles.surpriseStyleInfo}>
                  <h3 className={styles.surpriseOptionName}>{style.name}</h3>
                  <div className={styles.surpriseOptionMeta}>
                    <span>{style.fabric}</span>
                    <span className={styles.surpriseMetaDivider}></span>
                    <span>{style.fit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BULK ORDERING & CTA */}
      <section className={styles.bulkSection}>
        <div className="container">
          <div className={styles.bulkContent}>
            <h2 className={styles.bulkTitle}>Built for Bulk. Designed for Groups.</h2>
            <p className={styles.bulkDesc}>
              Teepresso handles large-scale production. Tell us what your group needs, and we'll produce it in bulk with guaranteed quality and timely delivery across India.
            </p>
            
            <div className={styles.groupTags}>
              <span>Associations</span>
              <span>Societies</span>
              <span>Colleges</span>
              <span>Events</span>
              <span>Communities</span>
              <span>Committees</span>
            </div>

            <div className={styles.ctaWrapper}>
              <Link href="/bulk-orders?product=custom-kurta-seasonal">
                <Button variant="primary" size="xl" rightIcon={<ArrowRight size={20} />} className={styles.finalCta}>
                  START YOUR KURTA ORDER
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default CustomKurtasPage;
