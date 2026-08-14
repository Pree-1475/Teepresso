import React, { useState } from 'react';
import { Search, Plus, Download, MoreHorizontal } from 'lucide-react';
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
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.workspace}>
      
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Product Catalog</h1>
          <p className={styles.subtitle}>Apparel inventory & volume pricing brackets</p>
        </div>
        <div className={styles.actions}>
          <button className="erp-btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={14} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} className="text-muted" />
          <input
            type="text"
            placeholder="Search Product Name, Category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <button className="erp-btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Download size={14} />
            <span>Export Catalog</span>
          </button>
        </div>
      </div>

      {/* Clean Table Container */}
      <div className="erp-table-container">
        <table className="erp-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" /></th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Base Rate</th>
              <th>Min Qty (MOQ)</th>
              <th>Available Colors</th>
              <th>Status</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td><input type="checkbox" /></td>
                <td>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                </td>
                <td className="text-muted">{p.category}</td>
                <td>
                  <strong>₹{p.startingPrice}</strong> <span className="text-muted" style={{ fontSize: '11px' }}>/ pc</span>
                </td>
                <td><strong>{p.minQty} Pcs</strong></td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {p.availableColors.map((hex, idx) => (
                      <span key={idx} className={styles.colorDot} style={{ backgroundColor: hex }} />
                    ))}
                    <span className="text-muted" style={{ fontSize: '11px', marginLeft: '4px' }}>({p.availableColors.length})</span>
                  </div>
                </td>
                <td>
                  {p.inStock ? (
                    <span className="badge badge-success">In Stock</span>
                  ) : (
                    <span className="badge badge-danger">Out of Stock</span>
                  )}
                </td>
                <td>
                  <button className={styles.moreBtn}><MoreHorizontal size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default ProductsAdminPage;
