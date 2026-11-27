import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Ruler, Sparkles, Shirt } from 'lucide-react';
import styles from './ExtendedSizesSection.module.css';

interface SizeSpec {
  code: '4XL' | '5XL';
  chest: string;
  length: string;
  shoulder: string;
  fitNote: string;
  badge: string;
}

const EXTENDED_SIZE_SPECS: Record<'4XL' | '5XL', SizeSpec> = {
  '4XL': {
    code: '4XL',
    chest: '50"',
    length: '31.5"',
    shoulder: '22.5"',
    fitNote: 'Tailored relaxed drape with structured shoulder seam',
    badge: 'Rare Studio Fit',
  },
  '5XL': {
    code: '5XL',
    chest: '52"–54"',
    length: '32.5"',
    shoulder: '23.5"',
    fitNote: 'Generous custom-cut silhouette — zero boxy pulling',
    badge: 'Ultra-Rare In Stock',
  },
};

const SPECTRUM_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const;

const PREVIEW_SWATCHES = [
  { name: 'Classic White', hex: '#FFFFFF', filter: 'none' },
  { name: 'Jet Black', hex: '#1F1D1C', filter: 'brightness(0.22) contrast(1.15)' },
  { name: 'Deep Navy', hex: '#1B2A4A', filter: 'sepia(1) saturate(4.2) hue-rotate(185deg) brightness(0.38)' },
  { name: 'Forest Green', hex: '#1A4D3E', filter: 'sepia(1) saturate(3.8) hue-rotate(100deg) brightness(0.42)' },
];

export function ExtendedSizesSection() {
  const navigate = useNavigate();
  const [activeSize, setActiveSize] = useState<'4XL' | '5XL'>('4XL');
  const [activeSwatchIdx, setActiveSwatchIdx] = useState<number>(0);

  const spec = EXTENDED_SIZE_SPECS[activeSize];
  const swatch = PREVIEW_SWATCHES[activeSwatchIdx];

  return (
    <section className={styles.section} aria-label="Rare 4XL and 5XL Extended Sizes">
      <div className="container">
        <div className={styles.wrapperCard}>
          {/* Decorative background grain/accent */}
          <div className={styles.bgGlow} aria-hidden="true" />

          <div className={styles.grid}>
            {/* Left Column: Editorial Story + Interactive Size Spectrum + Specs */}
            <div className={styles.contentCol}>
              <div className={styles.eyebrowPill}>
                <Sparkles size={13} />
                <span>RARE IN THE MARKET • ALWAYS IN STOCK</span>
              </div>

              <h2 className={styles.title}>
                True <span className={styles.highlight}>4XL &amp; 5XL</span>.<br />
                Zero Compromise.
              </h2>

              <p className={styles.subtitle}>
                Most print shops stop at XXL or force 100-piece minimums for plus sizes.
                We stock tailored 4XL and 5XL blanks in 240 GSM super-combed cotton —
                ready for single-piece custom prints or full group orders.
              </p>

              {/* Size Spectrum Bar showing industry cutoff vs Teepresso */}
              <div className={styles.spectrumBlock}>
                <div className={styles.spectrumLabels}>
                  <span className={styles.spectrumStd}>Standard Market Limit (S–XXL)</span>
                  <span className={styles.spectrumRare}>Teepresso Extended Fit</span>
                </div>
                <div className={styles.spectrumRow}>
                  {SPECTRUM_SIZES.map((sz) => {
                    const isExtended = sz === '4XL' || sz === '5XL';
                    const isSelected = sz === activeSize;
                    if (isExtended) {
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setActiveSize(sz)}
                          className={`${styles.sizeChip} ${styles.sizeChipExtended} ${isSelected ? styles.sizeChipActive : ''}`}
                          aria-pressed={isSelected}
                        >
                          {sz}
                        </button>
                      );
                    }
                    return (
                      <span key={sz} className={styles.sizeChip}>
                        {sz}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Measurement Card for 4XL / 5XL */}
              <div className={styles.specCard}>
                <div className={styles.specHeader}>
                  <div className={styles.specTitleGroup}>
                    <Ruler size={15} className={styles.specIcon} />
                    <span className={styles.specTitle}>{spec.code} Studio Measurements</span>
                  </div>
                  <span className={styles.specBadge}>{spec.badge}</span>
                </div>

                <div className={styles.specMetricsGrid}>
                  <div className={styles.metricBox}>
                    <span className={styles.metricVal}>{spec.chest}</span>
                    <span className={styles.metricLabel}>Chest</span>
                  </div>
                  <div className={styles.metricDivider} />
                  <div className={styles.metricBox}>
                    <span className={styles.metricVal}>{spec.length}</span>
                    <span className={styles.metricLabel}>Length</span>
                  </div>
                  <div className={styles.metricDivider} />
                  <div className={styles.metricBox}>
                    <span className={styles.metricVal}>{spec.shoulder}</span>
                    <span className={styles.metricLabel}>Shoulder</span>
                  </div>
                </div>

                <p className={styles.specFitNote}>{spec.fitNote}</p>
              </div>

              {/* 3 Key Highlights */}
              <div className={styles.perksRow}>
                <div className={styles.perkItem}>
                  <Check size={14} className={styles.perkIcon} />
                  <span>Custom-graded pattern, never just stretched</span>
                </div>
                <div className={styles.perkItem}>
                  <Check size={14} className={styles.perkIcon} />
                  <span>No minimum quantity — order 1 or 500+</span>
                </div>
              </div>

              {/* CTA Actions */}
              <div className={styles.ctaRow}>
                <button
                  type="button"
                  className={styles.primaryCta}
                  onClick={() => navigate('/product/prod_tee_001')}
                >
                  <Shirt size={16} />
                  <span>Customize {activeSize} Tee Now</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  className={styles.secondaryCta}
                  onClick={() => navigate('/products')}
                >
                  Browse All Catalog
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Garment Visual Card */}
            <div className={styles.visualCol}>
              <div className={styles.studioShowcaseCard}>
                {/* Floating Size Watermark */}
                <div className={styles.sizeWatermark} aria-hidden="true">
                  {activeSize}
                </div>

                {/* Top Floating Tag */}
                <div className={styles.floatingSpecTag}>
                  <span className={styles.dotPulse} />
                  <span>{activeSize} • {spec.chest} Chest • 240 GSM</span>
                </div>

                {/* Garment Image */}
                <div className={styles.garmentStage}>
                  <img
                    src="/images/products/teepresso/white/tee-white-front.png"
                    alt={`${swatch.name} ${activeSize} custom t-shirt`}
                    className={styles.garmentImg}
                    style={{ filter: swatch.filter }}
                  />
                </div>

                {/* Bottom Color Preview Switcher */}
                <div className={styles.swatchBar}>
                  <span className={styles.swatchLabel}>Preview in {swatch.name}:</span>
                  <div className={styles.swatchDots}>
                    {PREVIEW_SWATCHES.map((sw, idx) => (
                      <button
                        key={sw.name}
                        type="button"
                        onClick={() => setActiveSwatchIdx(idx)}
                        className={`${styles.swatchDot} ${idx === activeSwatchIdx ? styles.swatchDotActive : ''}`}
                        style={{ backgroundColor: sw.hex }}
                        title={sw.name}
                        aria-label={`Preview ${sw.name}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExtendedSizesSection;
