'use client';

import React, { useState } from 'react';
import { useOrderFlow, SizeQtyMap } from '../OrderFlowContext';
import { Check, ArrowLeft, ArrowRight, Plus, Trash2, Tag, X } from 'lucide-react';
import styles from './Step.module.css';
import { PRODUCTS_CATALOG } from '@/features/catalog/data/productsData';

const COLOR_OPTIONS = [
  { name: 'Warm Brown', hex: '#8c5b45' },
  { name: 'Charcoal Black', hex: '#1a1a1a' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Navy Blue', hex: '#1b2a4a' },
  { name: 'Maroon', hex: '#5c1d24' },
];

export function Step2ProductAndQuantities() {
  const { 
    state, 
    addOrderItem, 
    removeOrderItem, 
    updateItemQuantity, 
    addItemColorVariant, 
    removeItemColorVariant, 
    updateItemVariantSizeQty, 
    updateItemColor,
    totalPieces, 
    subtotal, 
    prevStep, 
    nextStep 
  } = useOrderFlow();

  const { items } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductSelect = (p: any) => {
    addOrderItem(p);
    setIsModalOpen(false);
  };

  const handleNext = () => {
    if (totalPieces < 1) {
      alert('Please select quantities for at least one item.');
      return;
    }
    nextStep();
  };

  return (
    <div className={styles.stepCard}>
      <div className={styles.stepHeaderRow}>
        <div className={styles.stepTitleGroup}>
          <span className={styles.stepNumberBadge}>02</span>
          <h2 className={styles.stepTitle}>Choose Your Products</h2>
        </div>
        <div className={styles.actionRowCompact}>
          <button type="button" className={styles.secondaryBtnCompact} onClick={prevStep}>
            <ArrowLeft size={16} /> Back
          </button>
          <button type="button" className={styles.primaryBtnCompact} onClick={handleNext}>
            Next <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* 1. Selected Items */}
      <div className={styles.sectionBlock}>
        <div className={styles.flexBetweenHeader}>
          <h3 className={styles.sectionHeader}>Your Items</h3>
          <button type="button" className={styles.browseCatalogBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Product
          </button>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #e5e7eb', borderRadius: '12px' }}>
            <p style={{ color: '#6b7280', marginBottom: '12px' }}>Your order is empty.</p>
            <button type="button" className={styles.primaryBtnCompact} onClick={() => setIsModalOpen(true)}>
              Browse Catalog
            </button>
          </div>
        ) : (
          items.map((item, itemIndex) => (
            <div key={item.id} className={styles.variantContainerCard} style={{ marginBottom: '24px' }}>
              <div className={styles.variantHeaderRow} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '16px' }}>
                <div className={styles.variantColorLabelGroup}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>
                    {itemIndex + 1}. {item.name}
                  </h4>
                  <span style={{ fontSize: '0.9rem', color: '#6b7280', marginLeft: '12px' }}>
                    ₹{item.pricePerUnit} / pc
                  </span>
                  {item.applyVolumeDiscount && (
                    <span className={styles.discountPill} style={{ marginLeft: '12px' }}>
                      <Tag size={12} style={{ marginRight: '4px' }} /> Bulk Discount Eligible
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.removeVariantBtn}
                  onClick={() => removeOrderItem(item.id)}
                  title="Remove Item"
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>

              {/* Conditional Rendering based on product config */}
              {item.requiresSizes && item.requiresColors ? (
                <>
                  {item.colorVariants.map((variant, index) => (
                    <div key={variant.id} style={{ marginBottom: '20px', background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                      <div className={styles.variantHeaderRow}>
                        <div className={styles.variantColorLabelGroup}>
                          <span className={styles.variantIndex}>Color #{index + 1}</span>
                          <div className={styles.colorSwatchesInline}>
                            {COLOR_OPTIONS.map((c) => (
                              <button
                                key={c.name}
                                type="button"
                                className={`${styles.swatchBtnSmall} ${variant.color === c.name ? styles.swatchActive : ''}`}
                                style={{ backgroundColor: c.hex }}
                                onClick={() => updateItemColor(item.id, variant.id, c.name, c.hex)}
                                title={c.name}
                              />
                            ))}
                          </div>
                          <span className={styles.variantColorName}>{variant.color}</span>
                        </div>

                        {item.colorVariants.length > 1 && (
                          <button
                            type="button"
                            className={styles.removeVariantBtn}
                            onClick={() => removeItemColorVariant(item.id, variant.id)}
                            title="Remove variant"
                          >
                            <X size={16} /> Remove Color
                          </button>
                        )}
                      </div>

                      {/* Compact Size Quantity Grid */}
                      <div className={styles.compactSizeGrid}>
                        {(['S', 'M', 'L', 'XL', 'XXL'] as (keyof SizeQtyMap)[]).map((sz) => {
                          const qty = variant.sizes[sz] || '';
                          return (
                            <div key={sz} className={styles.compactSizeCell}>
                              <span className={styles.compactSizeLabel}>{sz}</span>
                              <div className={styles.compactStepperWrapper}>
                                <button
                                  type="button"
                                  className={styles.compactStepperBtn}
                                  onClick={() => updateItemVariantSizeQty(item.id, variant.id, sz, Math.max(0, (typeof qty === 'number' ? qty : 0) - 1))}
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  className={styles.compactStepperInput}
                                  value={qty}
                                  onChange={(e) => updateItemVariantSizeQty(item.id, variant.id, sz, parseInt(e.target.value, 10) || 0)}
                                  placeholder="0"
                                />
                                <button
                                  type="button"
                                  className={styles.compactStepperBtn}
                                  onClick={() => updateItemVariantSizeQty(item.id, variant.id, sz, (typeof qty === 'number' ? qty : 0) + 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addVariantBtn}
                    onClick={() => addItemColorVariant(item.id, 'Charcoal Black', '#1a1a1a')}
                  >
                    <Plus size={16} /> Add Another Color
                  </button>
                </>
              ) : (
                /* Simple Quantity Selector for Non-Sized/Colored Items */
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontWeight: 500 }}>Quantity</span>
                  <div className={styles.compactStepperWrapper} style={{ width: '120px' }}>
                    <button
                      type="button"
                      className={styles.compactStepperBtn}
                      onClick={() => updateItemQuantity(item.id, Math.max(0, item.quantity - 1))}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      className={styles.compactStepperInput}
                      value={item.quantity || ''}
                      onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value, 10) || 0)}
                      placeholder="0"
                    />
                    <button
                      type="button"
                      className={styles.compactStepperBtn}
                      onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Live Summary Bar */}
        {items.length > 0 && (
          <div className={styles.summaryBarRow}>
            <div className={styles.summaryBarCol}>
              <span className={styles.summaryLabel}>Total Selected Quantity</span>
              <span className={styles.summaryValueLarge}>{totalPieces} Pieces</span>
            </div>
            <div className={styles.summaryBarCol}>
              <span className={styles.summaryLabel}>Estimated Subtotal</span>
              <span className={styles.summaryValueHighlight}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Products Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>All Products</h3>
              <button className={styles.closeModalBtn} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalProductGrid}>
                {PRODUCTS_CATALOG.map((p) => {
                  const isSelected = items.some(i => i.productId === p.id);
                  return (
                    <button
                      type="button"
                      key={p.id}
                      className={`${styles.visualProductTile} ${isSelected ? styles.visualTileSelected : ''}`}
                      onClick={() => {
                        if (!isSelected) handleProductSelect(p);
                      }}
                      disabled={isSelected}
                      style={{ opacity: isSelected ? 0.6 : 1 }}
                    >
                      <div className={styles.productBadgePill}>₹{p.startingPrice}/pc</div>
                      <div className={styles.productTileImgWrapper}>
                        <img src={p.image} alt={p.name} className={styles.productTileImg} />
                      </div>
                      <h4 className={styles.productTileTitle}>{p.name}</h4>
                      <p className={styles.productTileDesc}>{p.shortDesc}</p>
                      {isSelected && (
                        <div className={styles.tileCheckIcon}>
                          <Check size={16} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Step2ProductAndQuantities;
