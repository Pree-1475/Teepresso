import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import { PRODUCTS_CATALOG } from '@/features/catalog/data/productsData';
import styles from './products.module.css';

export function ProductsPage() {
  const [productsList, setProductsList] = useState(PRODUCTS_CATALOG);

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products)) {
          setProductsList(data.products);
        }
      })
      .catch(err => console.error('Failed to load products from backend:', err));
  }, []);

  return (
    <div className={styles.pageContainer}>
      
      {/* 1. Compact Page Hero */}
      <section className={styles.heroSection}>
        <div className="container">
          <span className={styles.heroSubtitle}>Teepresso Collections</span>
          <h1 className={styles.heroTitle}>Custom Apparel, Made for Your Group</h1>
          
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

      <div className="container" style={{ paddingTop: '32px' }}>
        
        {/* 2. Product Catalogue Grid */}
        <div className={styles.catalogGrid}>
          {productsList.map(product => (
            <Link key={product.id} to={`/product/${product.id}`} className={styles.productCard}>
              <div className={styles.imageWrapper}>
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1610996843657-3f82fc464c17?auto=format&fit=crop&q=80&w=800'}
                  alt={product.name}
                  className={styles.productImg}
                />
              </div>

              <div className={styles.cardBody}>
                <h2 className={styles.productTitle}>{product.name}</h2>
                <div className={styles.priceRow}>
                  <span className={styles.productPriceText}>{product.priceRange}</span>
                  <div className={styles.swatchGroup} title="Available colors">
                    {(product.colors || []).map((colorHex, idx) => (
                      <span
                        key={idx}
                        className={styles.swatchDot}
                        style={{ backgroundColor: colorHex }}
                      />
                    ))}
                  </div>
                </div>
                <span className={styles.globalOrderBtn}>
                  Customize & Order <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* 6. Simple CTA near the end */}
        <div className={styles.quoteCtaSection}>
          <h2 className={styles.quoteCtaTitle}>Not sure what you need?</h2>
          <p className={styles.quoteCtaDesc}>
            Tell us your group size, budget, and event dates. Our team will guide you to the perfect fabric, print method, and quantity discounts.
          </p>
          <Link to="/festive">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
              Explore Festive Collection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
