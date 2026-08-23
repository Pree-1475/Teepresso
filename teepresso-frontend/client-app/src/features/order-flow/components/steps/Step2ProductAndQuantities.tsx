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
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [prevItemsLength, setPrevItemsLength] = useState(items.length);

  React.useEffect(() => {
    if (items.length > prevItemsLength) {
      setExpandedItemId(items[items.length - 1].id);
    }
    setPrevItemsLength(items.length);
  }, [items.length, items, prevItemsLength]);

  const handleProductSelect = (p: any) => {
    addOrderItem(p);
    setIsModalOpen(false);
  };

  const toggleAccordion = (id: string) => {
    setExpandedItemId(prev => (prev === id ? null : id));
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

      {/* Main Content Area */}
      <div className={styles.sectionBlock}>
        {items.length === 0 ? (
          <div className={styles.emptyStateSelectCard} onClick={() => setIsModalOpen(true)}>
            <div className={styles.emptyStateIconWrapper}>
              <Plus size={36} />
            </div>
            <h3 className={styles.emptyStateTitle}>Let's add your first product</h3>
            <p className={styles.emptyStateDesc}>
              Choose from our wide catalog of premium t-shirts, hoodies, and merchandise. 
              We support bulk sizing and custom colors.
            </p>
            <button type="button" className={styles.emptyStateBtn}>
              Browse Product Catalog
            </button>
          </div>
        ) : (
          <>
            <div className={styles.flexBetweenHeader} style={{ marginBottom: '8px' }}>
              <h3 className={styles.sectionHeader}>Your Selected Items</h3>
            </div>
            
            {items.map((item, itemIndex) => {
              const isExpanded = expandedItemId === item.id || (expandedItemId === null && items.length === 1);
              let itemTotalQty = 0;
              if (item.requiresSizes || item.requiresColors) {
                itemTotalQty = item.colorVariants.reduce((sum, v) => 
                  sum + (Object.values(v.sizes) as number[]).reduce((a, b) => a + (b || 0), 0)
                , 0);
              } else {
                itemTotalQty = item.quantity || 0;
              }

              return (
                <div 
                  key={item.id} 
                  className={`${styles.productAccordionItem} ${isExpanded ? styles.productAccordionItemActive : ''}`}
                >
                  <div 
                    className={styles.productAccordionHeader} 
                    onClick={() => toggleAccordion(item.id)}
                  >
                    <div className={styles.accordionHeaderLeft}>
                      <div className={styles.accordionIndexBadge}>{itemIndex + 1}</div>
                      <div>
                        <h4 className={styles.accordionProductTitle}>{item.name}</h4>
                        <p className={styles.accordionProductSummary}>
                          {itemTotalQty} Pieces | ₹{item.pricePerUnit}/pc
                        </p>
                      </div>
                    </div>
                    
                    <div className={styles.accordionHeaderRight}>
                      <button
                        type="button"
                        className={styles.accordionRemoveBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeOrderItem(item.id);
                        }}
                        title="Remove Product"
                      >
                        <Trash2 size={18} />
                      </button>
                      <ArrowRight 
                        size={20} 
                        className={`${styles.accordionToggleIcon} ${isExpanded ? styles.accordionToggleIconOpen : ''}`} 
                        style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      />
                    </div>
                  </div>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className={styles.productAccordionContent}>
                      {item.requiresSizes && item.requiresColors ? (
                        <>
                          {item.colorVariants.map((variant, index) => (
                            <div key={variant.id} style={{ marginBottom: '20px', background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
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
                                    title="Remove Color"
                                  >
                                    <X size={16} /> Remove Color
                                  </button>
                                )}
                              </div>

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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f9fafb', padding: '16px', borderRadius: '12px' }}>
                          <span style={{ fontWeight: 600, color: '#374151' }}>Total Quantity:</span>
                          <div className={styles.compactStepperWrapper} style={{ width: '130px' }}>
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
                  )}
                </div>
              );
            })}
            
            <button 
              type="button" 
              className={styles.addAnotherProductRoundBtn} 
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={20} /> Add Another Product
            </button>
          </>
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
