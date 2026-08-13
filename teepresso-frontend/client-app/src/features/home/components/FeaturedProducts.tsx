import React from 'react';
import Link from 'next/link';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import { Card, CardContent } from '@/common/components/ui/Card/Card';
import styles from './FeaturedProducts.module.css';

const products = [
  { name: 'Round Neck T-Shirts', desc: 'Classic comfort for any occasion. Available in 100% cotton and blends.', link: '/products' },
  { name: 'Polo T-Shirts', desc: 'Professional look for corporate teams and events. Breathable pique fabrics.', link: '/products' },
  { name: 'Hoodies', desc: 'Premium heavy-weight and lightweight hoodies for all seasons.', link: '/products' },
  { name: 'Sweatshirts', desc: 'Classic crewneck sweatshirts, perfect for university merchandise.', link: '/products' },
  { name: 'Jerseys', desc: 'Moisture-wicking athletic wear for sports teams and active events.', link: '/products' },
  { name: 'Custom Kurtas', desc: 'Group custom-printed traditional kurtas for colonies & festive events.', link: '/custom-kurtas' },
  { name: 'Tote Bags', desc: 'Eco-friendly canvas bags for promotional events and giveaways.', link: '/products' },
  { name: 'Corporate Merch', desc: 'Curated gift boxes, notebooks, and premium corporate accessories.', link: '/products' },
];

export function FeaturedProducts() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.subtitle}>OUR CATALOG</span>
            <h2 className={styles.title}>Premium Apparel for Bulk Orders</h2>
            <p className={styles.description}>
              We source high-quality apparel built for printing, ensuring your design looks perfect and lasts longer.
            </p>
          </div>
          <Link href="/products" className={styles.btnOutline}>
            View Full Catalog <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.grid}>
          {products.map((product, index) => (
            <Card key={index} className={styles.card} hoverable>
              <div className={styles.imagePlaceholder}>
                <ImageIcon size={48} className={styles.placeholderIcon} />
                <span className={styles.placeholderText}>Image / {product.name}</span>
              </div>
              <CardContent className={styles.content}>
                <h3 className={styles.productTitle}>{product.name}</h3>
                <p className={styles.productDesc}>{product.desc}</p>
                <div className={styles.action}>
                  <Link href={product.link}>
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={16} />} className={styles.viewDetailsBtn}>
                      Explore {product.name}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
