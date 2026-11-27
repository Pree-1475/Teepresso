"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import styles from './CombosSection.module.css';
import { API_BASE_URL } from '@/common/config/api';

interface EnrichedProduct {
  id: string;
  name: string;
  category: string;
  image: string;
  startingPrice: number;
  colors?: string[];
  sizes?: string[];
}

interface EnrichedComboItem {
  productId: string;
  quantity: number;
  availableSizes?: string[];
  product?: EnrichedProduct;
}

interface DynamicCombo {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  isPopular: boolean;
  isActive: boolean;
  originalPrice: number;
  comboPrice: number;
  savings: number;
  items: EnrichedComboItem[];
  sizePricing?: Record<string, { comboPrice: number; originalPrice?: number; savings?: number }>;
  displayOrder?: number;
}

// Fallback initial combos to ensure instant rendering without layout shift
const FALLBACK_COMBOS: DynamicCombo[] = [
  {
    id: 'combo-1',
    name: '2 Polo T-Shirts',
    subtitle: 'Classic Duo',
    description: '2 premium cotton pique polos with custom chest embroidery or print.',
    isPopular: false,
    isActive: true,
    displayOrder: 1,
    originalPrice: 899,
    comboPrice: 899,
    savings: 0,
    items: [
      {
        productId: 'polo-corporate',
        quantity: 2,
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        product: {
          id: 'polo-corporate',
          name: 'Classic Pique Polo',
          category: 'Polos',
          image: '/images/products/polo.png',
          startingPrice: 449
        }
      }
    ]
  },
  {
    id: 'combo-2',
    name: '5 T-Shirts',
    subtitle: 'Best Value',
    description: '5 bio-washed cotton crewneck tees with custom front & back print.',
    isPopular: true,
    isActive: true,
    displayOrder: 2,
    originalPrice: 1999,
    comboPrice: 1099,
    savings: 900,
    items: [
      {
        productId: 'tshirt-roundneck',
        quantity: 5,
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        product: {
          id: 'tshirt-roundneck',
          name: 'Classic Round Neck T-Shirt',
          category: 'T-Shirts',
          image: '/images/products/tshirt.png',
          startingPrice: 199
        }
      }
    ]
  },
  {
    id: 'combo-3',
    name: '10 Polo T-Shirts',
    subtitle: 'Executive Squad',
    description: '10 executive pique polo shirts designed for company teams & fests.',
    isPopular: false,
    isActive: true,
    displayOrder: 3,
    originalPrice: 3499,
    comboPrice: 2499,
    savings: 1000,
    items: [
      {
        productId: 'polo-corporate',
        quantity: 10,
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        product: {
          id: 'polo-corporate',
          name: 'Executive Pique Polo',
          category: 'Polos',
          image: '/images/products/polo.png',
          startingPrice: 449
        }
      }
    ]
  }
];

