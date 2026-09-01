import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/common/components/ui/Button/Button';
import { PRODUCTS_CATALOG } from '@/features/catalog/data/productsData';
import styles from './FestiveTabbedShowcase.module.css';

export function FestiveTabbedShowcase() {
  const [activeTab, setActiveTab] = useState<'kurtas' | 'khanduva' | 'pancha' | 'pagdi'>('kurtas');

  const kurta = PRODUCTS_CATALOG.find(p => p.id === 'custom-kurta-seasonal')!;
  const khanduva = PRODUCTS_CATALOG.find(p => p.id === 'festive-khanduva')!;
  const zariKhanduva = PRODUCTS_CATALOG.find(p => p.id === 'festive-zari-khanduva')!;
  const pancha = PRODUCTS_CATALOG.find(p => p.id === 'festive-pancha')!;
  const pagdi = PRODUCTS_CATALOG.find(p => p.id === 'festive-pagdi')!;

  const tabs = [
    { id: 'kurtas', label: '1. Kurtas' },
    { id: 'khanduva', label: '2. Khanduva' },
    { id: 'pancha', label: '3. Pancha' },
    { id: 'pagdi', label: '4. Pagdi' }
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'kurtas':
        return (
          <div className={styles.contentGrid} key="kurtas">
            <div className={styles.imageCol}>
              <img src={kurta.image} alt="Kurtas" className={styles.productImage} />
            </div>
            <div className={styles.infoCol}>
              <span className={styles.productCategory}>Festive Apparel</span>
              <h3 className={styles.productName}>Custom Kurtas</h3>
              <p className={styles.productDesc}>
                Custom printed ethnic wear for societies, fests, and celebrations. Choose from plain or patterned styles, customize with your logo, and order in bulk for your entire group.
              </p>
              
              <div className={styles.variantsGrid}>
                <div className={styles.variantCard}>
                  <span className={styles.variantName}>Plain Kurtas</span>
                  <span className={styles.variantPrice}>From ₹550 / pc</span>
                </div>
                <div className={styles.variantCard}>
                  <span className={styles.variantName}>Patterned Kurtas</span>
                  <span className={styles.variantPrice}>From ₹700 / pc</span>
                </div>
              </div>

              <div className={styles.actionRow}>
                <Link href={`/product/${kurta.id}`}>
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                    CUSTOMIZE & ORDER
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        );
      
      case 'khanduva':
        return (
          <div className={styles.contentGrid} key="khanduva">
            <div className={styles.imageCol}>
              <img src={khanduva.image} alt="Khanduva" className={styles.productImage} />
            </div>
            <div className={styles.infoCol}>
              <span className={styles.productCategory}>Festive Accessories</span>
              <h3 className={styles.productName}>Khanduva</h3>
              <p className={styles.productDesc}>
                Traditional shoulder drapes for respect and identity. Can be completely customized with your group's colors and logos to unify your team during festive rallies.
              </p>
              
              <div className={styles.variantsGrid}>
                <div className={styles.variantCard}>
                  <span className={styles.variantName}>Standard Khanduva</span>
                  <span className={styles.variantPrice}>{khanduva.priceRange}</span>
                </div>
                <div className={styles.variantCard}>
                  <span className={styles.variantName}>Zari Khanduva</span>
                  <span className={styles.variantPrice}>{zariKhanduva.priceRange}</span>
                </div>
              </div>

              <div className={styles.actionRow}>
                <Link href={`/product/${khanduva.id}`}>
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                    ADD TO CART
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        );

      case 'pancha':
        return (
          <div className={styles.contentGrid} key="pancha">
            <div className={styles.imageCol}>
              <img src={pancha.image} alt="Pancha" className={styles.productImage} />
            </div>
            <div className={styles.infoCol}>
              <span className={styles.productCategory}>Festive Bottoms</span>
              <h3 className={styles.productName}>Traditional Pancha</h3>
              <p className={styles.productDesc}>
                Classic festive bottoms with a premium subtle gold zari border. High-quality, comfortable fabric perfect for long cultural rallies and religious events.
              </p>
              
              <div className={styles.variantsGrid}>
                <div className={styles.variantCard}>
                  <span className={styles.variantName}>Standard Pancha</span>
                  <span className={styles.variantPrice}>{pancha.priceRange}</span>
                </div>
              </div>

              <div className={styles.actionRow}>
                <Link href={`/product/${pancha.id}`}>
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                    ADD TO CART
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        );

      case 'pagdi':
        return (
          <div className={styles.contentGrid} key="pagdi">
            <div className={styles.imageCol}>
              <img src={pagdi.image} alt="Pagdi" className={styles.productImage} />
            </div>
            <div className={styles.infoCol}>
              <span className={styles.productCategory}>Festive Headwear</span>
              <h3 className={styles.productName}>Festive Pagdi</h3>
              <p className={styles.productDesc}>
                Complete your group's traditional look with matching, vibrant headwear. Crafted for comfort and style to stand out during the most important celebrations.
              </p>
              
              <div className={styles.variantsGrid}>
                <div className={styles.variantCard}>
                  <span className={styles.variantName}>Traditional Pagdi</span>
                  <span className={styles.variantPrice}>{pagdi.priceRange}</span>
                </div>
              </div>

              <div className={styles.actionRow}>
                <Link href={`/product/${pagdi.id}`}>
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                    ADD TO CART
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <section className={styles.showcaseSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>The Festive Collection</h2>
          <p className={styles.sectionDesc}>Everything your group needs for the perfect traditional look.</p>
        </div>

        <div className={styles.tabsContainer}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {renderContent()}
      </div>
    </section>
  );
}
