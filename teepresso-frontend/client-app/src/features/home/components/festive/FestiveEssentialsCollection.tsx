import React from 'react';
import Link from 'next/link';
import { ArrowRight, Box } from 'lucide-react';
import styles from './FestiveEssentialsCollection.module.css';
import { PRODUCTS_CATALOG } from '@/features/catalog/data/productsData';

export const FestiveEssentialsCollection = () => {
  const essentials = PRODUCTS_CATALOG.filter(p => ['festive-pagdi', 'festive-pancha', 'festive-khanduva', 'festive-zari-khanduva'].includes(p.id));

  if (essentials.length === 0) return null;

  return (
    <section className={styles.section} id="essentials">
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
            <span style={{color: '#E67E22', fontSize: '18px'}}>✦</span>
            Festive Essentials
            <span style={{color: '#E67E22', fontSize: '18px'}}>✦</span>
          </h2>
        </div>

        <div className={styles.grid}>
          {essentials.map(product => (
            <Link key={product.id} href={`/product/${product.id}`} className={styles.card}>
              <div className={styles.cardImageWrapper}>
                <img src={product.image} alt={product.name} className={styles.cardImage} />
              </div>
              <div className={styles.cardContent}>
                <div className={styles.icon}>
                  <Box size={20} color="#8C5940" strokeWidth={1.5} />
                </div>
                <h3 className={styles.cardTitle}>{product.name}</h3>
                <div className={styles.price}>{product.priceRange}</div>
                <div className={styles.shopBtn}>Shop Now <ArrowRight size={14} /></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
