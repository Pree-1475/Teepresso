import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './SeasonalKurtaSection.module.css';

export const SeasonalKurtaSection = () => {
  return (
    <section className={styles.campaignSection}>
      <div className="container">
        <Link href="/custom-kurtas" className={styles.bannerWrapper}>
          <Image
            src={`/images/kurtha-section-banner.png?v=${Date.now()}`}
            alt="Custom Kurtas Campaign"
            width={1200}
            height={300}
            className={styles.bannerImage}
            unoptimized={true}
          />
          {/* Real interactive button positioned over the banner */}
          <div 
            className={styles.buttonOverlay}
            style={{ position: 'absolute', bottom: '10%', left: '5%', zIndex: 10 }}
          >
            <span className={styles.solidButton}>
              Explore Kurtas Collection <ArrowRight size={16} className={styles.ctaIcon} />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
};
