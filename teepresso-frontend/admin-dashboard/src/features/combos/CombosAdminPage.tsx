import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Sparkles, AlertCircle, RefreshCw, Server, WifiOff } from 'lucide-react';
import styles from './CombosAdminPage.module.css';
import { API_BASE_URL } from '@/common/config/api';
import { AddEditComboModal } from './AddEditComboModal';

// Source-of-truth default combos
const FALLBACK_COMBOS = [
  {
    id: 'combo-1',
    name: 'Combo 1',
    subtitle: 'Classic Duo',
    description: '2 premium quality Polo T-Shirts with custom embroidery or print.',
    comboPrice: 899,
    originalPrice: 899,
    savings: 0,
    isPopular: false,
    isActive: true,
    displayOrder: 1,
    items: [
      {
        id: 'ci-1',
        productId: 'prod-polo-classic',
        quantity: 2,
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        product: {
          id: 'prod-polo-classic',
          name: 'Classic Polo T-Shirt',
          category: 'Polo',
          startingPrice: 449,
          image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80'
        }
      }
    ]
  },
  {
    id: 'combo-2',
    name: 'Combo 2',
    subtitle: 'Team Pack',
    description: '5 high-grade cotton crewneck T-Shirts for your crew or club.',
    comboPrice: 1099,
    originalPrice: 1999,
    savings: 900,
    isPopular: true,
    isActive: true,
    displayOrder: 2,
    items: [
      {
        id: 'ci-2',
        productId: 'prod-crewneck-premium',
        quantity: 5,
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        product: {
          id: 'prod-crewneck-premium',
          name: 'Premium Cotton Crewneck T-Shirt',
          category: 'T-Shirts',
          startingPrice: 399,
          image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'
        }
      }
    ]
  },
  {
    id: 'combo-3',
    name: 'Combo 3',
    subtitle: 'Corporate Pack',
    description: '10 premium executive Polo T-Shirts for corporate events and team uniforms.',
    comboPrice: 2499,
    originalPrice: 3499,
    savings: 1000,
    isPopular: false,
    isActive: true,
    displayOrder: 3,
    items: [
      {
        id: 'ci-3',
        productId: 'prod-polo-classic',
        quantity: 10,
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        product: {
          id: 'prod-polo-classic',
          name: 'Classic Polo T-Shirt',
          category: 'Polo',
          startingPrice: 349,
          image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80'
        }
      }
    ]
  }
];

const FALLBACK_PRODUCTS = [
  {
    id: 'prod-polo-classic',
    name: 'Classic Polo T-Shirt',
    category: 'Polo',
    startingPrice: 449,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'prod-crewneck-premium',
    name: 'Premium Cotton Crewneck T-Shirt',
    category: 'T-Shirts',
    startingPrice: 399,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'prod-hoodie-fleece',
    name: 'Heavyweight Fleece Hoodie',
    category: 'Hoodies',
    startingPrice: 899,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'prod-oversized-tee',
    name: 'Oversized Streetwear Tee',
    category: 'T-Shirts',
    startingPrice: 499,
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  }
];

