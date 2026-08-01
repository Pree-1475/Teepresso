import React from 'react';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Card, CardContent } from '@/components/ui/Card/Card';
import styles from './FeaturedProducts.module.css';

const products = [
  { name: 'Round Neck T-Shirts', desc: 'Classic comfort for any occasion. Available in 100% cotton and blends.' },
  { name: 'Polo T-Shirts', desc: 'Professional look for corporate teams and events. Breathable pique fabrics.' },
  { name: 'Hoodies', desc: 'Premium heavy-weight and lightweight hoodies for all seasons.' },
  { name: 'Sweatshirts', desc: 'Classic crewneck sweatshirts, perfect for university merchandise.' },
  { name: 'Jerseys', desc: 'Moisture-wicking athletic wear for sports teams and active events.' },
  { name: 'Caps', desc: 'Embroidered and printed caps in various styles.' },
  { name: 'Tote Bags', desc: 'Eco-friendly canvas bags for promotional events and giveaways.' },
  { name: 'Corporate Merch', desc: 'Curated gift boxes, notebooks, and premium corporate accessories.' },
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
          <a href="#" className={styles.btnOutline}>
            View Full Catalog <ArrowRight size={16} />
          </a>
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
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={16} />} className={styles.viewDetailsBtn}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
