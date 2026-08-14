import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useScrollReveal } from '@/common/hooks/useScrollReveal';
import styles from './FestiveKurtaCollection.module.css';

const collection = [
  {
    id: 1,
    name: "Classic Saffron",
    hex: "#D35400",
    desc: "A bright, energetic tone designed to stand out in morning processions."
  },
  {
    id: 2,
    name: "Festive Maroon",
    hex: "#800000",
    desc: "Deep and incredibly rich. The perfect shade for evening aarti."
  },
  {
    id: 3,
    name: "Warm Beige",
    hex: "#D9CDBF",
    desc: "An elegant, understated neutral tailored for committee organizers."
  }
];

export const FestiveKurtaCollection = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section className={styles.section} ref={ref}>
      <div className={`container ${styles.container}`}>
        
        <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
          <h2 className={styles.title}>The Collection</h2>
          <p className={styles.subtitle}>Premium slub cotton. Three signature shades.</p>
        </div>

        <div className={styles.grid}>
          {collection.map((item, index) => (
            <div 
              key={item.id} 
              className={`${styles.card} ${isVisible ? styles.visible : ''}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className={styles.colorSwatch} style={{ backgroundColor: item.hex }}></div>
              <h3 className={styles.productName}>{item.name}</h3>
              <p className={styles.productDesc}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className={`${styles.footer} ${isVisible ? styles.visible : ''}`}>
          <Link href="/bulk-orders?product=custom-kurta-seasonal" className={styles.ctaLink}>
            Explore Bulk Pricing <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};
