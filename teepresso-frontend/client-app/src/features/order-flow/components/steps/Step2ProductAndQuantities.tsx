'use client';

import React, { useState } from 'react';
import { useOrderFlow, SizeQtyMap } from '../OrderFlowContext';
import { Check, ArrowLeft, ArrowRight, Plus, Trash2, Tag, LayoutGrid, X } from 'lucide-react';
import styles from './Step.module.css';
import { PRODUCTS_CATALOG } from '@/features/catalog/data/productsData';

const PRIMARY_PRODUCTS = [
  {
    id: 'tshirt-roundneck',
    name: 'Round Neck T-Shirt',
    desc: '180 GSM Super Combed Cotton. Premium finish.',
    price: 199,
    image: '/images/products/tshirt.png',
  },
  {
    id: 'tshirt-polo',
    name: 'Polo T-Shirt',
    desc: '220 GSM Heavy Matty Cotton with Collar.',
    price: 299,
    image: '/images/products/polo.png',
  },
];

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
    updateProduct, 
    addColorVariant, 
    removeColorVariant, 
    updateVariantSizeQty, 
    totalPieces, 
    subtotal, 
    prevStep, 
    nextStep 
  } = useOrderFlow();

  const { product, colorVariants } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductSelect = (p: { id: string; name: string; price?: number; startingPrice?: number }) => {
    updateProduct({
      id: p.id,
      name: p.name,
      category: p.name,
      pricePerUnit: p.price || p.startingPrice || 199,
    });
    setIsModalOpen(false);
  };

  const handleNext = () => {
    if (totalPieces < 1) {
      alert('Please enter quantities for at least one size.');
      return;
    }
    nextStep();
  };

  return (
    <div className={styles.stepCard}>
      <div className={styles.stepHeaderRow}>
        <div className={styles.stepTitleGroup}>
          <span className={styles.stepNumberBadge}>02</span>
          <h2 className={styles.stepTitle}>Product & Quantities</h2>
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

      {/* 1. Visual Product Cards */}
      <div className={styles.sectionBlock}>
        <div className={styles.flexBetweenHeader}>
          <h3 className={styles.sectionHeader}>1. Select Apparel</h3>
          <button type="button" className={styles.secondaryBtnCompact} onClick={() => setIsModalOpen(true)}>
            <LayoutGrid size={14} /> Browse Catalog
          </button>
        </div>
        <div className={styles.visualProductGrid3Col}>
          {PRIMARY_PRODUCTS.map((p) => {
            const isSelected = product.id === p.id;
            return (
              <div
                key={p.id}
                className={`${styles.visualProductTile} ${isSelected ? styles.visualTileSelected : ''}`}
                onClick={() => handleProductSelect(p)}
              >
                <div className={styles.productBadgePill}>₹{p.price}/pc</div>
                <div className={styles.productTileImgWrapper}>
                  <img src={p.image} alt={p.name} className={styles.productTileImg} />
                </div>
                <h4 className={styles.productTileTitle}>{p.name}</h4>
                <p className={styles.productTileDesc}>{p.desc}</p>
                {isSelected && (
                  <div className={styles.tileCheckIcon}>
                    <Check size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Color Variants & Size Quantities */}
      <div className={styles.sectionBlock}>
        <div className={styles.flexBetweenHeader}>
          <h3 className={styles.sectionHeader}>2. Colors & Size Breakdown</h3>
          <div className={styles.discountPill}>
            <Tag size={14} /> Bulk Tier Discount Active
          </div>
        </div>

        {colorVariants.map((variant, index) => (
          <div key={variant.id} className={styles.variantContainerCard}>
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
                      onClick={() => {
                        if (index === 0) updateProduct({ color: c.name, colorHex: c.hex });
                      }}
                      title={c.name}
                    />
                  ))}
                </div>
                <span className={styles.variantColorName}>{variant.color}</span>
              </div>

              {colorVariants.length > 1 && (
                <button
                  type="button"
                  className={styles.removeVariantBtn}
                  onClick={() => removeColorVariant(variant.id)}
                  title="Remove variant"
                >
                  <Trash2 size={16} /> Remove
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
                        onClick={() => updateVariantSizeQty(variant.id, sz, Math.max(0, (typeof qty === 'number' ? qty : 0) - 1))}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        className={styles.compactStepperInput}
                        value={qty}
                        onChange={(e) => updateVariantSizeQty(variant.id, sz, parseInt(e.target.value, 10) || 0)}
                        placeholder="0"
                      />
                      <button
                        type="button"
                        className={styles.compactStepperBtn}
                        onClick={() => updateVariantSizeQty(variant.id, sz, (typeof qty === 'number' ? qty : 0) + 1)}
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
          onClick={() => addColorVariant('Charcoal Black', '#1a1a1a')}
        >
          <Plus size={16} /> Add Another Color Variant
        </button>

        {/* Live Summary Bar */}
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
                  const isSelected = product.id === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`${styles.visualProductTile} ${isSelected ? styles.visualTileSelected : ''}`}
                      onClick={() => handleProductSelect(p)}
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
                    </div>
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
