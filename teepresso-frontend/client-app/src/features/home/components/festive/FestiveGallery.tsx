import React from 'react';
import { useScrollReveal } from '@/common/hooks/useScrollReveal';
import styles from './FestiveGallery.module.css';

const images = [
  { src: '/images/gallery/gallery-1.jpg', alt: 'Community Event 1', spanClass: styles.spanWide },
  { src: '/images/gallery/gallery-2.jpg', alt: 'Kurta Close Up', spanClass: styles.spanSquare },
  { src: '/images/gallery/gallery-3.jpg', alt: 'Group Photo', spanClass: styles.spanTall },
  { src: '/images/gallery/gallery-4.jpg', alt: 'Festive Wear', spanClass: styles.spanSquare },
  { src: '/images/gallery/gallery-5.jpg', alt: 'Logo Detail', spanClass: styles.spanWide }
];

export const FestiveGallery = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section className={styles.section} ref={ref}>
      <div className="container">
        <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
          <h2 className={styles.title}>Worn by communities everywhere.</h2>
        </div>
        
        <div className={styles.masonryGrid}>
          {images.map((img, index) => (
            <div 
              key={index} 
              className={`${styles.imageWrapper} ${img.spanClass} ${isVisible ? styles.imageVisible : ''}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Fallback styling for when actual images are missing */}
              <div className={styles.imagePlaceholder}>
                <div className={styles.shimmerEffect}></div>
              </div>
              <img src={img.src} alt={img.alt} className={styles.image} />
              
              <div className={styles.overlay}>
                <span className={styles.overlayText}>{img.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
