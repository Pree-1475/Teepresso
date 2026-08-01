import React from 'react';
import { ImageIcon } from 'lucide-react';
import styles from './GallerySection.module.css';

const galleryItems = [
  { id: 1, category: 'University Merch', size: 'large' },
  { id: 2, category: 'Corporate Event', size: 'small' },
  { id: 3, category: 'Sports Team', size: 'medium' },
  { id: 4, category: 'Startup Swag', size: 'small' },
  { id: 5, category: 'NGO Campaign', size: 'medium' },
  { id: 6, category: 'Restaurant Uniforms', size: 'large' },
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
                <ImageIcon size={48} className={styles.icon} />
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
