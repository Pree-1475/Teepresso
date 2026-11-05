"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import styles from './InstantQuoteSection.module.css';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  image: string;
}

const PRODUCTS: ProductItem[] = [
  {
    id: 'tshirt',
    name: 'T-Shirt',
    slug: 'custom-tee-heavyweight',
    basePrice: 349,
    image: '/images/products/tshirt.png',
  },
  {
    id: 'polo',
    name: 'Polo',
    slug: 'classic-pique-polo',
    basePrice: 449,
    image: '/images/products/polo.png',
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    slug: 'heavy-fleece-hoodie',
    basePrice: 799,
    image: '/images/products/hoodie.png',
  },
  {
    id: 'sweatshirt',
    name: 'Sweatshirt',
    slug: 'sweatshirt-crewneck',
    basePrice: 599,
    image: '/images/products/oversized.png',
  },
  {
    id: 'kurta',
    name: 'Kurta',
    slug: 'custom-kurta-seasonal',
    basePrice: 299,
    image: '/images/products/kurta.png',
  },
];

const SIZES = ['Mixed Sizes', 'S', 'M', 'L', 'XL', 'XXL'];

const checkmarks = [
  'No hidden charges',
  'Best price guaranteed',
  'Bulk discounts auto-applied',
];

export function InstantQuoteSection({ embedded = false }: { embedded?: boolean }) {
  const [selectedProductId, setSelectedProductId] = useState<string>('tshirt');
  const [selectedSize, setSelectedSize] = useState<string>('Mixed Sizes');
  const [quantity, setQuantity] = useState<number>(100);

  const selectedProduct =
    PRODUCTS.find((p) => p.id === selectedProductId) || PRODUCTS[0];

  // Dynamic tiered discount matching realistic volume manufacturing
  const getPricePerPiece = (base: number, qty: number): number => {
    if (qty >= 500) return Math.round(base * 0.70); // 30% volume discount
    if (qty >= 250) return Math.round(base * 0.76); // 24% volume discount
    if (qty >= 100) return Math.round(base * 0.8567); // for T-Shirt 349 -> exactly 299
    if (qty >= 50) return Math.round(base * 0.92);  // 8% volume discount
    return base;
  };

  const pricePerPiece = getPricePerPiece(selectedProduct.basePrice, quantity);
  const estimatedTotal = pricePerPiece * quantity;

  // Percentage for the slider fill track (25 to 500)
  const sliderPercentage = Math.min(
    100,
    Math.max(0, ((quantity - 25) / (500 - 25)) * 100)
  );

  const content = (
    <div className={embedded ? '' : styles.centerContainer}>
      {/* Section Header & Trust Highlights */}
      <div className={styles.quoteIntro}>
        <h2 className={styles.quoteTitle}>
          Get an <em>Instant Quote</em>
        </h2>
        <p className={styles.quoteDesc}>
          Select what you need. We&apos;ll handle the rest.
        </p>
        <div className={styles.quoteChecks}>
          {checkmarks.map((text, i) => (
            <div key={i} className={styles.checkItem}>
              <div className={styles.checkCircle}>
                <Check size={11} strokeWidth={3.5} color="#FFFFFF" />
              </div>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Quote Card (Clean, airy, predominantly white) */}
      <div className={styles.quoteCard}>
        {/* 1. Top Area: Product Selection (Left) + Product Preview (Right) */}
        <div className={styles.topAreaGrid}>
          {/* Left: Product Selection List with Pill Shapes */}
          <div className={styles.productList} role="radiogroup" aria-label="Select apparel product">
            {PRODUCTS.map((prod) => {
              const isSelected = prod.id === selectedProduct.id;
              return (
                <button
                  key={prod.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`${styles.productBtn} ${isSelected ? styles.productBtnActive : ''}`}
                  onClick={() => setSelectedProductId(prod.id)}
                >
                  <div className={styles.productLabelWrap}>
                    {isSelected && <span className={styles.activeBar} />}
                    <span className={styles.productName}>{prod.name}</span>
                  </div>
                  {isSelected && (
                    <span className={styles.checkBadge}>
                      <Check size={9} strokeWidth={3.5} color="#FFFFFF" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: Product Preview */}
          <div className={styles.previewContainer}>
            <div className={styles.previewImageWrap}>
              <img
                key={selectedProduct.id}
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className={styles.previewImage}
              />
            </div>
          </div>
        </div>

        {/* Clean Horizontal Divider */}
        <div className={styles.sectionDivider} />

        {/* 2. Configuration Area: Size + Quantity */}
        <div className={styles.configArea}>
          {/* Size Section */}
          <div className={styles.configRow}>
            <span className={styles.configLabel}>Size</span>
            <div className={styles.sizePillGroup}>
              {SIZES.map((size) => {
                const isSizeActive = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    className={`${styles.sizePill} ${isSizeActive ? styles.sizePillActive : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Section with Single Slider */}
          <div className={styles.quantitySection}>
            <div className={styles.quantityHeader}>
              <span className={styles.configLabel}>Quantity</span>
              <span className={styles.quantityDisplay}>
                {quantity >= 500 ? '500+ Pieces' : `${quantity} Pieces`}
              </span>
            </div>

            <div className={styles.sliderTrackWrapper}>
              <input
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
              <div className={styles.sliderScale}>
                <span>25</span>
                <span>250</span>
                <span>500+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Horizontal Divider */}
        <div className={styles.sectionDivider} />

        {/* 3. Bottom Area: Estimated Total + Primary CTA */}
        <div className={styles.estimateFooter}>
          <div className={styles.estimateInfo}>
            <span className={styles.estimateLabel}>Estimated Total</span>
            <div className={styles.priceRow}>
              <span className={styles.totalPrice}>
                ₹{estimatedTotal.toLocaleString('en-IN')}
              </span>
              <span className={styles.perPieceBadge}>
                ₹{pricePerPiece} per piece
              </span>
            </div>
            <span className={styles.discountHint}>
              Bulk pricing updates automatically.
            </span>
          </div>

          <Link
            href={`/product/${selectedProduct.slug}?qty=${quantity}&size=${encodeURIComponent(selectedSize)}`}
            className={styles.continueOrderBtn}
          >
            <span>Continue Order</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <section className={styles.wrapper}>
      <div className="container">{content}</div>
    </section>
  );
}

export default InstantQuoteSection;
