import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import styles from './AddEditComboModal.module.css';
import { API_BASE_URL } from '@/common/config/api';

interface ProductItem {
  id: string;
  name: string;
  category: string;
  startingPrice: number;
  image?: string;
  sizes?: string[];
}

interface ComboItemForm {
  productId: string;
  quantity: number;
  availableSizes: string[];
}

interface AddEditComboModalProps {
  combo?: any | null;
  products: ProductItem[];
  onClose: () => void;
  onSave: (savedCombo?: any) => void;
}

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export function AddEditComboModal({ combo, products, onClose, onSave }: AddEditComboModalProps) {
  const isEditing = !!combo;

  const [name, setName] = useState(combo?.name || '');
  const [subtitle, setSubtitle] = useState(combo?.subtitle || '');
  const [description, setDescription] = useState(combo?.description || '');
  const [displayOrder, setDisplayOrder] = useState<number>(combo?.displayOrder || 1);
  const [isPopular, setIsPopular] = useState<boolean>(combo?.isPopular || false);
  const [isActive, setIsActive] = useState<boolean>(combo?.isActive !== undefined ? combo.isActive : true);

  const [items, setItems] = useState<ComboItemForm[]>(() => {
    if (combo?.items && Array.isArray(combo.items) && combo.items.length > 0) {
      return combo.items.map((it: any) => ({
        productId: it.productId || it.product?.id || products[0]?.id || '',
        quantity: it.quantity || 1,
        availableSizes: it.availableSizes || DEFAULT_SIZES
      }));
    }
    return [
      {
        productId: products[0]?.id || '',
        quantity: 2,
        availableSizes: DEFAULT_SIZES
      }
    ];
  });

  const [comboPrice, setComboPrice] = useState<number>(combo?.comboPrice || 0);
  const [originalPrice, setOriginalPrice] = useState<number>(combo?.originalPrice || 0);
  const [manualOriginal, setManualOriginal] = useState<boolean>(!!combo?.originalPrice);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculate suggested original price from products if not manually overridden
  const calculateAutoOriginalPrice = (itemsList: ComboItemForm[]): number => {
    const priceMap = new Map<string, number>();
    products.forEach((p) => priceMap.set(p.id, Number(p.startingPrice || 0)));

    return itemsList.reduce((sum, it) => {
      const unit = priceMap.get(it.productId) || 0;
      return sum + unit * (it.quantity || 1);
    }, 0);
  };

  useEffect(() => {
    if (!manualOriginal && !isEditing) {
      const autoPrice = calculateAutoOriginalPrice(items);
      setOriginalPrice(autoPrice);
    }
  }, [items, products, manualOriginal, isEditing]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: products[0]?.id || '',
        quantity: 1,
        availableSizes: DEFAULT_SIZES
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemProductChange = (index: number, productId: string) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, productId } : it))
    );
  };

  const handleItemQuantityChange = (index: number, quantity: number) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, quantity: Math.max(1, quantity) } : it))
    );
  };

  const handleToggleSize = (itemIndex: number, size: string) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== itemIndex) return it;
        const current = it.availableSizes || [];
        const exists = current.includes(size);
        const updated = exists ? current.filter((s) => s !== size) : [...current, size];
        return { ...it, availableSizes: updated };
      })
    );
  };

  const calculatedSavings = Math.max(0, originalPrice - comboPrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a combo name.');
      return;
    }

    if (items.length === 0) {
      setError('Please include at least one product in this combo.');
      return;
    }

    if (comboPrice <= 0) {
      setError('Combo selling price must be greater than ₹0.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        subtitle: subtitle.trim() || undefined,
        description: description.trim() || undefined,
        displayOrder: Number(displayOrder || 1),
        isPopular: Boolean(isPopular),
        isActive: Boolean(isActive),
        comboPrice: Number(comboPrice),
        originalPrice: Number(originalPrice || comboPrice),
        savings: calculatedSavings,
        items: items.map((it) => ({
          productId: it.productId,
          quantity: Number(it.quantity || 1),
          availableSizes: it.availableSizes
        }))
      };

      const url = isEditing
        ? `${API_BASE_URL}/combos/${combo.id}`
        : `${API_BASE_URL}/combos`;
      const method = isEditing ? 'PUT' : 'POST';

      let serverCombo: any = null;

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.combo) {
            serverCombo = data.combo;
          }
        }
      } catch (netErr) {
        console.warn('Backend unavailable, saving combo locally:', netErr);
      }

      // If server responded, use it; otherwise build combo object locally for instant response
      const resolvedCombo = serverCombo || {
        id: isEditing ? combo.id : `combo-${Date.now()}`,
        ...payload,
        items: payload.items.map((it, idx) => {
          const prod = products.find((p) => p.id === it.productId);
          return {
            id: `ci-${idx}-${Date.now()}`,
            ...it,
            product: prod || {
              id: it.productId,
              name: it.productId,
              category: 'Merch',
              startingPrice: 399,
              image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'
            }
          };
        })
      };

      onSave(resolvedCombo);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error saving combo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {isEditing ? `Edit Combo: ${combo.name}` : 'Create New Merch Combo'}
          </h3>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--color-status-danger)',
              background: 'var(--color-status-danger-bg)',
              border: '1px solid var(--color-status-danger)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Basic Info */}
          <div className={styles.sectionGroup}>
            <span className={styles.sectionTitle}>1. Basic Information</span>
            
            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Combo Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 T-Shirts, 2 Polo Duo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Short Subtitle / Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Best Value, Classic Duo"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                placeholder="Brief summary of what the customer receives in this pack..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.textarea}
                rows={2}
              />
            </div>

            <div className={styles.checkboxRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span>Active on customer website</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                />
                <span>Mark as Featured / Best Value (✦)</span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                <label className={styles.label} style={{ margin: 0, fontSize: 12 }}>Display Order:</label>
                <input
                  type="number"
                  min={1}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  style={{ width: 54, padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-canvas-bg)', color: 'var(--color-text-title)', textAlign: 'center' }}
                />
              </div>
            </div>
          </div>

          {/* 2. Products Included */}
          <div className={styles.sectionGroup}>
            <span className={styles.sectionTitle}>2. Included Products & Sizes</span>

            <div className={styles.productsContainer}>
              {items.map((it, idx) => (
                <div key={idx} className={styles.productRow}>
                  <div className={styles.productRowTop}>
                    <select
                      value={it.productId}
                      onChange={(e) => handleItemProductChange(idx, e.target.value)}
                      className={`${styles.select} ${styles.productSelect}`}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category} – ₹{p.startingPrice})
                        </option>
                      ))}
                    </select>

                    <div className={styles.qtyWrap}>
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Qty:</span>
                      <input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) => handleItemQuantityChange(idx, Number(e.target.value))}
                        className={styles.input}
                        style={{ width: 64, textAlign: 'center' }}
                      />
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className={styles.removeProductBtn}
                        title="Remove product"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Available Sizes for this Product */}
                  <div className={styles.sizesPicker}>
                    <span className={styles.sizesLabel}>Available Sizes:</span>
                    {DEFAULT_SIZES.map((sz) => {
                      const isChecked = (it.availableSizes || []).includes(sz);
                      return (
                        <span
                          key={sz}
                          onClick={() => handleToggleSize(idx, sz)}
                          className={`${styles.sizeChip} ${isChecked ? styles.sizeChipActive : ''}`}
                        >
                          {sz}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className={styles.addProductBtn}
            >
              <Plus size={15} />
              <span>Add Another Product to Combo</span>
            </button>
          </div>

          {/* 3. Pricing Configuration */}
          <div className={styles.sectionGroup}>
            <span className={styles.sectionTitle}>3. Pricing & Savings</span>

            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Combo Selling Price (₹) *</label>
                <input
                  type="number"
                  min={0}
                  required
                  placeholder="e.g. 1099"
                  value={comboPrice || ''}
                  onChange={(e) => setComboPrice(Number(e.target.value))}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className={styles.label}>Original Regular Price (₹)</label>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary-light)', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => {
                      setManualOriginal(false);
                      setOriginalPrice(calculateAutoOriginalPrice(items));
                    }}
                  >
                    Auto-Calculate
                  </button>
                </div>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 1999"
                  value={originalPrice || ''}
                  onChange={(e) => {
                    setManualOriginal(true);
                    setOriginalPrice(Number(e.target.value));
                  }}
                  className={styles.input}
                />
              </div>
            </div>

            {/* Live Pricing Summary */}
            <div className={styles.pricingPreview}>
              <div className={styles.pricingCalcCol}>
                <span className={styles.pricingCalcLabel}>Customer View Pricing:</span>
                <div className={styles.pricingCalcValues}>
                  {calculatedSavings > 0 && (
                    <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: 13 }}>
                      ₹{originalPrice}
                    </span>
                  )}
                  <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-title)' }}>
                    ₹{comboPrice}
                  </span>
                </div>
              </div>

              {calculatedSavings > 0 ? (
                <div className={styles.savingsIndicator}>
                  Customer Saves: ₹{calculatedSavings}
                </div>
              ) : (
                <div className={styles.noDiscountIndicator}>
                  Regular Pricing (No fake discount shown)
                </div>
              )}
            </div>
          </div>

          {/* Footer inside form */}
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={styles.saveBtn}>
              {saving ? 'Saving...' : (isEditing ? 'Update Combo' : 'Create Combo')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

