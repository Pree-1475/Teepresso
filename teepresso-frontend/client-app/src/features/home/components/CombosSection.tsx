"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  ArrowRight, 
  Minus, 
  Plus, 
  Sparkles, 
  Shirt, 
  Package, 
  Tag, 
  ShieldCheck, 
  Clock, 
  MessageSquare,
  Award
} from 'lucide-react';
import styles from './CombosSection.module.css';

interface ComboItemDetail {
  name: string;
  spec: string;
  icon: 'shirt' | 'package' | 'tag' | 'sparkles';
}

interface ComboPackage {
  id: string;
  tabLabel: string;
  badge: string;
  popularTag?: string;
  title: string;
  subtitle: string;
  description: string;
  basePrice: number;
  image: string;
  itemsCount: number;
  items: ComboItemDetail[];
  perks: string[];
}

const COMBOS: ComboPackage[] = [
  {
    id: 'combo-1',
    tabLabel: 'Combo 1',
    badge: 'Fest Starter',
    popularTag: 'Most Popular for College Fests',
    title: 'Fest & Event Starter Pack',
    subtitle: 'Custom T-Shirt + Cotton Cap + Satin Lanyard & ID Card',
    description: 'The definitive all-in-one bundle for college festivals, volunteer squads, and student councils. Uniform branding that looks cohesive and photogenic from day one.',
    basePrice: 449,
    image: '/images/products/tshirt.png',
    itemsCount: 3,
    items: [
      {
        name: 'Custom Printed Bio-Washed Tee',
        spec: '180 GSM 100% combed cotton, breathable, pre-shrunk with multi-color chest & back print.',
        icon: 'shirt',
      },
      {
        name: 'Structured Cotton Twill Cap',
        spec: '6-panel athletic profile with brass buckle adjuster and front 3D embroidered crest or print.',
        icon: 'sparkles',
      },
      {
        name: 'HD Satin Lanyard + ID Holder',
        spec: '20mm double-sided thermal sublimation lanyard with breakaway safety clip and clear badge holder.',
        icon: 'tag',
      },
    ],
    perks: [
      'Screen / DTF print included on Tee',
      'Front embroidery/print on Cap',
      'Mix sizes freely (S to XXL)',
      'Free 3D digital mockup within 6 hours',
    ],
  },
  {
    id: 'combo-2',
    tabLabel: 'Combo 2',
    badge: 'Club & Society',
    popularTag: 'Best for Tech & Creative Clubs',
    title: 'Club & Society Creator Pack',
    subtitle: 'Heavyweight Oversized Tee + Organic Canvas Tote + Sticker Pack',
    description: 'Elevated streetwear aesthetic curated for design clubs, coding hackathons, dance crews, and university societies who prioritize aesthetic and durable merch.',
    basePrice: 649,
    image: '/images/products/oversized.png',
    itemsCount: 3,
    items: [
      {
        name: 'Heavyweight Oversized Tee',
        spec: '240 GSM dense French terry cotton with relaxed drop-shoulder drape and puff / screen artwork.',
        icon: 'shirt',
      },
      {
        name: 'Organic Cotton Canvas Tote',
        spec: '380 GSM natural off-white canvas tote with reinforced cross-stitched handles & crisp screen print.',
        icon: 'package',
      },
      {
        name: '4-Piece Die-Cut Vinyl Stickers',
        spec: 'Premium waterproof, scratch-resistant matte vinyl stickers for laptops and phone cases.',
        icon: 'sparkles',
      },
    ],
    perks: [
      'Premium 240 GSM drop-shoulder cut',
      'Zero screen setup fees',
      'Reusable heavy canvas tote bag',
      'Durable UV-laminated sticker set',
    ],
  },
  {
    id: 'combo-3',
    tabLabel: 'Combo 3',
    badge: 'Corporate Pack',
    popularTag: 'Corporate & Executive Choice',
    title: 'Executive Welcome Kit',
    subtitle: 'Classic Pique Polo + Insulated Steel Sipper + Hardbound Journal',
    description: 'An understated, high-end kit engineered for tech startup new-hires, leadership summits, and client corporate gifts with premium laser-etched and embroidered finishes.',
    basePrice: 799,
    image: '/images/products/polo.png',
    itemsCount: 3,
    items: [
      {
        name: 'Classic Honeycomb Pique Polo',
        spec: '240 GSM ring-spun cotton blend with knitted collar, mother-of-pearl buttons, and precision crest.',
        icon: 'shirt',
      },
      {
        name: 'Double-Walled Steel Sipper (500ml)',
        spec: 'Matte thermal insulated bottle keeping cold 24h / hot 12h, permanently laser-engraved.',
        icon: 'package',
      },
      {
        name: 'Executive Hardbound Journal & Pen',
        spec: 'A5 vegan leather textured notebook with ribbon bookmark and weighted metal rollerball pen.',
        icon: 'tag',
      },
    ],
    perks: [
      'Detailed thread embroidery on polo',
      'Precision permanent laser engraving',
      'Individual presentation box ready',
      'Pan-India door-to-door delivery',
    ],
  },
  {
    id: 'combo-4',
    tabLabel: 'Combo 4',
    badge: 'Winter & Squad',
    popularTag: 'Outgoing Batches & Sports Teams',
    title: 'Squad & Winter Athletic Pack',
    subtitle: 'Heavy Fleece Hoodie + Embroidered Beanie + Drawstring Tech Bag',
    description: 'Heavy-duty warm apparel bundle ideal for graduating batches, department merchandise, inter-college sports delegations, and winter event campaigns.',
    basePrice: 999,
    image: '/images/products/hoodie.png',
    itemsCount: 3,
    items: [
      {
        name: 'Heavy Fleece Pullover Hoodie',
        spec: '320 GSM brushed fleece with double-lined hood, kangaroo pouch, and custom back batch typography.',
        icon: 'shirt',
      },
      {
        name: 'Ribbed Knit Athletic Beanie / Cap',
        spec: '100% hypoallergenic acrylic ribbed knit with custom woven clamp label or front embroidery.',
        icon: 'sparkles',
      },
      {
        name: 'Reinforced Drawstring Gym Bag',
        spec: 'Water-repellent 420D nylon sport sack with thick rope straps and hidden secure zip pocket.',
        icon: 'package',
      },
    ],
    perks: [
      'Ultra-warm 320 GSM brushed fleece interior',
      'Custom back names & numbers supported',
      'Dual-color sleeve or hood prints',
      'Heavy-duty athletic drawstring bag',
    ],
  },
];