export function CombosSection() {
  const [combos, setCombos] = useState<DynamicCombo[]>(FALLBACK_COMBOS);
  const [selectedComboId, setSelectedComboId] = useState<string>('combo-2');
  const [selectedSize, setSelectedSize] = useState<string>('Mixed Sizes (S–XXL)');

  // Fetch active dynamic combos from backend API
  useEffect(() => {
    let isMounted = true;

    const fetchActiveCombos = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/combos`);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.combos) && data.combos.length > 0) {
            setCombos(data.combos);
            const hasSelected = data.combos.some((c: DynamicCombo) => c.id === selectedComboId);
            if (!hasSelected) {
              const popular = data.combos.find((c: DynamicCombo) => c.isPopular) || data.combos[0];
              if (popular) setSelectedComboId(popular.id);
            }
          }
        }
      } catch (err) {
        console.warn('Using fallback combos:', err);
      }
    };

    fetchActiveCombos();

    return () => {
      isMounted = false;
    };
  }, []);

  // Selected combo
  const navigate = useNavigate();
  const [rareSize, setRareSize] = useState<'4XL' | '5XL'>('4XL');
  const selectedCombo = combos.find((c) => c.id === selectedComboId) || combos[0];

  if (!selectedCombo) {
    return null;
  }

  // Calculate total piece count from included items
  const totalPieceCount = (selectedCombo.items || []).reduce(
    (sum, it) => sum + Number(it.quantity || 1),
    0
  );

  // Derive available sizes
  const uniqueSizes = new Set<string>();
  (selectedCombo.items || []).forEach((it) => {
    (it.availableSizes || ['S', 'M', 'L', 'XL', 'XXL']).forEach((s) => uniqueSizes.add(s));
  });
  const sizeOptions = ['Mixed Sizes (S–XXL)', ...Array.from(uniqueSizes)];

  // Dynamic pricing calculation
  let currentComboPrice = Number(selectedCombo.comboPrice || 0);
  let currentOriginalPrice = Number(selectedCombo.originalPrice || 0);

  if (selectedCombo.sizePricing && selectedCombo.sizePricing[selectedSize]) {
    const override = selectedCombo.sizePricing[selectedSize];
    currentComboPrice = Number(override.comboPrice || currentComboPrice);
    if (override.originalPrice) currentOriginalPrice = Number(override.originalPrice);
  }

  const currentSavings = Math.max(0, currentOriginalPrice - currentComboPrice);
  const hasGenuineDiscount = currentSavings > 0 && currentOriginalPrice > currentComboPrice;

  // Primary product for visual display
  const primaryItem = selectedCombo.items?.[0];
  const primaryProduct = primaryItem?.product;
  const displayImage = primaryProduct?.image || '/images/products/tshirt.png';

  // WhatsApp CTA link
  const getWaUrl = () => {
    const phone = '919390771123';
    const savingsNote = hasGenuineDiscount ? ` (Save ₹${currentSavings.toLocaleString('en-IN')})` : '';
    const message = `Hi Teepresso! I want to get the ${selectedCombo.name} deal for ₹${currentComboPrice.toLocaleString('en-IN')}${savingsNote}.\n` +
      `• Size Preference: ${selectedSize}\n\n` +
      `Please share mockup & order steps.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <section className={styles.section} id="combos">
      <div className="container">
        
        {/* Balanced Section Header */}
        <div className={styles.header}>
          <span className={styles.label}>CURATED BUNDLES</span>
          <h2 className={styles.title}>All-in-One Combos</h2>
          <p className={styles.subtitle}>
            Volume-discounted merch packs for your team or event. Custom print and digital proof included.
          </p>
        </div>

        {/* Segmented Tabs: Combo 1 | Combo 2 ✦ | Combo 3 */}
        <div className={styles.tabsWrapper}>
          <div className={styles.segmentedControl} role="tablist" aria-label="Choose Combo">
            {combos.map((combo, idx) => {
              const isSelected = combo.id === selectedCombo.id;
              const tabLabel = `Combo ${idx + 1}`;
              return (
                <button
                  key={combo.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setSelectedComboId(combo.id);
                    setSelectedSize('Mixed Sizes (S–XXL)');
                  }}
                  className={`${styles.tabButton} ${isSelected ? styles.tabButtonActive : ''}`}
                >
                  <span className={styles.tabText}>{tabLabel}</span>
                  {combo.isPopular && (
                    <span className={styles.tabStar} title="Popular Deal">✦</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Combos Spotlight Card + Clean 4XL & 5XL Card Beside It */}
        <div className={styles.combosWithRareGrid}>
          <div className={styles.spotlightCard}>
          <div className={styles.contentGrid}>
            
            {/* Left: Offer, Concise Description, Perks, Sizes, Price & CTA */}
            <div className={styles.detailsPane}>
              
              <div className={styles.titleRow}>
                <h3 className={styles.comboHeadline}>
                  {selectedCombo.name}
                </h3>
                {selectedCombo.subtitle && (
                  <span className={styles.badgePill}>{selectedCombo.subtitle}</span>
                )}
              </div>

              {selectedCombo.description && (
                <p className={styles.comboDescription}>
                  {selectedCombo.description}
                </p>
              )}

              {/* 3 Key Highlights */}
              <div className={styles.perksList}>
                <div className={styles.perkItem}>
                  <Check size={14} className={styles.perkIcon} />
                  <span>Free size allocation across the pack</span>
                </div>
                <div className={styles.perkItem}>
                  <Check size={14} className={styles.perkIcon} />
                  <span>Custom logo print or embroidery included</span>
                </div>
                <div className={styles.perkItem}>
                  <Check size={14} className={styles.perkIcon} />
                  <span>Free 3D digital mockup review before printing</span>
                </div>
              </div>

              {/* Size Selector */}
              <div className={styles.sizeBlock}>
                <label className={styles.sizeLabel}>Size Preference:</label>
                <div className={styles.sizeRow} role="radiogroup" aria-label="Select size allocation">
                  {sizeOptions.map((size) => {
                    const isSizeActive = size === selectedSize;
                    return (
                      <button
                        key={size}
                        type="button"
                        role="radio"
                        aria-checked={isSizeActive}
                        onClick={() => setSelectedSize(size)}
                        className={`${styles.sizePill} ${isSizeActive ? styles.sizePillActive : ''}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price & Savings Display */}
              <div className={styles.priceSection}>
                <div className={styles.priceRow}>
                  {hasGenuineDiscount && (
                    <span className={styles.strikethroughPrice}>
                      ₹{currentOriginalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className={styles.activePrice}>
                    ₹{currentComboPrice.toLocaleString('en-IN')}
                  </span>
                  {hasGenuineDiscount && (
                    <div className={styles.savingsPill}>
                      <span>Save ₹{currentSavings.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
                <span className={styles.priceSubtext}>
                  All-inclusive pack price • Zero setup or screen fees
                </span>
              </div>

              {/* Action Button */}
              <div className={styles.ctaWrapper}>
                <a
                  href={getWaUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaButton}
                >
                  <span>Get This Combo</span>
                  <ArrowRight size={16} />
                </a>
              </div>

            </div>

            {/* Right: Studio Mockup Podium */}
            <div className={styles.visualPane}>
              <div className={styles.podium}>
                <div className={styles.auraGlow} />
                <div className={styles.imageStage}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={selectedCombo.id}
                    src={displayImage}
                    alt={selectedCombo.name}
                    className={styles.garmentImage}
                  />
                </div>
                <div className={styles.podiumPill}>
                  <span>{totalPieceCount} Pieces Pack</span>
                </div>
              </div>
            </div>

          </div>
          </div>

          {/* Clean & Simple 4XL & 5XL Rare Sizes Card Beside Combos */}
          <aside className={styles.rareSizesCard} aria-label="Rare 4XL and 5XL sizes">
            <span className={styles.rareEyebrow}>RARE SIZES • IN STOCK</span>
            <h3 className={styles.rareTitle}>4XL &amp; 5XL Tees</h3>
            <p className={styles.rareDesc}>
              Hard-to-find extended sizes in 240 GSM combed cotton — available with no minimum order.
            </p>

            <div className={styles.rarePreviewBox}>
              <img
                src="/images/products/teepresso/white/tee-white-front.png"
                alt="4XL and 5XL Custom T-Shirt"
                className={styles.rareGarmentThumb}
              />
              <span className={styles.rareWatermark}>{rareSize}</span>
            </div>

            <div className={styles.rareSizePills} role="group" aria-label="Select rare size">
              <button
                type="button"
                onClick={() => setRareSize('4XL')}
                className={`${styles.rareSizeBtn} ${rareSize === '4XL' ? styles.rareSizeBtnActive : ''}`}
              >
                4XL · 50&quot; Chest
              </button>
              <button
                type="button"
                onClick={() => setRareSize('5XL')}
                className={`${styles.rareSizeBtn} ${rareSize === '5XL' ? styles.rareSizeBtnActive : ''}`}
              >
                5XL · 54&quot; Chest
              </button>
            </div>

            <p className={styles.rareSpecLine}>
              {rareSize === '4XL' ? 'Length 31.5" • Relaxed Tailored Fit' : 'Length 32.5" • Generous Studio Fit'}
            </p>

            <button
              type="button"
              onClick={() => navigate('/product/prod_tee_001')}
              className={styles.rareCtaBtn}
            >
              <span>Customize {rareSize}</span>
              <ArrowRight size={15} />
            </button>
          </aside>
        </div>

      </div>
    </section>
  );
}

export default CombosSection;
