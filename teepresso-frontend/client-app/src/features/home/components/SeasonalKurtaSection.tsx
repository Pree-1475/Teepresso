import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './SeasonalKurtaSection.module.css';

export const SeasonalKurtaSection = () => {
  return (
    <section className={styles.campaignSection}>
      <div className="container">
        
        <div className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.eyebrow}>Festive Collection</span>
            <h2 className={styles.title}>Custom Kurtas.</h2>
            <p className={styles.description}>
              Custom printed ethnic wear for societies, fests, and celebrations.
            </p>
          </div>
          <Link href="/custom-kurtas" className={styles.solidButton}>
            Explore Collection <ArrowRight size={16} className={styles.ctaIcon} />
          </Link>
        </div>

        <Link href="/custom-kurtas" className={styles.bannerWrapper}>
          <div className={styles.imageContent}>
            <Image
              src={`/images/kurtha-section-banner.png?v=${Date.now()}`}
              alt="Custom Kurtas Campaign"
              width={1200}
              height={300}
              className={styles.bannerImage}
              unoptimized={true}
              style={{ objectFit: 'cover' }}
            />
          </div>
        </Link>

      </div>
    </section>
  );
};
