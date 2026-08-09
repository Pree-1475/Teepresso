'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { PRODUCTS_CATALOG, CATEGORIES, ProductItem } from '@/data/productsData';
import styles from './products.module.css';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredProducts = selectedCategory === 'All'
    ? PRODUCTS_CATALOG
    : PRODUCTS_CATALOG.filter(p => p.category === selectedCategory);

  return (
    <div className={styles.pageContainer}>
      
      {/* 1. Compact Page Hero */}
      <section className={styles.heroSection}>
        <div className="container">
          <span className={styles.heroSubtitle}>Teepresso Collections</span>
          <h1 className={styles.heroTitle}>Custom Apparel, Made for Your Group</h1>
          <p className={styles.heroDescription}>
            Premium bulk t-shirts, hoodies, polos, and seasonal kurtas customized with your team emblem, logo, or design. Fast turnarounds and transparent volume pricing.
          </p>

          <div className={styles.heroTrustBadges}>
            <div className={styles.badgeItem}>
              <ShieldCheck size={16} color="var(--color-primary-600)" /> 100% Quality Guaranteed
            </div>
            <div className={styles.badgeItem}>
              <Truck size={16} color="var(--color-primary-600)" /> Express Delivery Across India
            </div>
            <div className={styles.badgeItem}>
              <CheckCircle2 size={16} color="var(--color-primary-600)" /> Free Digital Mockup
            </div>
          </div>
        </div>
      </section>

      {/* 2. Product Category Navigation */}
      <div className={styles.categoryNavWrapper}>
        <div className="container">
          <nav className={styles.categoryNav} aria-label="Product categories">
            {CATEGORIES.map(category => {
              const isActive = selectedCategory === category;
              const isKurta = category === 'Kurtas';
              return (
                <button
                  key={category}
                  className={`${styles.chipBtn} ${isActive ? styles.chipBtnActive : ''} ${isKurta && !isActive ? styles.chipKurta : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {isKurta ? '✨ Custom Kurtas' : category}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="container">
        
        {/* 4. Quantity / Bulk Context Banner */}
        <div className={styles.bulkContextBanner}>
          <div className={styles.bulkBannerText}>
            <Sparkles size={20} color="var(--color-primary-600)" />
            <span>
              <strong>Volume Pricing Applies:</strong> Higher quantities unlock lower per-piece rates!
            </span>
          </div>
          <div className={styles.bulkTiers}>
            <span className={styles.tierPill}>25–50 Pcs</span>
            <span className={styles.tierPill}>51–150 Pcs</span>
            <span className={styles.tierPill}>151+ Pcs (Best Value)</span>
          </div>
        </div>

        {/* 3. Product Catalogue Grid */}
        <div className={styles.catalogGrid}>
          {filteredProducts.map(product => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.imageWrapper}>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={300}
                  className={styles.productImg}
                  unoptimized
                />
                <span className={styles.categoryTag}>{product.category}</span>
                <span className={styles.priceBadge}>{product.priceRange}</span>
              </div>

              <div className={styles.cardBody}>
                <h2 className={styles.productTitle}>{product.name}</h2>
                <p className={styles.productDesc}>{product.shortDesc}</p>

                <div className={styles.cardFooter}>
                  <div className={styles.swatchGroup} title="Available colors">
                    {product.colors.map((colorHex, idx) => (
                      <span
                        key={idx}
                        className={styles.swatchDot}
                        style={{ backgroundColor: colorHex }}
                      />
                    ))}
                  </div>

                  <Link href={`/bulk-orders?product=${product.id}`}>
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
                      Customize
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 5. Custom Kurta Seasonal Spotlight Entry */}
        <div className={styles.kurtaSpotlightBanner}>
          <div>
            <span className={styles.kurtaTag}>Festive & Cultural Seasonal Spotlight</span>
            <h2 className={styles.kurtaSpotlightTitle}>Custom Group Kurtas</h2>
            <p className={styles.kurtaSpotlightDesc}>
              Unify your college fest team, colony celebration, or community group with matching, high-quality custom printed kurtas. Crafted with premium breathable cotton and custom chest or back printing.
            </p>
            <Link href="/custom-kurtas" className={styles.kurtaBtn}>
              Explore Custom Kurta Experience <ArrowRight size={16} />
            </Link>
          </div>
          <div>
            <Image
              src="/images/kurtas/hero.png"
              alt="Custom Group Kurtas"
              width={500}
              height={300}
              className={styles.kurtaImgPreview}
              unoptimized
            />
          </div>
        </div>

        {/* 6. Simple CTA near the end */}
        <div className={styles.quoteCtaSection}>
          <h2 className={styles.quoteCtaTitle}>Not sure what you need?</h2>
          <p className={styles.quoteCtaDesc}>
            Tell us your group size, budget, and event dates. Our team will guide you to the perfect fabric, print method, and quantity discounts.
          </p>
          <Link href="/bulk-orders">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
              Get an Instant Quote
            </Button>
          </Link>
        </div>

      </div>

    </div>
  );
}
