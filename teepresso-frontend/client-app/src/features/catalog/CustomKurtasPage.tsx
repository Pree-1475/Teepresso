import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import { KURTA_STYLES, CUSTOMIZATION_EXAMPLES, KURTA_GALLERY } from '@/features/catalog/data/kurtaData';
import styles from './custom-kurtas.module.css';

export function CustomKurtasPage() {
  const [quantity, setQuantity] = useState<number>(50);

  // Per piece price calculation logic based on volume
  const getEstimatedUnitPrice = (qty: number) => {
    if (qty >= 150) return 399;
    if (qty >= 75) return 449;
    if (qty >= 30) return 499;
    return 549;
  };

  const estimatedUnitPrice = getEstimatedUnitPrice(quantity);
  const estimatedTotal = estimatedUnitPrice * quantity;

  return (
    <div className={styles.pageContainer}>
      
      {/* 1. Hero Section */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <div>
              <span className={styles.heroTag}>✨ Festive & Group Custom Wear</span>
              <h1 className={styles.heroTitle}>Your Crew. Your Kurta.</h1>
              <p className={styles.heroDescription}>
                Unify your colony, college group, fest team, or community committee with premium custom-printed kurtas. Crafted with breathable slub cotton, custom emblems, and express group delivery.
              </p>

              <div className={styles.heroActions}>
                <Link href="/bulk-orders?product=custom-kurta-seasonal">
                  <Button variant="secondary" size="lg" rightIcon={<ArrowRight size={18} />}>
                    Customize Your Kurtas
                  </Button>
                </Link>
                <a href="#estimator" className="btn-outline-white" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '9999px', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', textDecoration: 'none', fontWeight: 500 }}>
                  Estimate Group Price
                </a>
              </div>
            </div>

            <div className={styles.heroImgWrapper}>
              <Image
                src="/images/kurtas/hero.png"
                alt="Group wearing custom kurtas"
                width={600}
                height={400}
                className={styles.heroImg}
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        
        {/* 2. Kurta Styles Section */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubtitle}>CURATED FITS & FABRICS</span>
          <h2 className={styles.sectionTitle}>Available Kurta Styles</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Choose from tailored traditional silhouttes to modern short cuts engineered for group comfort.
          </p>
        </div>

        <div className={styles.stylesGrid}>
          {KURTA_STYLES.map(style => (
            <div key={style.id} className={styles.styleCard}>
              <Image
                src={style.image}
                alt={style.name}
                width={300}
                height={200}
                className={styles.styleImg}
                unoptimized
              />
              <h3 className={styles.styleName}>{style.name}</h3>
              <span className={styles.styleFabric}>{style.fabric} • {style.fit}</span>
              <p className={styles.styleDesc}>{style.description}</p>
              
              <div className={styles.stylePrice}>
                <span>From ₹{style.pricePerPiece} / pc</span>
                <Link href={`/bulk-orders?product=${style.id}`}>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
                    Select
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 3. Customization Examples Section */}
      <section className={styles.customizationSection}>
        <div className="container">
          <div className={styles.sectionHeader} style={{ marginTop: 0 }}>
            <span className={styles.sectionSubtitle}>PRINTING & BRANDING OPTIONS</span>
            <h2 className={styles.sectionTitle}>What You Can Customize</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              From subtle crests to high-impact back artwork, we print with long-lasting vibrant inks.
            </p>
          </div>

          <div className={styles.customGrid}>
            {CUSTOMIZATION_EXAMPLES.map(ex => (
              <div key={ex.id} className={styles.customCard}>
                <span className={styles.customPlacementBadge}>{ex.placement}</span>
                <h3 className={styles.customTitle}>{ex.title}</h3>
                <p className={styles.customDesc}>{ex.description}</p>
                <div className={styles.idealForTag}>⚡ Ideal for: {ex.idealFor}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        
        {/* 4. Simple Customization Explanation */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubtitle}>HOW IT WORKS</span>
          <h2 className={styles.sectionTitle}>3 Simple Steps to Custom Kurtas</h2>
        </div>

        <div className={styles.stepsContainer}>
          <div className={styles.stepBox}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Pick Style & Color</h3>
            <p className={styles.stepDesc}>Select your preferred kurta fit (Short, Long, Pathani) and choose matching group colors.</p>
          </div>

          <div className={styles.stepBox}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>Upload Logo or Artwork</h3>
            <p className={styles.stepDesc}>Add your group crest, colony emblem, or back text. Need design help? Our team builds it free!</p>
          </div>

          <div className={styles.stepBox}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>Receive Group Delivery</h3>
            <p className={styles.stepDesc}>Order in bulk with sorted size packs delivered right to your committee doorstep in 4-5 days.</p>
          </div>
        </div>

        {/* 5. Quantity / Pricing Estimator Section */}
        <div id="estimator" className={styles.estimatorCard}>
          <h2 className={styles.estimatorTitle}>Group Order Price Estimator</h2>
          <p className={styles.estimatorSubtitle}>Drag the slider to see how volume discounts reduce per-piece pricing for your crew.</p>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <span>Order Quantity:</span>
              <span style={{ fontSize: 'var(--text-xl)', color: 'var(--color-primary-700)', fontWeight: 700 }}>
                {quantity} Pieces
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={300}
              step={5}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className={styles.sliderInput}
            />
          </div>

          <div className={styles.estimateOutput}>
            <div>
              <div className={styles.unitPrice}>₹{estimatedUnitPrice} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--color-text-secondary)' }}>/ piece</span></div>
              <div className={styles.totalPrice}>Estimated Total: ₹{estimatedTotal.toLocaleString('en-IN')} (Incl. Printing)</div>
            </div>

            <Link href={`/bulk-orders?product=custom-kurta-seasonal`}>
              <Button variant="primary" size="md" rightIcon={<ArrowRight size={16} />}>
                Lock In This Rate
              </Button>
            </Link>
          </div>
        </div>

        {/* 6. Group Kurta Gallery */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubtitle}>REAL CREWS & CELEBRATIONS</span>
          <h2 className={styles.sectionTitle}>Groups Wearing Teepresso Kurtas</h2>
        </div>

        <div className={styles.galleryGrid}>
          {KURTA_GALLERY.map((item, index) => (
            <div key={index} className={styles.galleryCard}>
              <Image
                src={item.image}
                alt={item.title}
                width={400}
                height={220}
                className={styles.galleryImg}
                unoptimized
              />
              <div className={styles.galleryContent}>
                <h3 className={styles.galleryTitle}>{item.title}</h3>
                <div className={styles.galleryMeta}>
                  <span>{item.groupType}</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary-700)' }}>{item.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 7. Final CTA Section */}
        <div className={styles.finalCtaSection}>
          <h2 className={styles.finalCtaTitle}>Ready to Outfit Your Crew?</h2>
          <p className={styles.finalCtaDesc}>
            Join hundreds of college groups, housing colonies, and event teams who trust Teepresso for festive and group custom apparel.
          </p>
          <Link href="/bulk-orders?product=custom-kurta-seasonal">
            <Button variant="secondary" size="lg" rightIcon={<ArrowRight size={18} />}>
              Customize Your Kurtas Now
            </Button>
          </Link>
        </div>

      </div>

    </div>
  );
}

export default CustomKurtasPage;