const SIZES = ['Mixed Sizes (S–XXL)', 'Size S', 'Size M', 'Size L', 'Size XL', 'Size XXL'];

const TRUST_CHECKMARKS = [
  'Zero Setup Fees',
  'Mix Any Sizes',
  'Free 3D Mockup',
];

export function CombosSection() {
  const [selectedComboId, setSelectedComboId] = useState<string>('combo-1');
  const [selectedSize, setSelectedSize] = useState<string>('Mixed Sizes (S–XXL)');
  const [quantity, setQuantity] = useState<number>(100);

  const selectedCombo = COMBOS.find((c) => c.id === selectedComboId) || COMBOS[0];

  // Volume pricing calculation matching bulk manufacturing curves
  const getPricePerCombo = (base: number, qty: number): number => {
    if (qty >= 500) return Math.round(base * 0.70); // 30% volume discount
    if (qty >= 250) return Math.round(base * 0.76); // 24% volume discount
    if (qty >= 100) return Math.round(base * 0.84); // 16% volume discount
    if (qty >= 50) return Math.round(base * 0.92);  // 8% volume discount
    return base;
  };

  const pricePerSet = getPricePerCombo(selectedCombo.basePrice, quantity);
  const estimatedTotal = pricePerSet * quantity;
  const standardTotal = selectedCombo.basePrice * quantity;
  const totalSavings = standardTotal - estimatedTotal;
  const discountPercent = Math.round(((selectedCombo.basePrice - pricePerSet) / selectedCombo.basePrice) * 100);

  // Slider fill track calculation (25 to 500)
  const sliderPercentage = Math.min(
    100,
    Math.max(0, ((quantity - 25) / (500 - 25)) * 100)
  );

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(25, prev - 5));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(500, prev + 5));
  };

  const getWaUrl = () => {
    const phone = '919390771123';
    const message = `Hi Teepresso! I want to order / inquire about *${selectedCombo.tabLabel}: ${selectedCombo.title}*.\n\n` +
      `• Quantity: ${quantity} combo sets\n` +
      `• Size Breakdown: ${selectedSize}\n` +
      `• Estimated Price: ₹${pricePerSet}/set (Total: ₹${estimatedTotal.toLocaleString('en-IN')})\n\n` +
      `Please share a digital mockup and production timeline.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const renderIcon = (type: ComboItemDetail['icon']) => {
    switch (type) {
      case 'shirt':
        return <Shirt size={16} className={styles.itemIconSvg} />;
      case 'package':
        return <Package size={16} className={styles.itemIconSvg} />;
      case 'tag':
        return <Tag size={16} className={styles.itemIconSvg} />;
      case 'sparkles':
      default:
        return <Sparkles size={16} className={styles.itemIconSvg} />;
    }
  };

  return (
    <section className={styles.wrapper} id="combos">
      <div className="container">
        
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.eyebrowPill}>
            <Sparkles size={12} />
            <span>VALUE PACKS</span>
          </div>

          <h2 className={styles.title}>
            Team & Fest <em>Combos</em>
          </h2>

          <p className={styles.subtitle}>
            All-in-one merch bundles with built-in bulk savings.
          </p>

          <div className={styles.trustBadgesRow}>
            {TRUST_CHECKMARKS.map((item, idx) => (
              <div key={idx} className={styles.trustBadge}>
                <div className={styles.checkIconWrap}>
                  <Check size={11} strokeWidth={3} />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Card Container */}
        <div className={styles.comboCard}>
          
          {/* Top Selector: Combo Tabs (Combo 1, Combo 2, Combo 3, Combo 4) */}
          <div className={styles.tabsContainer} role="tablist" aria-label="Select Merch Combo">
            {COMBOS.map((combo) => {
              const isSelected = combo.id === selectedCombo.id;
              return (
                <button
                  key={combo.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedComboId(combo.id)}
                  className={`${styles.tabBtn} ${isSelected ? styles.tabBtnActive : ''}`}
                >
                  <div className={styles.tabHeaderRow}>
                    <span className={styles.tabLabel}>{combo.tabLabel}</span>
                    {isSelected && (
                      <span className={styles.tabActiveDot} aria-hidden="true" />
                    )}
                  </div>
                  <span className={styles.tabBadge}>{combo.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Combo Showcase Area: Left Info & Item Breakdown + Right Visual Preview */}
          <div className={styles.showcaseGrid}>
            
            {/* Left: Combo Narrative & Items Included */}
            <div className={styles.comboDetails}>
              {selectedCombo.popularTag && (
                <div className={styles.popularTagPill}>
                  <Award size={13} />
                  <span>{selectedCombo.popularTag}</span>
                </div>
              )}

              <h3 className={styles.comboTitle}>{selectedCombo.title}</h3>
              <p className={styles.comboSubtitle}>{selectedCombo.subtitle}</p>
              <p className={styles.comboDesc}>{selectedCombo.description}</p>

              <div className={styles.includesBox}>
                <div className={styles.includesHeader}>
                  <span className={styles.includesTitle}>What&apos;s Included In This Kit:</span>
                  <span className={styles.itemsCountBadge}>{selectedCombo.itemsCount} Custom Items</span>
                </div>

                <div className={styles.itemsList}>
                  {selectedCombo.items.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <div className={styles.itemIconBadge}>
                        {renderIcon(item.icon)}
                      </div>
                      <div className={styles.itemTextWrap}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemSpec}>{item.spec}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Combo Perks Checklist */}
              <div className={styles.perksGrid}>
                {selectedCombo.perks.map((perk, idx) => (
                  <div key={idx} className={styles.perkItem}>
                    <ShieldCheck size={14} className={styles.perkIcon} />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual Bundle Mockup Display */}
            <div className={styles.previewColumn}>
              <div className={styles.mockupCard}>
                <div className={styles.mockupHeader}>
                  <span className={styles.mockupPill}>Curated Bundle Mockup</span>
                  <span className={styles.freeMockupTag}>
                    <Clock size={11} /> 6hr Digital Proof
                  </span>
                </div>

                <div className={styles.mockupImageWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={selectedCombo.id}
                    src={selectedCombo.image}
                    alt={selectedCombo.title}
                    className={styles.mockupImage}
                  />
                  <div className={styles.bundleOverlayBadge}>
                    <span>Complete {selectedCombo.itemsCount}-Piece Kit</span>
                  </div>
                </div>

                <div className={styles.mockupFooter}>
                  <div className={styles.mockupPerk}>
                    <Check size={12} strokeWidth={3} />
                    <span>Individual Bagging</span>
                  </div>
                  <div className={styles.mockupPerk}>
                    <Check size={12} strokeWidth={3} />
                    <span>Custom Brand Tag</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className={styles.cardDivider} />

          {/* Configuration Area: Size Selection + Quantity Stepper & Slider */}
          <div className={styles.configGrid}>
            
            {/* Size Breakdown Selector */}
            <div className={styles.configGroup}>
              <div className={styles.configLabelRow}>
                <label className={styles.configLabel}>Apparel Size Mix</label>
                <span className={styles.configHint}>Standard or custom ratio</span>
              </div>
              <div className={styles.sizePillsRow} role="radiogroup" aria-label="Select size allocation">
                {SIZES.map((size) => {
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

            {/* Quantity Slider and Stepper */}
            <div className={styles.configGroup}>
              <div className={styles.configLabelRow}>
                <label htmlFor="combo-quantity-input" className={styles.configLabel}>Order Quantity (Sets)</label>
                <span className={styles.quantityDisplayBadge}>
                  <strong>{quantity}</strong> Sets
                </span>
              </div>

              <div className={styles.sliderRow}>
                <button
                  type="button"
                  className={styles.stepBtn}
                  onClick={handleDecrease}
                  disabled={quantity <= 25}
                  aria-label="Decrease quantity by 5"
                >
                  <Minus size={15} strokeWidth={2.5} />
                </button>

                <input
                  id="combo-quantity-input"
                  type="range"
                  min="25"
                  max="500"
                  step="5"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className={styles.rangeSlider}
                  style={{
                    background: `linear-gradient(to right, #8C5B45 ${sliderPercentage}%, #EADBCE ${sliderPercentage}%)`,
                  }}
                  aria-label="Order Quantity Slider"
                />

                <button
                  type="button"
                  className={styles.stepBtn}
                  onClick={handleIncrease}
                  disabled={quantity >= 500}
                  aria-label="Increase quantity by 5"
                >
                  <Plus size={15} strokeWidth={2.5} />
                </button>
              </div>

              <div className={styles.sliderScale}>
                <span>25 Sets</span>
                <span>100 Sets (16% Off)</span>
                <span>250 Sets (24% Off)</span>
                <span>500+ Sets (30% Off)</span>
              </div>
            </div>

          </div>

          <div className={styles.cardDivider} />

          {/* Pricing & CTA Summary Footer */}
          <div className={styles.summaryFooter}>
            
            <div className={styles.priceContainer}>
              <span className={styles.priceHeading}>Estimated Total Investment</span>
              <div className={styles.priceRow}>
                <span className={styles.totalPrice}>
                  ₹{estimatedTotal.toLocaleString('en-IN')}
                </span>
                <span className={styles.perSetBadge}>
                  ₹{pricePerSet} per combo kit
                </span>
                {discountPercent > 0 && (
                  <span className={styles.savingsTag}>
                    Save ₹{totalSavings.toLocaleString('en-IN')} ({discountPercent}% Off)
                  </span>
                )}
              </div>
              <span className={styles.taxNote}>
                All inclusive of basic printing, GST & individual kit packaging.
              </span>
            </div>

            <div className={styles.ctaActions}>
              <a
                href={getWaUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.primaryOrderBtn}
              >
                <MessageSquare size={17} />
                <span>Lock In Combo Quote</span>
                <ArrowRight size={16} />
              </a>

              <Link href="/products" className={styles.secondaryBtn}>
                <span>View Individual Catalog</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default CombosSection;