export function CombosAdminPage() {
  const [combos, setCombos] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('teepresso_admin_combos');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return FALLBACK_COMBOS;
  });

  const [products, setProducts] = useState<any[]>(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'offline' | 'checking'>('checking');
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<any | null>(null);

  // Helper for safe JSON fetching
  const safeFetchJson = async (url: string) => {
    try {
      const res = await fetch(url);
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return { ok: false, status: res.status, error: `Endpoint returned non-JSON (${res.status})` };
      }
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (err: any) {
      return { ok: false, status: 0, error: err.message || 'Network error' };
    }
  };

  const fetchCombosAndProducts = async () => {
    setLoading(true);

    try {
      const [combosResult, productsResult] = await Promise.all([
        safeFetchJson(`${API_BASE_URL}/combos?all=true`),
        safeFetchJson(`${API_BASE_URL}/products`)
      ]);

      if (combosResult.ok && combosResult.data?.success && Array.isArray(combosResult.data.combos)) {
        setCombos(combosResult.data.combos);
        try {
          localStorage.setItem('teepresso_admin_combos', JSON.stringify(combosResult.data.combos));
        } catch (_) {}
        setBackendStatus('connected');
      } else {
        setBackendStatus('offline');
        // If local storage is empty, initialize with default combos
        const saved = localStorage.getItem('teepresso_admin_combos');
        if (saved) {
          try {
            setCombos(JSON.parse(saved));
          } catch (_) {
            setCombos(FALLBACK_COMBOS);
          }
        } else {
          setCombos(FALLBACK_COMBOS);
        }
      }

      if (productsResult.ok && productsResult.data?.success && Array.isArray(productsResult.data.products)) {
        setProducts(productsResult.data.products);
      } else {
        setProducts(FALLBACK_PRODUCTS);
      }
    } catch (err) {
      console.warn('Error fetching combos:', err);
      setBackendStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombosAndProducts();
  }, []);

  const handleToggleActive = async (comboId: string) => {
    const updated = combos.map((c) =>
      c.id === comboId ? { ...c, isActive: !c.isActive } : c
    );
    setCombos(updated);
    try {
      localStorage.setItem('teepresso_admin_combos', JSON.stringify(updated));
    } catch (_) {}

    try {
      await fetch(`${API_BASE_URL}/combos/${comboId}/toggle-active`, {
        method: 'PATCH',
      });
    } catch (err) {
      console.warn('Backend toggle skipped in offline mode:', err);
    }
  };

  const handleDeleteCombo = async (comboId: string, comboName: string) => {
    if (!window.confirm(`Are you sure you want to delete the combo "${comboName}"?`)) {
      return;
    }

    const updated = combos.filter((c) => c.id !== comboId);
    setCombos(updated);
    try {
      localStorage.setItem('teepresso_admin_combos', JSON.stringify(updated));
    } catch (_) {}

    try {
      await fetch(`${API_BASE_URL}/combos/${comboId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Backend delete skipped in offline mode:', err);
    }
  };

  const handleOpenCreate = () => {
    setEditingCombo(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (combo: any) => {
    setEditingCombo(combo);
    setModalOpen(true);
  };

  const handleModalSave = (savedCombo?: any) => {
    setModalOpen(false);
    setEditingCombo(null);

    if (savedCombo) {
      setCombos((prev) => {
        const idx = prev.findIndex((c) => c.id === savedCombo.id);
        const next = idx >= 0
          ? prev.map((c) => (c.id === savedCombo.id ? savedCombo : c))
          : [...prev, savedCombo];
        try {
          localStorage.setItem('teepresso_admin_combos', JSON.stringify(next));
        } catch (_) {}
        return next;
      });
    }

    // Attempt live refresh if backend is available
    fetchCombosAndProducts();
  };

  const filteredCombos = combos.filter((c) => {
    const query = search.toLowerCase();
    const matchName = c.name?.toLowerCase().includes(query);
    const matchSubtitle = c.subtitle?.toLowerCase().includes(query);
    const matchProduct = c.items?.some((it: any) => 
      it.product?.name?.toLowerCase().includes(query) || it.productId?.toLowerCase().includes(query)
    );
    return matchName || matchSubtitle || matchProduct;
  });

  const activeCount = combos.filter((c) => c.isActive).length;

  return (
    <div className={styles.pageContainer}>
      
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Combo Management</h1>
          <p className={styles.subtitle}>
            Create, price, and curate dynamic merch bundle deals for your customer storefront.
          </p>
        </div>

        <button type="button" onClick={handleOpenCreate} className={styles.createBtn}>
          <Plus size={16} />
          <span>New Combo</span>
        </button>
      </div>

      {/* Backend connection status banner */}
      {backendStatus === 'offline' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-surface-white)',
          border: '1px solid var(--color-border)',
          borderLeft: '4px solid var(--color-status-warning)',
          color: 'var(--color-text-body)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 16,
          fontSize: 13,
          lineHeight: 1.4
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <WifiOff size={16} color="var(--color-status-warning)" />
            <span>
              <strong>Local Combo Mode:</strong> Displaying saved combo catalogue. To sync with live Neon DB, run <code style={{ background: 'var(--color-canvas-bg)', border: '1px solid var(--color-border)', color: 'var(--color-primary-light)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>cd teepresso-backend && npm run dev</code>.
            </span>
          </div>
          <button
            type="button"
            onClick={fetchCombosAndProducts}
            style={{
              background: 'var(--color-surface-beige)',
              border: '1px solid var(--color-border)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-text-title)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <RefreshCw size={12} />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Controls: Search & Stats */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by combo or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statBadge}>
            Active on Site: <strong>{activeCount}</strong> / {combos.length}
          </div>
          <div className={styles.statBadge} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Server size={13} color={backendStatus === 'connected' ? 'var(--color-status-success)' : 'var(--color-status-warning)'} />
            <span style={{ color: backendStatus === 'connected' ? 'var(--color-status-success)' : 'var(--color-text-muted)', fontSize: 12 }}>
              {backendStatus === 'connected' ? 'Live API Synced' : 'Local Storage Mode'}
            </span>
          </div>
          <button
            type="button"
            onClick={fetchCombosAndProducts}
            className={styles.statBadge}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            title="Refresh list"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.emptyState}>
            <span>Loading dynamic combos...</span>
          </div>
        ) : filteredCombos.length === 0 ? (
          <div className={styles.emptyState}>
            <Sparkles size={32} color="var(--color-primary-light)" />
            <p style={{ margin: 0, fontWeight: 600 }}>No combos found</p>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              {search ? 'Try clearing your search query' : 'Create your first combo offer using the button above'}
            </span>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: 100 }}>Status</th>
                  <th>Combo Offer</th>
                  <th>Products Included</th>
                  <th>Pricing & Savings</th>
                  <th style={{ width: 100, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCombos.map((c) => {
                  return (
                    <tr key={c.id}>
                      {/* Status Toggle */}
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(c.id)}
                          className={`${styles.toggleBtn} ${c.isActive ? styles.toggleActive : styles.toggleInactive}`}
                          title={c.isActive ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {c.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          <span>{c.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Combo Info */}
                      <td>
                        <div className={styles.comboInfoCol}>
                          <div className={styles.comboNameRow}>
                            <span className={styles.comboName}>{c.name}</span>
                            {c.isPopular && (
                              <span className={styles.popularTag}>✦ Popular</span>
                            )}
                          </div>
                          {c.subtitle && (
                            <span className={styles.comboSubtitle}>{c.subtitle}</span>
                          )}
                        </div>
                      </td>

                      {/* Included Products */}
                      <td>
                        <div className={styles.productsList}>
                          {(c.items || []).map((it: any, i: number) => {
                            const p = it.product;
                            const sizesStr = (it.availableSizes || []).join(', ');
                            return (
                              <div key={i} className={styles.productMiniItem}>
                                <img
                                  src={p?.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'}
                                  alt={p?.name || 'Product'}
                                  className={styles.productThumb}
                                />
                                <div className={styles.productTextWrap}>
                                  <span className={styles.productTitle}>
                                    <strong>{it.quantity}×</strong> {p?.name || it.productId}
                                  </span>
                                  {sizesStr && (
                                    <span className={styles.productSizes}>
                                      Sizes: {sizesStr}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Pricing & Savings */}
                      <td>
                        <div className={styles.priceCell}>
                          <div className={styles.priceMain}>
                            {c.savings > 0 && (
                              <span className={styles.originalPrice}>₹{c.originalPrice}</span>
                            )}
                            <span className={styles.currentPrice}>₹{c.comboPrice}</span>
                          </div>
                          {c.savings > 0 ? (
                            <span className={styles.savingsBadge}>
                              Save ₹{c.savings}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                              Standard Price
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionBtns} style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            className={styles.iconBtn}
                            title="Edit combo"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCombo(c.id, c.name)}
                            className={`${styles.iconBtn} ${styles.deleteBtn}`}
                            title="Delete combo"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <AddEditComboModal
          combo={editingCombo}
          products={products}
          onClose={() => setModalOpen(false)}
          onSave={handleModalSave}
        />
      )}

    </div>
  );
}

export default CombosAdminPage;
