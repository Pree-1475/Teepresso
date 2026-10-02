import React from 'react';
import { ImageIcon } from 'lucide-react';
import styles from './GallerySection.module.css';


const galleryItems = [
  { id: 1, category: 'IIT Hyderabad', size: 'large', image: '/images/gallery/iit_hyderabad.jpg' },
  { id: 2, category: 'TEDx Events', size: 'small', image: '/images/gallery/tedx.jpg' },
  { id: 3, category: 'Anurag University', size: 'medium', image: '/images/gallery/anurag.jpg' },
  { id: 4, category: 'Startup Swag', size: 'small', image: '/images/festive/festive_group_photo.png' },
  { id: 5, category: 'Corporate Merch', size: 'medium', image: '/images/products/plain-kurta-model.png' },
  { id: 6, category: 'Tech Fest Uniforms', size: 'large', image: '/images/gallery/iit_hyderabad.jpg' },
];

export function GallerySection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Our Recent Work</h2>
          <p className={styles.description}>
            Explore some of the bulk printing projects we&apos;ve delivered for our partners.
          </p>
        </div>

        <div className={styles.masonryGrid}>
          {galleryItems.map((item) => (
            <div key={item.id} className={`${styles.masonryItem} ${styles[item.size]}`}>
              <div className={styles.imagePlaceholder}>
                <img src={item.image} alt={item.category} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className={styles.overlay}>
                <span className={styles.category}>{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
