import React, { useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import styles from './ProductsAdminPage.module.css';

interface ProductAdminItem {
  id: string;
  name: string;
  category: string;
  startingPrice: number;
  minQty: number;
  availableColors: string[];
  inStock: boolean;
}

const PRODUCTS_ADMIN_DATA: ProductAdminItem[] = [
  {
    id: 'custom-kurta-seasonal',
    name: 'Festive & Group Custom Kurta',
    category: 'Kurtas',
    startingPrice: 399,
    minQty: 30,
    availableColors: ['#8c5b45', '#1f1d1c', '#ffffff', '#0D9488', '#b7791f'],
    inStock: true,
  },
  {
    id: 'tee-oversized-heavy',
    name: 'Heavyweight Oversized Streetwear Tee',
    category: 'T-Shirts',
    startingPrice: 349,
    minQty: 50,
    availableColors: ['#1f1d1c', '#ffffff', '#5c5957', '#8c5b45'],
    inStock: true,
  },
  {
    id: 'polo-corporate-pique',
    name: 'Classic Pique Corporate Polo Shirt',
    category: 'Polos',
    startingPrice: 429,
    minQty: 50,
    availableColors: ['#1a73e8', '#1f1d1c', '#ffffff', '#623a2a'],
    inStock: true,
  },
  {
    id: 'hoodie-fleece-pullover',
    name: 'Premium Heavyweight Pullover Hoodie',
    category: 'Hoodies',
    startingPrice: 799,
    minQty: 25,
    availableColors: ['#1f1d1c', '#5c5957', '#8c5b45'],
    inStock: true,
  },
];

export function ProductsAdminPage() {
  const [products] = useState<ProductAdminItem[]>(PRODUCTS_ADMIN_DATA);

  return (
    <div className="admin-page-container">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Product Catalog</h1>
          <p className={styles.subtitle}>Apparel inventory & volume pricing brackets</p>
        </div>
        <button type="button" className={styles.addBtn}>
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div className={styles.grid}>
        {products.map(item => (
          <div key={item.id} className={styles.productCard}>
            <div className={styles.cardTop}>
              <span className={styles.categoryBadge}>{item.category}</span>
              <div className="status-dot-badge">
                <span className="status-dot status-dot-emerald"></span>
                <span>In Stock</span>
              </div>
            </div>

            <h3 className={styles.productName}>{item.name}</h3>

            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Base Rate:</span>
              <span className={styles.priceValue}>₹{item.startingPrice} <span style={{ fontSize: '11px', fontWeight: 400 }}>/ pc</span></span>
            </div>

            <div className={styles.metaRow}>
              <span>MOQ: <strong>{item.minQty} Pcs</strong></span>
            </div>

            <div className={styles.swatchRow}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Colors ({item.availableColors.length}):</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {item.availableColors.map((hex, idx) => (
                  <span key={idx} className={styles.dot} style={{ backgroundColor: hex }} />
                ))}
              </div>
            </div>

            <div className={styles.cardFooter}>
              <button type="button" className={styles.editBtn}>
                <Edit2 size={12} /> Edit Pricing
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsAdminPage;
