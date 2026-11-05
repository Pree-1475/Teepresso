import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Truck, Package } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import styles from './products.module.css';
import { API_BASE_URL } from '@/common/config/api';

interface Product {
  id: string;
  name: string;
  category: string;
  startingPrice: number;
  priceRange: string;
  colors: string[];
  image: string;
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveCatalog();
  }, []);

  const fetchLiveCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch categories
      try {
        const catRes = await fetch(`${API_BASE_URL}/categories`);
        const catData = await catRes.json();
        if (catData.success && Array.isArray(catData.categories)) {
          const names = catData.categories.map((c: any) => c.name);
          setCategories(['All', ...names]);
        }
      } catch (e) {
        console.error('Failed to load categories:', e);
      }

      // Fetch live products strictly from backend DB
      const res = await fetch(`${API_BASE_URL}/products`);
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setError(data.message || 'Failed to load products from database');
      }
    } catch (err) {
      console.error('Failed to load catalog:', err);
      setError('Network error: unable to reach database service.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className={styles.pageContainer}>
      
      {/* 1. Compact Page Hero */}
      <section className={styles.heroSection}>
        <div className="container">
          <span className={styles.heroSubtitle}>Teepresso Live Catalog</span>
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

      {/* 2. Dynamic Category Navigation */}
      <div className={styles.categoryNavWrapper}>
        <div className="container">
          <nav className={styles.categoryNav} aria-label="Product categories">
            {categories.map(category => {
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
        
        {error && (
          <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '24px', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #f3f4f6', borderTopColor: '#1a1a1a', borderRadius: '50%', margin: '0 auto' }}></div>
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading products live from database...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <Package size={48} color="#9ca3af" style={{ margin: '0 auto 16px auto' }} />
            <h3>No products found in category "{selectedCategory}"</h3>
            <p style={{ color: '#6b7280', marginTop: '4px' }}>Select another category or refresh the catalog.</p>
          </div>
        ) : (
          /* 3. Live Product Catalogue Grid */
          <div className={styles.catalogGrid}>
            {filteredProducts.map(product => (
              <Link key={product.id} to={`/product/${product.id}`} className={styles.productCard}>
                <div className={styles.imageWrapper}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className={styles.productImg}
                    loading="lazy"
                  />
                </div>

                <div className={styles.cardBody}>
                  <h2 className={styles.productTitle}>{product.name}</h2>
                  <span className={styles.productPriceText}>From ₹{product.startingPrice}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA Section */}
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
