import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '@/common/config/api';
import { useStorefront } from '@/common/context/StorefrontContext';
import styles from './FeaturedProducts.module.css';

interface Product {
  id: string;
  name: string;
  category: string;
  startingPrice: number;
  priceRange?: string;
  image: string;
  colors?: string[];
  popularFor?: string;
}

export function FeaturedProducts() {
  const { storefrontMode } = useStorefront();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadFeaturedCatalog = async () => {
      try {
        // 1. Fetch settings to get chosen featured product IDs
        const settingsRes = await fetch(`${API_BASE_URL}/settings`);
        const settingsData = await settingsRes.json();
        const featuredIds: string[] = Array.isArray(settingsData.settings?.featuredProductIds)
          ? settingsData.settings.featuredProductIds
          : [];

        // 2. Fetch all products from DB
        const productsRes = await fetch(`${API_BASE_URL}/products`);
        const productsData = await productsRes.json();
        const allProducts: Product[] = Array.isArray(productsData.products) ? productsData.products : [];
        const eligibleProducts = storefrontMode === 'STANDARD'
          ? allProducts.filter(p => (p.category || '').toLowerCase() !== 'kurtas' && (p.category || '').toLowerCase() !== 'kurta')
          : allProducts;

        // 3. Filter to featured products in their specified order
        let displayed: Product[] = [];
        if (featuredIds.length > 0) {
          displayed = featuredIds
            .map(id => eligibleProducts.find(p => p.id === id))
            .filter((p): p is Product => !!p);
        }

        // 4. Fallback if no products are marked as featured yet: show top 6 products
        if (displayed.length === 0 && eligibleProducts.length > 0) {
          displayed = eligibleProducts.slice(0, 6);
        }

        setFeaturedProducts(displayed);
      } catch (err) {
        console.error('Failed to load featured products for catalog section:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedCatalog();
  }, []);

  return (
    <section className={styles.section}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.subtitle}>Curated Collection</span>
            <h2 className={styles.title}>Catalog.</h2>
          </div>
          <Link href="/products" className={styles.btnOutline}>
            View Full Catalog <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
            Loading curated products...
          </div>
        ) : (
          <div className={styles.simpleGrid}>
            {featuredProducts.map((product) => (
              <Link 
                key={product.id} 
                href={`/product/${product.id}`} 
                className={styles.simpleCard}
              >
                <div className={styles.cardImageWrapper}>
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'}
                    alt={product.name}
                    className={styles.cardImage}
                    loading="lazy"
                  />
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{product.name}</h3>
                  <span className={styles.cardPrice}>From ₹{product.startingPrice}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Faint Background Sewing Machine Illustration */}
      <svg 
        className={styles.sewingMachineBg} 
        viewBox="0 0 200 150" 
        fill="currentColor"
      >
        <path d="M20,130 L180,130 C182,130 185,128 185,125 L185,120 L15,120 L15,125 C15,128 18,130 20,130 Z" />
        <path d="M40,120 L40,60 C40,40 60,30 90,30 L140,30 C160,30 170,45 170,60 L170,120" stroke="currentColor" strokeWidth="6" fill="none" />
        <circle cx="160" cy="55" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
        <path d="M60,30 L60,15 L70,15 L70,30" />
        <path d="M80,50 L80,90" stroke="currentColor" strokeWidth="4" />
        <path d="M76,90 L84,90" stroke="currentColor" strokeWidth="4" />
      </svg>
    </section>
  );
}

export default FeaturedProducts;
