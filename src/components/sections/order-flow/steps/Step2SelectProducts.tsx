'use client';

import React from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { Button } from '@/components/ui/Button/Button';
import { Check, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import styles from './Step.module.css';

const PRODUCT_TYPES = [
  { id: 'tshirt-roundneck', name: 'Classic Round Neck', category: 'T-Shirts', price: 199, image: '/images/products/tshirt.png' },
  { id: 'tshirt-oversized', name: 'Heavyweight Oversized', category: 'Oversized', price: 349, image: '/images/products/oversized.png' },
  { id: 'polo-corporate', name: 'Executive Polo', category: 'Polos', price: 399, image: '/images/products/polo.png' },
  { id: 'hoodie-heavyweight', name: 'Fleece Hoodie', category: 'Hoodies', price: 699, image: '/images/products/hoodie.png' },
  { id: 'custom-kurta-seasonal', name: 'Custom Group Kurta', category: 'Kurtas', price: 499, image: '/images/kurtas/hero.png' },
];

const FABRIC_QUALITIES = [
  { name: '180 GSM Super Combed Cotton', desc: 'Lightweight & ultra soft, ideal for events & daily wear.' },
  { name: '220 GSM Premium Honeycomb Pique', desc: 'Durable structured fit for polos & corporate wear.' },
  { name: '240 GSM Heavyweight French Terry', desc: 'Thick streetwear drape for oversized tees.' },
];

const COLOR_OPTIONS = [
  { name: 'Warm Brown', hex: '#8c5b45' },
  { name: 'Cream Beige', hex: '#d2c4b4' },
  { name: 'Charcoal Black', hex: '#1f1d1c' },
  { name: 'Classic White', hex: '#ffffff' },
  { name: 'Deep Teal', hex: '#0D9488' },
  { name: 'Terracotta Red', hex: '#c0392b' },
];

export function Step2SelectProducts() {
  const { state, updateProduct, nextStep, prevStep } = useOrderFlow();
  const { product } = state;

  return (
    <div className={styles.stepContainer}>
      <span className={styles.stepBadge}>STEP 2 OF 8 • PRODUCT & COLOR</span>
      <h2 className={styles.title}>Choose Garment & Style</h2>
      <p className={styles.description}>Select the base apparel type, fabric weight, and primary color for your group order.</p>

      {/* Product Type Picker */}
      <h3 className={styles.subTitle}>1. Select Apparel Type</h3>
      <div className={styles.visualGrid}>
        {PRODUCT_TYPES.map(item => {
          const isSelected = product.id === item.id;
          return (
            <div
              key={item.id}
              className={`${styles.visualCard} ${isSelected ? styles.visualCardSelected : ''}`}
              onClick={() => updateProduct({ id: item.id, name: item.name, category: item.category, pricePerUnit: item.price })}
            >
              <img src={item.image} alt={item.name} className={styles.visualCardImg} />
              <div className={styles.visualCardBody}>
                <div className={styles.visualCardTitle}>{item.name}</div>
                <div className={styles.visualCardPrice}>From ₹{item.price} / pc</div>
              </div>
              {isSelected && <span className={styles.selectedCheck}><Check size={14} color="#fff" /></span>}
            </div>
          );
        })}
      </div>

      {/* Fabric Quality Picker */}
      <h3 className={styles.subTitle} style={{ marginTop: 'var(--spacing-6)' }}>2. Fabric Quality</h3>
      <div className={styles.qualityList}>
        {FABRIC_QUALITIES.map(q => {
          const isSelected = product.quality === q.name;
          return (
            <div
              key={q.name}
              className={`${styles.qualityOption} ${isSelected ? styles.qualityOptionSelected : ''}`}
              onClick={() => updateProduct({ quality: q.name })}
            >
              <div className={styles.qualityRadio}>{isSelected && <span className={styles.radioDot} />}</div>
              <div>
                <div className={styles.qualityTitle}>{q.name}</div>
                <div className={styles.qualityDesc}>{q.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Color Swatch Picker */}
      <h3 className={styles.subTitle} style={{ marginTop: 'var(--spacing-6)' }}>3. Select Primary Color</h3>
      <div className={styles.colorSwatchRow}>
        {COLOR_OPTIONS.map(c => {
          const isSelected = product.color === c.name;
          return (
            <div
              key={c.name}
              className={`${styles.swatchItem} ${isSelected ? styles.swatchItemSelected : ''}`}
              onClick={() => updateProduct({ color: c.name, colorHex: c.hex })}
            >
              <span className={styles.swatchCircle} style={{ backgroundColor: c.hex }} />
              <span className={styles.swatchLabel}>{c.name}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <Button variant="outline" onClick={prevStep} leftIcon={<ArrowLeft size={16} />}>Back</Button>
        <Button variant="primary" size="lg" onClick={nextStep} rightIcon={<ArrowRight size={18} />}>
          Set Sizes & Quantities
        </Button>
      </div>
    </div>
  );
}
