'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRODUCTS_CATALOG, ProductItem } from '@/features/catalog/data/productsData';
import { useCart, SizeQtyMap, ColorVariant } from '@/features/cart/context/CartContext';
import styles from './ProductPage.module.css';
import { ShoppingBag, ArrowLeft, UploadCloud } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';

const defaultSizes: SizeQtyMap = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, '4XL': 0, '5XL': 0, '6XL': 0 };

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [activeColor, setActiveColor] = useState<string>('');
  
  // Config state
  const [sizes, setSizes] = useState<SizeQtyMap>({ ...defaultSizes });
  const [quantity, setQuantity] = useState<number>(0);
  
  // Design state
  const [designMode, setDesignMode] = useState<'none' | 'has_design' | 'need_help'>('none');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (id) {
      const p = PRODUCTS_CATALOG.find(x => x.id === id);
      if (p) {
        setProduct(p);
        if (p.colors && p.colors.length > 0) {
          setActiveColor(p.colors[0]);
        }
      }
    }
  }, [id]);

  if (!product) return <div>Loading...</div>;

  const handleAddToCart = () => {
    let totalQty = 0;
    if (product.requiresSizes) {
      totalQty = Object.values(sizes).reduce((sum, val) => sum + (val || 0), 0);
    } else {
      totalQty = quantity;
    }

    if (totalQty === 0) {
      alert('Please select a quantity greater than 0.');
      return;
    }

    const colorVariant: ColorVariant = {
      id: `var-${Date.now()}`,
      color: activeColor,
      colorHex: activeColor.startsWith('#') ? activeColor : '#000000',
      sizes: { ...sizes },
      quantity: product.requiresSizes ? 0 : quantity
    };

    addToCart({
      productId: product.id,
      name: product.name,
      category: product.category,
      pricePerUnit: product.startingPrice,
      requiresSizes: product.requiresSizes,
      requiresColors: product.requiresColors,
      requiresMockup: product.requiresMockup,
      applyVolumeDiscount: product.applyVolumeDiscount,
      colorVariants: [colorVariant],
      artwork: {
        file: null,
        previewUrl: '',
        mode: designMode,
        instructions,
        placements: {}
      }
    });
  };

  const calculateTotal = () => {
    let qty = 0;
    if (product.requiresSizes) {
      qty = Object.values(sizes).reduce((sum, val) => sum + (val || 0), 0);
    } else {
      qty = quantity;
    }

    let effectiveUnitPrice = product.startingPrice;
    if (product.applyVolumeDiscount) {
      if (qty >= 150) {
        effectiveUnitPrice = Math.round(product.startingPrice * 0.8);
      } else if (qty >= 75) {
        effectiveUnitPrice = Math.round(product.startingPrice * 0.9);
      }
    }

    return qty * effectiveUnitPrice;
  };

  const totalQty = product.requiresSizes 
    ? Object.values(sizes).reduce((sum, val) => sum + (val || 0), 0)
    : quantity;

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        
        <button className="btn-link" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        <div className={styles.productLayout}>
          {/* Left: Sticky Image */}
          <div className={styles.imageStickyContainer}>
            <img 
              src={product.image} 
              alt={product.name} 
              className={styles.mainImage}
            />
          </div>

          {/* Right: Configuration */}
          <div className={styles.configContainer}>
            
            <div className={styles.productHeader}>
              <h1>{product.name}</h1>
              <div className={styles.productPrice}>{product.priceRange}</div>
              <p className={styles.productDesc}>{product.shortDesc}</p>
            </div>

            {/* Colors */}
            {product.requiresColors && product.colors.length > 0 && (
              <div className={styles.configSection}>
                <h3 className={styles.sectionTitle}>1. Choose Color</h3>
                <div className={styles.colorGrid}>
                  {product.colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`${styles.colorSwatchBtn} ${activeColor === color ? styles.colorSwatchBtnActive : ''}`}
                      style={{ backgroundColor: color.startsWith('#') ? color : '#ccc' }}
                      title={color}
                      onClick={() => setActiveColor(color)}
                    >
                      {!color.startsWith('#') && <span style={{fontSize: '10px'}}>{color}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes / Quantity */}
            <div className={styles.configSection}>
              <h3 className={styles.sectionTitle}>{product.requiresColors ? '2. Choose Quantities' : '1. Choose Quantity'}</h3>
              
              {product.requiresSizes ? (
                <div className={styles.sizeGrid}>
                  {(['S', 'M', 'L', 'XL', 'XXL'] as (keyof SizeQtyMap)[]).map(sz => (
                    <div key={sz} className={styles.sizeCell}>
                      <span className={styles.sizeLabel}>{sz}</span>
                      <div className={styles.stepperWrapper}>
                        <button className={styles.stepperBtn} onClick={() => setSizes(prev => ({...prev, [sz]: Math.max(0, prev[sz] - 1)}))}>-</button>
                        <input 
                          type="number" 
                          className={styles.stepperInput} 
                          value={sizes[sz] || ''}
                          onChange={e => setSizes(prev => ({...prev, [sz]: parseInt(e.target.value) || 0}))}
                          placeholder="0"
                        />
                        <button className={styles.stepperBtn} onClick={() => setSizes(prev => ({...prev, [sz]: prev[sz] + 1}))}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className={styles.stepperWrapper} style={{ width: '150px' }}>
                    <button className={styles.stepperBtn} onClick={() => setQuantity(Math.max(0, quantity - 1))}>-</button>
                    <input 
                      type="number" 
                      className={styles.stepperInput} 
                      value={quantity || ''}
                      onChange={e => setQuantity(parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <button className={styles.stepperBtn} onClick={() => setQuantity(quantity + 1)}>+</button>
                  </div>
                  <span style={{ fontWeight: 600, color: '#666' }}>Pieces</span>
                </div>
              )}
            </div>

            {/* Design / Mockup */}
            {product.requiresMockup && (
              <div className={styles.configSection}>
                <h3 className={styles.sectionTitle}>{product.requiresColors ? '3. Add Your Design' : '2. Add Your Design'}</h3>
                
                {designMode === 'none' && (
                  <div className={styles.designActions}>
                    <button className={styles.uploadDesignBtn} onClick={() => setDesignMode('has_design')}>
                      <UploadCloud size={32} style={{ marginBottom: '12px' }} />
                      <div>Upload Design</div>
                    </button>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: '#666' }}>Don't have a final design?</span>
                      <button className={styles.designHelpBtn} onClick={() => setDesignMode('need_help')}>
                        Ask our Design Team
                      </button>
                    </div>
                  </div>
                )}

                {designMode === 'has_design' && (
                  <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #eaeaea', textAlign: 'center' }}>
                    <p style={{ fontWeight: 600, marginBottom: '12px', color: '#10b981' }}>✓ Design capability selected.</p>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '16px' }}>Upload your print files directly from the cart after adding this product.</p>
                    <button className="btn-link" onClick={() => setDesignMode('none')} style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>Cancel</button>
                  </div>
                )}

                {designMode === 'need_help' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ fontWeight: 600 }}>Describe what you need printed:</p>
                    <textarea 
                      rows={4} 
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', width: '100%', resize: 'none' }}
                      placeholder="E.g. We want our college logo on the front left chest, and our batch name 'SPARTANS' on the back."
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                    />
                    <button className="btn-link" onClick={() => setDesignMode('none')} style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', alignSelf: 'flex-start' }}>Cancel</button>
                  </div>
                )}
              </div>
            )}

            {/* Add to Cart CTA */}
            <div className={styles.configSection} style={{ border: '2px solid #1a1a1a', background: '#faf9f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Total ({totalQty} pieces)</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{calculateTotal().toLocaleString('en-IN')}</span>
              </div>
              
              <button 
                className={styles.addToCartBtn} 
                onClick={handleAddToCart}
                disabled={totalQty === 0}
              >
                <ShoppingBag size={20} /> Add to Cart
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
