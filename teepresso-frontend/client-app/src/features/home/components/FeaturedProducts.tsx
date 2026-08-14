import React from 'react';
import Link from 'next/link';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import { Card, CardContent } from '@/common/components/ui/Card/Card';
import styles from './FeaturedProducts.module.css';

const products = [
  { name: 'Custom Kurtas', color: '#8C5B45', link: '/custom-kurtas', tagText: 'Festive Mode' },
  { name: 'T-Shirts', color: '#E8DED1', link: '/products', tagText: '100% Cotton' },
  { name: 'Polos', color: '#D4C5B9', link: '/products' },
  { name: 'Hoodies', color: '#C3B19E', link: '/products', tagText: 'Cozy Winter' },
  { name: 'Tote Bags', color: '#9CA3AF', link: '/products' },
  { name: 'Corporate Merch', color: '#2D1A13', link: '/products' },
];

export function FeaturedProducts() {
  return (
    <section className={styles.section}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2 className={styles.title}>Catalog.</h2>
          </div>
          <Link href="/products" className={styles.btnOutline}>
            View Full Catalog <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.simpleGrid}>
          {products.map((product, index) => (
            <Link key={index} href={product.link} className={styles.simpleCard}>
              {product.tagText && (
                <div className={styles.diagonalTag}>
                  <span>{product.tagText}</span>
                </div>
              )}
              <div className={styles.cardColorBlock} style={{ backgroundColor: product.color }}>
                {/* Visual placeholder for garment image */}
              </div>
              <div className={styles.cardText}>
                <h3 className={styles.cardTitle}>{product.name}</h3>
                <span className={styles.cardExplore}>Explore <ArrowRight size={14} style={{display: 'inline', verticalAlign: 'middle'}}/></span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Faint Background Sewing Machine Illustration (Detail 4) */}
      <svg 
        className={styles.sewingMachineBg} 
        viewBox="0 0 200 150" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M 20 120 L 180 120 L 180 130 C 180 135, 175 140, 170 140 L 30 140 C 25 140, 20 135, 20 130 Z" 
          fill="currentColor" 
        />
        <path 
          d="M 40 120 L 40 60 C 40 40, 60 30, 90 30 L 150 30 C 160 30, 170 38, 170 48 L 170 70 L 150 70 L 150 50 L 95 50 C 85 50, 80 55, 80 65 L 80 120 Z" 
          fill="currentColor" 
        />
        <circle cx="170" cy="55" r="18" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="170" cy="55" r="8" fill="currentColor" />
        <rect x="50" y="70" width="6" height="35" fill="currentColor" />
        <line x1="53" y1="105" x2="53" y2="118" stroke="currentColor" strokeWidth="2" />
        <rect x="110" y="15" width="20" height="15" rx="2" fill="currentColor" />
        <line x1="120" y1="15" x2="120" y2="30" stroke="currentColor" strokeWidth="1" />
      </svg>
    </section>
  );
}
