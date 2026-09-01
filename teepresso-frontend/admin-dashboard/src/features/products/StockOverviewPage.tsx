import React, { useState, useEffect } from 'react';
import { Search, Save, AlertTriangle, Check, RefreshCw, Package, Zap, AlertCircle, CheckCircle2, ArrowUpRight } from 'lucide-react';
import styles from './ProductsAdminPage.module.css';
import { API_BASE_URL } from '@/common/config/api';


interface PriceTier {
  minQty: number;
  price: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  startingPrice: number;
  priceRange: string;
  colors: string[];
  image: string;
  isSeasonalKurta?: boolean;
  popularFor: string;
  requiresSizes: boolean;
  requiresColors: boolean;
  requiresMockup: boolean;
  applyVolumeDiscount: boolean;
  tiers?: PriceTier[];
  sizes?: string[];
  gallery?: string[];
  stock?: number;
  sizesStock?: Record<string, number>;
}

export function StockOverviewPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dbColors, setDbColors] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusTab, setStatusTab] = useState<'all' | 'low' | 'out' | 'healthy'>('all');

  // Editing Stock State
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [editingSizesStock, setEditingSizesStock] = useState<Record<string, Record<string, number>>>({});
  const [modifiedProductIds, setModifiedProductIds] = useState<Set<string>>(new Set());
  
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);
  const [globalSuccessMsg, setGlobalSuccessMsg] = useState<string | null>(null);

  // Fetch products & colors
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch colors dictionary
      try {
        const colRes = await fetch(`${API_BASE_URL}/colors`);
        const colData = await colRes.json();
        if (colData.success && Array.isArray(colData.colors)) {
          setDbColors(colData.colors);
        }
      } catch (e) {
        console.error('Failed to load colors dictionary:', e);
      }

      // Fetch categories snippet list
      try {
        const catRes = await fetch(`${API_BASE_URL}/categories`);
        const catData = await catRes.json();
        if (catData.success && Array.isArray(catData.categories)) {
          const names = catData.categories.map((c: any) => c.name);
          setDbCategories(names);
        }
      } catch (e) {
        console.error('Failed to load categories snippet list:', e);
      }

      // Fetch products list
      const res = await fetch(`${API_BASE_URL}/products`);
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
        
        // Initialize editing states
        const flatStock: Record<string, number> = {};
        const sizesStock: Record<string, Record<string, number>> = {};
        
        data.products.forEach((p: Product) => {
          flatStock[p.id] = p.stock !== undefined ? p.stock : 0;
          sizesStock[p.id] = p.sizesStock ? { ...p.sizesStock } : {};
        });
        
        setEditingStock(flatStock);
        setEditingSizesStock(sizesStock);
        setModifiedProductIds(new Set());
      } else {
        setError(data.message || 'Failed to load products list');
      }
    } catch (err) {
      console.error(err);
      setError('Network error: failed to communicate with backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Helper to mark a product modified
  const markModified = (productId: string) => {
    setModifiedProductIds(prev => new Set(prev).add(productId));
  };

  // Save stock for a single product
  const handleSaveStock = async (p: Product) => {
    setSavingId(p.id);
    setSaveSuccessId(null);

    const updatedPayload = {
      stock: !p.requiresSizes && !p.requiresColors ? Number(editingStock[p.id] || 0) : undefined,
      sizesStock: p.requiresSizes || p.requiresColors ? editingSizesStock[p.id] || {} : undefined
    };

    try {
      const res = await fetch(`${API_BASE_URL}/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccessId(p.id);
        setModifiedProductIds(prev => {
          const next = new Set(prev);
          next.delete(p.id);
          return next;
        });
        setTimeout(() => setSaveSuccessId(null), 3000);
      } else {
        alert(data.message || 'Failed to update stock');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating stock: network issue');
    } finally {
      setSavingId(null);
    }
  };

  // Bulk Save All Modified Products
  const handleSaveAllModified = async () => {
    if (modifiedProductIds.size === 0) return;
    setSavingAll(true);
    try {
      const promises = Array.from(modifiedProductIds).map(id => {
        const p = products.find(item => item.id === id);
        if (p) return handleSaveStock(p);
        return Promise.resolve();
      });
      await Promise.all(promises);
      setGlobalSuccessMsg(`Successfully saved stock updates for ${modifiedProductIds.size} items!`);
      setModifiedProductIds(new Set());
      setTimeout(() => setGlobalSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
      alert('Error performing bulk save operation.');
    } finally {
      setSavingAll(false);
    }
  };

  // Batch Quick Restock Action (+50 units to low stock items)
  const handleQuickBatchRestock = (boostAmount: number) => {
    let affectedCount = 0;
    products.forEach(p => {
      if (isLowStock(p) || isOutOfStock(p)) {
        affectedCount++;
        markModified(p.id);

        if (!p.requiresSizes && !p.requiresColors) {
          const current = editingStock[p.id] !== undefined ? editingStock[p.id] : (p.stock || 0);
          setEditingStock(prev => ({ ...prev, [p.id]: current + boostAmount }));
        } else if (p.requiresSizes && p.requiresColors && p.colors && p.sizes) {
          const currentMap = editingSizesStock[p.id] ? { ...editingSizesStock[p.id] } : { ...(p.sizesStock || {}) };
          p.colors.forEach(col => {
            p.sizes!.forEach(sz => {
              const key = `${col}_${sz}`;
              const val = currentMap[key] !== undefined ? currentMap[key] : 0;
              if (val <= 20) {
                currentMap[key] = val + boostAmount;
              }
            });
          });
          setEditingSizesStock(prev => ({ ...prev, [p.id]: currentMap }));
        } else if (p.requiresColors && p.colors) {
          const currentMap = editingSizesStock[p.id] ? { ...editingSizesStock[p.id] } : { ...(p.sizesStock || {}) };
          p.colors.forEach(col => {
            const val = currentMap[col] !== undefined ? currentMap[col] : 0;
            if (val <= 20) {
              currentMap[col] = val + boostAmount;
            }
          });
          setEditingSizesStock(prev => ({ ...prev, [p.id]: currentMap }));
        } else if (p.requiresSizes && p.sizes) {
          const currentMap = editingSizesStock[p.id] ? { ...editingSizesStock[p.id] } : { ...(p.sizesStock || {}) };
          p.sizes.forEach(sz => {
            const val = currentMap[sz] !== undefined ? currentMap[sz] : 0;
            if (val <= 20) {
              currentMap[sz] = val + boostAmount;
            }
          });
          setEditingSizesStock(prev => ({ ...prev, [p.id]: currentMap }));
        }
      }
    });

    if (affectedCount > 0) {
      setGlobalSuccessMsg(`Applied +${boostAmount} units boost to all low stock items! Click "Save All Changes" below to persist.`);
      setTimeout(() => setGlobalSuccessMsg(null), 5000);
    } else {
      alert('All products are currently healthy! No low-stock items were found.');
    }
  };

  // Helper to determine status
  const isOutOfStock = (p: Product) => {
    if (!p.requiresSizes && !p.requiresColors) {
      const q = editingStock[p.id] !== undefined ? editingStock[p.id] : (p.stock || 0);
      return q === 0;
    }
    const map = editingSizesStock[p.id] || p.sizesStock || {};
    const vals = Object.values(map);
    if (vals.length === 0) return true;
    return vals.some(v => v === 0);
  };

  const isLowStock = (p: Product) => {
    const threshold = 20;
    if (!p.requiresSizes && !p.requiresColors) {
      const q = editingStock[p.id] !== undefined ? editingStock[p.id] : (p.stock || 0);
      return q > 0 && q <= threshold;
    }
    const map = editingSizesStock[p.id] || p.sizesStock || {};
    const vals = Object.values(map);
    if (vals.length === 0) return true;
    return vals.some(v => v > 0 && v <= threshold);
  };

  // Calculate Metrics dynamically from active variants
  let totalUnits = 0;
  let totalLowStockCount = 0;
  let totalOutOfStockCount = 0;

  products.forEach(p => {
    const stockMap = editingSizesStock[p.id] || p.sizesStock || {};
    
    if (!p.requiresSizes && !p.requiresColors) {
      const q = editingStock[p.id] !== undefined ? editingStock[p.id] : (p.stock || 0);
      totalUnits += q;
      if (q === 0) totalOutOfStockCount++;
      else if (q <= 20) totalLowStockCount++;
    } else if (p.requiresSizes && p.requiresColors && p.colors && p.sizes) {
      p.colors.forEach(col => {
        p.sizes!.forEach(sz => {
          const key3 = `${col}_${sz}`;
          const q = stockMap[key3] !== undefined ? Number(stockMap[key3]) : 0;
          totalUnits += q;
          if (q === 0) totalOutOfStockCount++;
          else if (q <= 20) totalLowStockCount++;
        });
      });
    } else if (p.requiresColors && p.colors) {
      p.colors.forEach(col => {
        const q = stockMap[col] !== undefined ? Number(stockMap[col]) : 0;
        totalUnits += q;
        if (q === 0) totalOutOfStockCount++;
        else if (q <= 20) totalLowStockCount++;
      });
    } else if (p.requiresSizes && p.sizes) {
      p.sizes.forEach(sz => {
        const q = stockMap[sz] !== undefined ? Number(stockMap[sz]) : 0;
        totalUnits += q;
        if (q === 0) totalOutOfStockCount++;
        else if (q <= 20) totalLowStockCount++;
      });
    } else {
      const vals = Object.values(stockMap);
      vals.forEach(v => {
        const q = Number(v || 0);
        totalUnits += q;
        if (q === 0) totalOutOfStockCount++;
        else if (q <= 20) totalLowStockCount++;
      });
    }
  });

  const combinedCategories = Array.from(new Set([
    ...dbCategories,
    ...products.map(p => p.category)
  ])).filter(Boolean);

  const categories = ['All', ...combinedCategories];

  // Filter products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusTab === 'low') matchesStatus = isLowStock(p);
    else if (statusTab === 'out') matchesStatus = isOutOfStock(p);
    else if (statusTab === 'healthy') matchesStatus = !isLowStock(p) && !isOutOfStock(p);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Color Hex to Name resolver
  const getColorName = (hexOrName: string) => {
    if (!hexOrName.startsWith('#')) return hexOrName;
    const found = dbColors.find(c => c.hex.toLowerCase() === hexOrName.toLowerCase());
    return found ? found.name : 'Color';
  };

  return (
    <div className={styles.workspace} style={{ paddingBottom: modifiedProductIds.size > 0 ? '100px' : '40px' }}>
      {/* Header */}
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className={styles.title}>Inventory Stock Command Center</h1>
          <p className={styles.subtitle}>Real-time stock audit and variant inventory management</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={fetchProducts} 
            className="erp-btn-secondary" 
            style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}
            title="Re-fetches the latest stock levels from the database"
          >
            <RefreshCw size={14} />
            <span>Refresh Inventory Data</span>
          </button>
        </div>
      </div>

      {/* Global Notifications */}
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-status-danger-bg)', borderLeft: '4px solid var(--color-status-danger)', color: 'var(--color-status-danger)', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {globalSuccessMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', color: '#065f46', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontWeight: 600 }}>
          ✓ {globalSuccessMsg}
        </div>
      )}

      {/* High-Level Executive Inventory Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total In Stock</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-title)', marginTop: '2px' }}>{totalUnits.toLocaleString('en-IN')} <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Pcs</span></div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Line SKUs</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-title)', marginTop: '2px' }}>{products.length} <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Products</span></div>
          </div>
        </div>

        <div 
          onClick={() => setStatusTab('low')}
          style={{ backgroundColor: 'var(--color-surface-white)', border: statusTab === 'low' ? '2px solid #f59e0b' : '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low Stock Warnings</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: totalLowStockCount > 0 ? '#d97706' : 'var(--color-text-title)', marginTop: '2px' }}>{totalLowStockCount} <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Variants</span></div>
          </div>
        </div>

        <div 
          onClick={() => setStatusTab('out')}
          style={{ backgroundColor: 'var(--color-surface-white)', border: statusTab === 'out' ? '2px solid #ef4444' : '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Out of Stock</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: totalOutOfStockCount > 0 ? '#dc2626' : 'var(--color-text-title)', marginTop: '2px' }}>{totalOutOfStockCount} <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Critical</span></div>
          </div>
        </div>
      </div>

      {/* Filters & Segmented Status Control */}
      <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '16px 20px', marginBottom: '24px' }}>
        
        {/* Status Segment Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setStatusTab('all')} 
            style={{ 
              padding: '6px 16px', 
              borderRadius: '20px', 
              border: statusTab === 'all' ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)', 
              backgroundColor: statusTab === 'all' ? 'var(--color-surface-hover)' : 'transparent', 
              color: statusTab === 'all' ? 'var(--color-text-title)' : 'var(--color-text-muted)',
              fontSize: '13px', 
              fontWeight: 600, 
              cursor: 'pointer' 
            }}
          >
            All Inventory ({products.length})
          </button>
          
          <button 
            onClick={() => setStatusTab('low')} 
            style={{ 
              padding: '6px 16px', 
              borderRadius: '20px', 
              border: statusTab === 'low' ? '1px solid #f59e0b' : '1px solid var(--color-border)', 
              backgroundColor: statusTab === 'low' ? 'rgba(245, 158, 11, 0.1)' : 'transparent', 
              color: statusTab === 'low' ? '#b45309' : 'var(--color-text-muted)',
              fontSize: '13px', 
              fontWeight: 600, 
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertTriangle size={14} /> Low Stock (≤ 20)
          </button>

          <button 
            onClick={() => setStatusTab('out')} 
            style={{ 
              padding: '6px 16px', 
              borderRadius: '20px', 
              border: statusTab === 'out' ? '1px solid #ef4444' : '1px solid var(--color-border)', 
              backgroundColor: statusTab === 'out' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', 
              color: statusTab === 'out' ? '#dc2626' : 'var(--color-text-muted)',
              fontSize: '13px', 
              fontWeight: 600, 
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertCircle size={14} /> Out of Stock (0)
          </button>

          <button 
            onClick={() => setStatusTab('healthy')} 
            style={{ 
              padding: '6px 16px', 
              borderRadius: '20px', 
              border: statusTab === 'healthy' ? '1px solid #10b981' : '1px solid var(--color-border)', 
              backgroundColor: statusTab === 'healthy' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', 
              color: statusTab === 'healthy' ? '#047857' : 'var(--color-text-muted)',
              fontSize: '13px', 
              fontWeight: 600, 
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle2 size={14} /> Healthy Stock (&gt; 20)
          </button>
        </div>

        {/* Search & Category Inputs */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className={styles.searchContainer} style={{ flex: 1, minWidth: '240px' }}>
            <Search className={styles.searchIcon} size={16} />
            <input
              type="text"
              placeholder="Search products by title or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className={styles.formInput}
            style={{ maxWidth: '200px', margin: 0 }}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="erp-table-container">
        {loading ? (
          <div style={{ padding: '32px' }} className="text-muted">Loading live inventory matrix...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '32px' }} className="text-muted">No matching inventory products found for active filters.</div>
        ) : (
          <table className="erp-table" style={{ cursor: 'default' }}>
            <thead>
              <tr>
                <th>Product Line Item</th>
                <th>Category</th>
                <th style={{ width: '48%' }}>Variant Stock Breakdown & Live Editors</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => {
                const low = isLowStock(p);
                const out = isOutOfStock(p);
                const isModified = modifiedProductIds.has(p.id);

                return (
                  <tr key={p.id} style={{ background: out ? 'rgba(239, 68, 68, 0.03)' : low ? 'rgba(245, 158, 11, 0.03)' : 'transparent' }}>
                    
                    {/* Info */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-text-title)', fontSize: '14px' }}>{p.name}</span>
                          {isModified && (
                            <span style={{ fontSize: '10px', backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Unsaved Edits</span>
                          )}
                        </div>
                        <span className="text-mono text-muted" style={{ fontSize: '11px', marginTop: '3px' }}>ID: {p.id} • Base Rate: ₹{p.startingPrice}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="badge badge-neutral">{p.category}</span>
                    </td>

                    {/* Stock Grid Breakdown */}
                    <td>
                      {!p.requiresSizes && !p.requiresColors ? (
                        // Flat stock input
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="number"
                            min="0"
                            value={editingStock[p.id] !== undefined ? editingStock[p.id] : 0}
                            onChange={e => {
                              const val = Math.max(0, Number(e.target.value));
                              setEditingStock(prev => ({ ...prev, [p.id]: val }));
                              markModified(p.id);
                            }}
                            className={styles.formInput}
                            style={{ maxWidth: '110px', margin: 0, padding: '6px 10px', fontSize: '13px', fontWeight: 'bold' }}
                          />
                          <span className="text-muted" style={{ fontSize: '12px' }}>Pcs Available</span>
                          {out ? (
                            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                              <AlertCircle size={13} /> Out of Stock
                            </span>
                          ) : low ? (
                            <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                              <AlertTriangle size={13} /> Low Stock (≤ 20)
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                              <CheckCircle2 size={13} /> Healthy
                            </span>
                          )}
                        </div>
                      ) : p.requiresColors && p.colors && p.colors.length > 0 ? (
                        // Color + Size or Color-only variant grid
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {p.colors.map(color => {
                            const isHex = color.startsWith('#');
                            const colorLabel = getColorName(color);

                            return (
                              <div key={color} style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: `3px solid ${isHex ? color : '#ccc'}`, paddingLeft: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {isHex && <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color, border: '1px solid rgba(0,0,0,0.15)' }} />}
                                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-title)' }}>{colorLabel}</span>
                                </div>
                                
                                {p.requiresSizes && p.sizes && p.sizes.length > 0 ? (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {p.sizes.map(sz => {
                                      const key = `${color}_${sz}`;
                                      const val = editingSizesStock[p.id]?.[key] !== undefined ? editingSizesStock[p.id][key] : 0;
                                      const isOut = val === 0;
                                      const isLow = val > 0 && val <= 20;
                                      
                                      return (
                                        <div key={sz} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: isOut ? 'rgba(239, 68, 68, 0.08)' : isLow ? 'rgba(245, 158, 11, 0.08)' : 'var(--color-surface-hover)', padding: '4px 8px', borderRadius: '4px', border: isOut ? '1px solid #ef4444' : isLow ? '1px solid #f59e0b' : '1px solid var(--color-border)' }}>
                                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)' }}>{sz}:</span>
                                          <input
                                            type="number"
                                            min="0"
                                            value={val}
                                            onChange={e => {
                                              const qty = Math.max(0, Number(e.target.value));
                                              setEditingSizesStock(prev => ({
                                                ...prev,
                                                [p.id]: {
                                                  ...(prev[p.id] || {}),
                                                  [key]: qty
                                                }
                                              }));
                                              markModified(p.id);
                                            }}
                                            className={styles.formInput}
                                            style={{ width: '56px', padding: '2px 4px', fontSize: '11px', fontWeight: 'bold', margin: 0 }}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  // Color-only stock
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input
                                      type="number"
                                      min="0"
                                      value={editingSizesStock[p.id]?.[color] !== undefined ? editingSizesStock[p.id][color] : 0}
                                      onChange={e => {
                                        const qty = Math.max(0, Number(e.target.value));
                                        setEditingSizesStock(prev => ({
                                          ...prev,
                                          [p.id]: {
                                            ...(prev[p.id] || {}),
                                            [color]: qty
                                          }
                                        }));
                                        markModified(p.id);
                                      }}
                                      className={styles.formInput}
                                      style={{ width: '80px', padding: '4px 6px', fontSize: '12px', fontWeight: 'bold', margin: 0 }}
                                    />
                                    <span style={{ fontSize: '11px', color: '#6b7280' }}>Pcs</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        // Size-only grid (No Colors)
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {(p.sizes || []).map(sz => {
                            const val = editingSizesStock[p.id]?.[sz] !== undefined ? editingSizesStock[p.id][sz] : 0;
                            const isOut = val === 0;
                            const isLow = val > 0 && val <= 20;

                            return (
                              <div key={sz} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: isOut ? 'rgba(239, 68, 68, 0.08)' : isLow ? 'rgba(245, 158, 11, 0.08)' : 'var(--color-surface-hover)', padding: '4px 8px', borderRadius: '4px', border: isOut ? '1px solid #ef4444' : isLow ? '1px solid #f59e0b' : '1px solid var(--color-border)' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)' }}>{sz}:</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={val}
                                  onChange={e => {
                                    const qty = Math.max(0, Number(e.target.value));
                                    setEditingSizesStock(prev => ({
                                      ...prev,
                                      [p.id]: {
                                        ...(prev[p.id] || {}),
                                        [sz]: qty
                                      }
                                    }));
                                    markModified(p.id);
                                  }}
                                  className={styles.formInput}
                                  style={{ width: '56px', padding: '2px 4px', fontSize: '11px', fontWeight: 'bold', margin: 0 }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* Action Row */}
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                        {saveSuccessId === p.id && (
                          <span style={{ color: 'var(--color-status-success)', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={14} /> Saved
                          </span>
                        )}
                        <button
                          onClick={() => handleSaveStock(p)}
                          disabled={savingId === p.id}
                          className="erp-btn-primary"
                          style={{ padding: '6px 12px', display: 'inline-flex', gap: '6px', alignItems: 'center', cursor: 'pointer', margin: 0 }}
                        >
                          <Save size={12} />
                          <span>{savingId === p.id ? 'Saving...' : 'Save'}</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Floating Action Bar for Bulk Saving Modified Items */}
      {modifiedProductIds.size > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1f2937',
          color: '#ffffff',
          padding: '14px 24px',
          borderRadius: '30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          zIndex: 1000,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f59e0b', color: '#000', fontSize: '12px', fontWeight: 'bold' }}>
              {modifiedProductIds.size}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Unsaved inventory adjustments pending</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={fetchProducts}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '6px 14px', borderRadius: '16px', fontSize: '13px', cursor: 'pointer' }}
            >
              Discard Changes
            </button>
            <button
              onClick={handleSaveAllModified}
              disabled={savingAll}
              style={{ backgroundColor: '#10b981', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={14} />
              <span>{savingAll ? 'Saving All...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
export default StockOverviewPage;
