import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Search } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import { PRODUCTS_CATALOG } from '@/features/catalog/data/productsData';
import { KURTA_GALLERY } from '@/features/catalog/data/kurtaData';
import styles from './custom-kurtas.module.css';

export function CustomKurtasPage() {
  const [activeKurta, setActiveKurta] = useState<'custom-kurta-seasonal' | 'kurta-patterned' | null>(null);

  const plainKurta = PRODUCTS_CATALOG.find(p => p.id === 'custom-kurta-seasonal')!;
  const patternedKurta = PRODUCTS_CATALOG.find(p => p.id === 'kurta-patterned')!;
  
  const khanduva = PRODUCTS_CATALOG.find(p => p.id === 'festive-khanduva')!;
  const zariKhanduva = PRODUCTS_CATALOG.find(p => p.id === 'festive-zari-khanduva')!;
  const pancha = PRODUCTS_CATALOG.find(p => p.id === 'festive-pancha')!;
  const pagdi = PRODUCTS_CATALOG.find(p => p.id === 'festive-pagdi')!;

  const renderKurtaModal = () => {
    if (!activeKurta) return null;
    const product = activeKurta === 'custom-kurta-seasonal' ? plainKurta : patternedKurta;
    
    return (
      <div className={styles.modalOverlay} onClick={() => setActiveKurta(null)}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <button className={styles.closeBtn} onClick={() => setActiveKurta(null)}>✕</button>
          
          <div className={styles.modalGrid}>
            <div className={styles.modalImageWrapper}>
              <img src={product.image} alt={product.name} className={styles.modalImage} />
            </div>
            
            <div className={styles.modalInfo}>
              <span className={styles.modalCategory}>{product.category}</span>
              <h3 className={styles.modalTitle}>{product.name}</h3>
              <p className={styles.modalPrice}>{product.priceRange}</p>
              
              <p className={styles.modalDesc}>{product.shortDesc}</p>
              
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Available Sizes</h4>
                <div className={styles.sizeTags}>
                  {['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL'].map(size => (
                    <span key={size} className={styles.sizeTag}>{size}</span>
                  ))}
                </div>
              </div>
              
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Available {product.id === 'custom-kurta-seasonal' ? 'Colors' : 'Designs'}</h4>
                <div className={styles.colorTags}>
                  {product.colors.map((color, i) => (
                    <span key={i} className={styles.colorTag}>
                      {color.startsWith('#') ? (
                        <span className={styles.colorSwatch} style={{ backgroundColor: color }} />
                      ) : null}
                      {color.startsWith('#') ? '' : color}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <Link href={`/bulk-orders?product=${product.id}`}>
                  <Button variant="primary" size="lg" className={styles.fullWidthBtn}>
                    Start Order <ArrowRight size={18} />
                  </Button>
                </Link>
                <p className={styles.modalHelpText}>You'll be able to select precise sizes and colors in the next step.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      {renderKurtaModal()}
      
      {/* SECTION 1: HERO */}
      <section className={styles.heroSection}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              YOUR GROUP.<br/>
              YOUR IDENTITY.<br/>
              <span className={styles.heroTitleAccent}>YOUR KURTAS.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Custom printed kurtas and festive apparel for communities, associations, colleges and events.
            </p>
            <div className={styles.heroActions}>
              <Link href="/bulk-orders?product=custom-kurta-seasonal">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                  START YOUR KURTA ORDER
                </Button>
              </Link>
              <a href="#collection" className={styles.secondaryLink}>
                EXPLORE COLLECTION
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: QUICK INTRO */}
      <section className={styles.introSection}>
        <div className="container">
          <h2 className={styles.introHeading}>Made for your whole group.</h2>
          <p className={styles.introText}>
            Choose your styles, colours and quantities. Add your artwork and we'll take care of the rest.
          </p>
        </div>
      </section>

      {/* SECTION 3: FESTIVE COLLECTION */}
      <section id="collection" className={styles.collectionSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>THE FESTIVE COLLECTION</h2>
            <p className={styles.sectionDesc}>Choose what your group needs.</p>
          </div>

          <div className={styles.collectionGrid}>
            <div className={styles.collectionCard} onClick={() => window.location.href='#kurtas'}>
              <img src="/images/kurtas/hero.png" alt="Kurtas" />
              <h3>1. KURTAS</h3>
            </div>
            <div className={styles.collectionCard} onClick={() => window.location.href='#khanduva'}>
              <img src="/images/products/tshirt.png" alt="Khanduva" />
              <h3>2. KHANDUVA</h3>
            </div>
            <div className={styles.collectionCard} onClick={() => window.location.href='#pancha'}>
              <img src="/images/products/tshirt.png" alt="Pancha" />
              <h3>3. PANCHA</h3>
            </div>
            <div className={styles.collectionCard} onClick={() => window.location.href='#pagdi'}>
              <img src="/images/products/hoodie.png" alt="Pagdi" />
              <h3>4. PAGDI</h3>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 & 5: KURTAS */}
      <section id="kurtas" className={styles.productSection}>
        <div className="container">
          <div className={styles.productHeader}>
            <h2 className={styles.productTitle}>KURTAS</h2>
            <p className={styles.productDesc}>Choose your style.</p>
          </div>

          <div className={styles.kurtaGrid}>
            {/* Plain Kurta */}
            <div className={styles.kurtaCard} onClick={() => setActiveKurta('custom-kurta-seasonal')}>
              <div className={styles.kurtaImageWrapper}>
                <img src={plainKurta.image} alt={plainKurta.name} />
                <div className={styles.quickViewOverlay}>
                  <Search size={24} /> <span>Quick View</span>
                </div>
              </div>
              <div className={styles.kurtaInfo}>
                <h3 className={styles.kurtaName}>PLAIN KURTAS</h3>
                <p className={styles.kurtaPrice}>{plainKurta.priceRange}</p>
                <div className={styles.colorDots}>
                  {plainKurta.colors.slice(0, 5).map((color, i) => (
                    <span key={i} className={styles.colorDot} style={{ backgroundColor: color }} />
                  ))}
                  {plainKurta.colors.length > 5 && <span className={styles.colorDotMore}>+</span>}
                </div>
              </div>
            </div>

            {/* Patterned Kurta */}
            <div className={styles.kurtaCard} onClick={() => setActiveKurta('kurta-patterned')}>
              <div className={styles.kurtaImageWrapper}>
                <img src={patternedKurta.image} alt={patternedKurta.name} />
                <div className={styles.quickViewOverlay}>
                  <Search size={24} /> <span>Quick View</span>
                </div>
              </div>
              <div className={styles.kurtaInfo}>
                <h3 className={styles.kurtaName}>PATTERNED / DESIGNED KURTAS</h3>
                <p className={styles.kurtaPrice}>{patternedKurta.priceRange}</p>
                <div className={styles.designTags}>
                  <span className={styles.designTag}>Pattern 01</span>
                  <span className={styles.designTag}>Pattern 02</span>
                  <span className={styles.designTag}>Pattern 03</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: KHANDUVA */}
      <section id="khanduva" className={`${styles.productSection} ${styles.altBg}`}>
        <div className="container">
          <div className={styles.rowLayout}>
            <div className={styles.rowText}>
              <h2 className={styles.productTitle}>KHANDUVA</h2>
              <p className={styles.productDesc}>Traditional shoulder drapes for respect and identity. Can be customized with your group's logo if enabled.</p>
              
              <div className={styles.variantList}>
                <div className={styles.variantItem}>
                  <span className={styles.variantName}>Standard Khanduva</span>
                  <span className={styles.variantPrice}>{khanduva.priceRange}</span>
                </div>
                <div className={styles.variantItem}>
                  <span className={styles.variantName}>Zari Khanduva</span>
                  <span className={styles.variantPrice}>{zariKhanduva.priceRange}</span>
                </div>
              </div>
              
              <Link href={`/bulk-orders?product=${khanduva.id}`}>
                <Button variant="primary" rightIcon={<ArrowRight size={18} />}>ADD TO YOUR ORDER</Button>
              </Link>
            </div>
            <div className={styles.rowImages}>
              <img src={khanduva.image} alt="Khanduva" className={styles.mainImage} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: PANCHA */}
      <section id="pancha" className={styles.productSection}>
        <div className="container">
          <div className={styles.rowLayoutReverse}>
            <div className={styles.rowText}>
              <h2 className={styles.productTitle}>PANCHA</h2>
              <p className={styles.productDesc}>Classic festive bottoms. High-quality fabric perfect for cultural rallies and religious events.</p>
              
              <div className={styles.variantList}>
                <div className={styles.variantItem}>
                  <span className={styles.variantName}>Pancha</span>
                  <span className={styles.variantPrice}>{pancha.priceRange}</span>
                </div>
              </div>
              
              <Link href={`/bulk-orders?product=${pancha.id}`}>
                <Button variant="primary" rightIcon={<ArrowRight size={18} />}>ADD TO YOUR ORDER</Button>
              </Link>
            </div>
            <div className={styles.rowImages}>
              <img src={pancha.image} alt="Pancha" className={styles.mainImage} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: PAGDI */}
      <section id="pagdi" className={`${styles.productSection} ${styles.altBg}`}>
        <div className="container">
          <div className={styles.rowLayout}>
            <div className={styles.rowText}>
              <h2 className={styles.productTitle}>PAGDI</h2>
              <p className={styles.productDesc}>Complete your group's traditional look with matching headwear.</p>
              
              <div className={styles.variantList}>
                <div className={styles.variantItem}>
                  <span className={styles.variantName}>Pagdi</span>
                  <span className={styles.variantPrice}>{pagdi.priceRange}</span>
                </div>
              </div>
              
              <Link href={`/bulk-orders?product=${pagdi.id}`}>
                <Button variant="primary" rightIcon={<ArrowRight size={18} />}>ADD TO YOUR ORDER</Button>
              </Link>
            </div>
            <div className={styles.rowImages}>
              <img src={pagdi.image} alt="Pagdi" className={styles.mainImage} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: BUILD YOUR ORDER */}
      <section className={styles.buildOrderSection}>
        <div className="container">
          <div className={styles.buildOrderBox}>
            <h2 className={styles.buildOrderTitle}>BUILD YOUR ORDER</h2>
            <p className={styles.buildOrderDesc}>Choose what you need for your group.</p>
            
            <div className={styles.orderExample}>
              <span>100 Plain Kurtas</span>
              <span className={styles.plus}>+</span>
              <span>100 Pagdis</span>
              <span className={styles.plus}>+</span>
              <span>100 Khanduvas</span>
            </div>
            
            <p className={styles.orderNote}>Combine multiple products in a single order.</p>
            
            <Link href="/bulk-orders?product=custom-kurta-seasonal">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={20} />} className={styles.buildOrderBtn}>
                START YOUR ORDER
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 10: HOW CUSTOMIZATION WORKS */}
      <section className={styles.howItWorksSection}>
        <div className="container">
          <h2 className={styles.sectionTitleCenter}>HOW CUSTOMIZATION WORKS</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepItem}>
              <span className={styles.stepNum}>01</span>
              <p>Choose your style</p>
            </div>
            <div className={styles.stepItem}>
              <span className={styles.stepNum}>02</span>
              <p>Tell us what you want printed</p>
            </div>
            <div className={styles.stepItem}>
              <span className={styles.stepNum}>03</span>
              <p>Review your mockup</p>
            </div>
            <div className={styles.stepItem}>
              <span className={styles.stepNum}>04</span>
              <p>Approve</p>
            </div>
            <div className={styles.stepItem}>
              <span className={styles.stepNum}>05</span>
              <p>We print and deliver</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 11: GROUP EXAMPLES */}
      <section className={`${styles.gallerySection} ${styles.altBg}`}>
        <div className="container">
          <h2 className={styles.sectionTitleCenter}>These are made for groups like yours.</h2>
          <div className={styles.galleryGrid}>
            {KURTA_GALLERY.map((item, idx) => (
              <div key={idx} className={styles.galleryCard}>
                <img src={item.image} alt={item.title} />
                <div className={styles.galleryInfo}>
                  <h4>{item.title}</h4>
                  <span>{item.groupType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 12: FINAL CTA */}
      <section className={styles.finalCtaSection}>
        <div className="container">
          <h2 className={styles.finalTitle}>READY TO MAKE YOUR GROUP'S KURTAS?</h2>
          <p className={styles.finalDesc}>Start with your styles and quantities. We'll take it from there.</p>
          
          <Link href="/bulk-orders?product=custom-kurta-seasonal">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight size={20} />}>
              START YOUR KURTA ORDER
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}

export default CustomKurtasPage;
