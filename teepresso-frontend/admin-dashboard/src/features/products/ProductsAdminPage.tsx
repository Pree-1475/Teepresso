import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Plus, Download, MoreHorizontal, Edit2 } from 'lucide-react';
import styles from './ProductsAdminPage.module.css';
import { API_BASE_URL } from '@/common/config/api';


interface Product {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  startingPrice: number;
  priceRange: string;
  colors: string[];
  sizes?: string[];
  image: string;
  popularFor: string;
  requiresSizes: boolean;
  requiresColors: boolean;
  requiresPatterns?: boolean;
  requiresMockup: boolean;
  applyVolumeDiscount: boolean;
  isSeasonalKurta?: boolean;
}

export function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load products from backend on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setError(data.message || 'Failed to load products');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Network error: failed to fetch products list.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter based on search query
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  // CSV Export Handler
  const handleExport = () => {
    if (products.length === 0) {
      alert('No products to export');
      return;
    }
    const headers = [
      'ID', 'Name', 'Category', 'Starting Price', 'Price Range', 
      'Colors', 'Popular For', 'Requires Sizes', 'Requires Colors', 
      'Requires Mockup', 'Volume Discount'
    ];

    const rows = products.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.startingPrice,
      `"${p.priceRange}"`,
      `"${p.colors.join(', ')}"`,
      `"${(p.popularFor || '').replace(/"/g, '""')}"`,
      p.requiresSizes ? 'Yes' : 'No',
      p.requiresColors ? 'Yes' : 'No',
      p.requiresMockup ? 'Yes' : 'No',
      p.applyVolumeDiscount ? 'Yes' : 'No'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `teepresso_products_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.workspace}>
      
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Product Catalog</h1>
          <p className={styles.subtitle}>Apparel inventory & volume pricing brackets</p>
        </div>
        <div className={styles.actions}>
          <button 
            onClick={() => navigate('/products/add')}
            className="erp-btn-primary" 
            style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}
          >
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
          <button 
            onClick={handleExport}
            className="erp-btn-secondary" 
            style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}
          >
            <Download size={14} />
            <span>Export Catalog</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fed7d7', borderLeft: '4px solid #e53e3e', color: '#9b2c2c', borderRadius: '4px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading products catalog...</p>
      ) : (
        /* Clean Table Container */
        <div className="erp-table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Starting Price</th>
                <th>Config Flags</th>
                <th>Available Colors</th>
                <th>Available Sizes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr 
                  key={p.id} 
                  onClick={() => navigate(`/products/edit/${p.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      {p.name}
                    </span>
                  </td>
                  <td className="text-muted">{p.category}</td>
                  <td>
                    <strong>₹{p.startingPrice}</strong> <span className="text-muted" style={{ fontSize: '11px' }}>/ pc</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {p.requiresSizes && <span className="badge badge-success" style={{ fontSize: '10px' }}>Sizes</span>}
                      {p.requiresColors && <span className="badge badge-success" style={{ fontSize: '10px' }}>Colors</span>}
                      {p.requiresPatterns && <span className="badge badge-success" style={{ fontSize: '10px' }}>Patterns</span>}
                      {p.requiresMockup && <span className="badge badge-success" style={{ fontSize: '10px' }}>Mockup</span>}
                      {p.applyVolumeDiscount && <span className="badge badge-success" style={{ fontSize: '10px' }}>Discount</span>}
                    </div>
                  </td>
                  <td>
                    {p.colors && p.colors.length > 0 ? (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {p.colors.slice(0, 5).map((hex, idx) => (
                          <span 
                            key={idx} 
                            className={styles.colorDot} 
                            style={{ 
                              backgroundColor: hex.startsWith('#') ? hex : '#e0e0e0', 
                              width: '12px', 
                              height: '12px', 
                              borderRadius: '50%', 
                              display: 'inline-block',
                              border: '1px solid rgba(0,0,0,0.1)'
                            }} 
                          />
                        ))}
                        {p.colors.length > 5 && (
                          <span className="text-muted" style={{ fontSize: '11px' }}>+{p.colors.length - 5}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '11px' }}>None</span>
                    )}
                  </td>
                  <td style={{ fontSize: '12px' }} className="text-muted">
                    {p.sizes && p.sizes.length > 0 ? (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {p.sizes.map((sz, idx) => (
                          <span key={idx} style={{ padding: '2px 6px', backgroundColor: 'var(--color-surface-hover)', borderRadius: '2px', fontSize: '11px', fontWeight: 600 }}>
                            {sz}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default ProductsAdminPage;
