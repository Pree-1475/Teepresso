import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shirt, Grip, Layers } from 'lucide-react';
import styles from './FestiveKurtaCollection.module.css';

export const FestiveKurtaCollection = () => {
  return (
    <section className={styles.section} id="kurtas">
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
            <span style={{color: '#E67E22', fontSize: '18px'}}>✦</span>
            Kurta Collections
            <span style={{color: '#E67E22', fontSize: '18px'}}>✦</span>
          </h2>
        </div>

        <div className={styles.grid}>
          {/* Card 1 */}
          <Link href="/product/custom-kurta-seasonal" className={styles.card}>
            <div className={styles.cardImageWrapper}>
              <img 
                src="/images/products/plain-kurta-model.png" 
                alt="Plain Kurtas" 
                className={styles.cardImage} 
                style={{ mixBlendMode: 'multiply', objectFit: 'contain' }}
              />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.icon}>
                <Shirt size={20} color="#8C5940" strokeWidth={1.5} />
              </div>
              <h3 className={styles.cardTitle}>Plain Kurtas</h3>
              <div className={styles.price}>From ₹150 / piece</div>
              <div className={styles.shopBtn}>Shop Now <ArrowRight size={14} /></div>
            </div>
          </Link>

          {/* Card 2 */}
          <Link href="/product/kurta-patterned" className={styles.card}>
            <div className={styles.cardImageWrapper}>
              <img 
                src="/images/products/custom-kurta-model.png" 
                alt="Custom Print Kurtas" 
                className={styles.cardImage} 
                style={{ mixBlendMode: 'multiply', objectFit: 'contain' }}
              />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.icon}>
                <Grip size={20} color="#8C5940" strokeWidth={1.5} />
              </div>
              <h3 className={styles.cardTitle}>Plain Kurtas with Custom Prints</h3>
              <div className={styles.price}>From ₹180 / piece</div>
              <div className={styles.shopBtn}>Shop Now <ArrowRight size={14} /></div>
            </div>
          </Link>

          {/* Card 3 */}
          <Link href="/product/kurta-patterned" className={styles.card}>
            <div className={styles.cardImageWrapper}>
              <img 
                src="/images/products/textured-kurta-model.png" 
                alt="Textured Kurtas" 
                className={styles.cardImage} 
                style={{ mixBlendMode: 'multiply', objectFit: 'contain' }}
              />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.icon}>
                <Layers size={20} color="#8C5940" strokeWidth={1.5} />
              </div>
              <h3 className={styles.cardTitle}>Textured Kurtas</h3>
              <div className={styles.price}>From ₹250 / piece</div>
              <div className={styles.shopBtn}>Shop Now <ArrowRight size={14} /></div>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
};
