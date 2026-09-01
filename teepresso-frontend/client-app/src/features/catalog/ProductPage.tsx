'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductItem } from '@/types/catalog';
import { useCart, SizeQtyMap, ColorVariant, ArtworkData, MockupState } from '@/features/cart/context/CartContext';
import styles from './ProductPage.module.css';
import { ShoppingBag, ArrowLeft, UploadCloud, Plus, X, ShieldCheck, Box, HelpCircle, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import { MockupCanvasEditor } from './components/MockupCanvasEditor';
import { API_BASE_URL } from '@/common/config/api';


const defaultSizes: SizeQtyMap = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, '4XL': 0, '5XL': 0, '6XL': 0 };

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [activeColor, setActiveColor] = useState<string>('');
  const [activePattern, setActivePattern] = useState<string>('');
  const [activeGalleryImage, setActiveGalleryImage] = useState<string>('');
  
  // Config state
  const [colorSizes, setColorSizes] = useState<Record<string, SizeQtyMap>>({});
  const [quantity, setQuantity] = useState<number>(0);
  const [dynamicSizeGroups, setDynamicSizeGroups] = useState<Record<string, string[]>>({});
  const [dbColors, setDbColors] = useState<any[]>([]);
  const [dbPatterns, setDbPatterns] = useState<any[]>([]);
  
  const [designMode, setDesignMode] = useState<'none' | 'has_design' | 'need_help'>('none');
  const [instructions, setInstructions] = useState('');
  
  const [artwork, setArtwork] = useState<ArtworkData>({
    file: null,
    previewUrl: '',
    mode: 'none',
    instructions: '',
    placements: {}
  });

  const [mockup, setMockup] = useState<MockupState>({
    activeView: 'front',
    activePlacementId: 'front',
    frontTransform: { x: 0, y: 0, scale: 1, rotation: 0 },
    backTransform: { x: 0, y: 0, scale: 1, rotation: 0 },
    designerAssistance: false,
  });

  const [isMockupOpen, setIsMockupOpen] = useState(false);
  const [isArtworkPopoverOpen, setIsArtworkPopoverOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGlobalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setArtwork(prev => ({
        ...prev,
        file,
        previewUrl,
        mode: 'has_design',
        placements: {
          ...prev.placements,
          front: { // Default to front placement
            placementId: 'front',
            file,
            previewUrl,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0
          }
        }
      }));
      setDesignMode('has_design');
      setIsMockupOpen(true);
    }
  };

  useEffect(() => {
    setArtwork((prev: any) => ({ ...prev, mode: designMode }));
    if (designMode === 'has_design') {
      setIsMockupOpen(true);
    }
  }, [designMode]);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          if (Array.isArray(data.product.colors) && data.product.colors.length > 0) {
            setActiveColor(data.product.colors[0]);
          }
          if (Array.isArray(data.product.patterns) && data.product.patterns.length > 0) {
            setActivePattern(data.product.patterns[0]);
          }
        } else {
          console.error("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product", err);
      }

      // Fetch dynamic sizes list
      try {
        const sizesRes = await fetch(`${API_BASE_URL}/sizes`);
        const sizesData = await sizesRes.json();
        if (sizesData.success && Array.isArray(sizesData.sizes)) {
          const groups: Record<string, string[]> = {};
          sizesData.sizes.forEach((s: any) => {
            const cat = s.category || 'Adult Standard';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(s.name);
          });
          setDynamicSizeGroups(groups);
        }
      } catch (err) {
        console.error('Failed to load dynamic sizes:', err);
      }

      // Fetch dynamic colors list
      try {
        const colorsRes = await fetch(`${API_BASE_URL}/colors`);
        const colorsData = await colorsRes.json();
        if (colorsData.success && Array.isArray(colorsData.colors)) {
          setDbColors(colorsData.colors);
        }
      } catch (err) {
        console.error('Failed to load dynamic colors:', err);
      }

      // Fetch dynamic patterns list
      try {
        const patRes = await fetch(`${API_BASE_URL}/patterns`);
        const patData = await patRes.json();
        if (patData.success && Array.isArray(patData.patterns)) {
          setDbPatterns(patData.patterns);
        }
      } catch (err) {
        console.error('Failed to load dynamic patterns:', err);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  if (!product) return <div>Loading...</div>;

  const defaultSizeGroups = {
    'Kids Sizes': ['2Y', '4Y', '6Y', '8Y', '10Y', '12Y'],
    'Adult Standard': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'Adult Plus (Special)': ['3XL', '4XL', '5XL']
  };

  const SIZE_GROUPS = Object.keys(dynamicSizeGroups).length > 0 ? dynamicSizeGroups : defaultSizeGroups;

  const allSizes = Object.values(SIZE_GROUPS).flat();

  // Retrieve current active color's sizes
  const sizes = colorSizes[activeColor] || { ...defaultSizes };

  // Sum total pieces across all configured colors and sizes
  const totalQty = product.requiresSizes 
    ? Object.values(colorSizes).reduce((sum, szMap) => {
        return sum + Object.values(szMap).reduce((s, q) => s + (q || 0), 0);
      }, 0)
    : quantity;

  const getEffectivePrice = (qty: number) => {
    if (product.applyVolumeDiscount && Array.isArray(product.tiers) && product.tiers.length > 0) {
      const sortedTiers = [...product.tiers].sort((a, b) => Number(b.minQty) - Number(a.minQty));
      const applicableTier = sortedTiers.find(t => qty >= Number(t.minQty));
      if (applicableTier) return Number(applicableTier.price);
    }
    return product.startingPrice;
  };

  const calculateTotal = () => {
    return totalQty * getEffectivePrice(totalQty);
  };

  const handleAddToCart = () => {
    if (totalQty === 0) {
      alert('Please select a quantity greater than 0.');
      return;
    }

    // Collect all configured color variants
    const activeVariants: ColorVariant[] = [];
    
    if (product.requiresColors) {
      Object.entries(colorSizes).forEach(([color, szMap]) => {
        const qty = Object.values(szMap).reduce((sum, q) => sum + (q || 0), 0);
        if (qty > 0) {
          activeVariants.push({
            id: `var-${color}-${Date.now()}`,
            color: color,
            colorHex: color.startsWith('#') ? color : '#000000',
            sizes: { ...szMap },
            quantity: 0
          });
        }
      });
    } else {
      activeVariants.push({
        id: `var-${Date.now()}`,
        color: activeColor,
        colorHex: activeColor.startsWith('#') ? activeColor : '#000000',
        sizes: { ...sizes },
        quantity: quantity
      });
    }

    if (activeVariants.length === 0) {
      alert('Please select a quantity greater than 0.');
      return;
    }

    addToCart({
      productId: product.id, image: product.image,
      name: product.name,
      category: product.category,
      pricePerUnit: getEffectivePrice(totalQty),
      requiresSizes: product.requiresSizes,
      requiresColors: product.requiresColors,
      requiresMockup: product.requiresMockup,
      applyVolumeDiscount: product.applyVolumeDiscount,
      colorVariants: activeVariants,
      artwork: {
        ...artwork,
        instructions
      }
    });
  };

  const getStockForVariant = (sz?: string) => {
    if (!product) return 999;
    if (!product.requiresSizes && !product.requiresColors && !product.requiresPatterns) {
      return product.stock !== undefined ? product.stock : 999;
    }
    const map = product.sizesStock || {};

    let key = '';
    if (product.requiresColors && product.requiresPatterns && product.requiresSizes && sz) {
      key = `${activeColor}_${activePattern}_${sz}`;
    } else if (product.requiresColors && product.requiresPatterns && !product.requiresSizes) {
      key = `${activeColor}_${activePattern}`;
    } else if (product.requiresPatterns && product.requiresSizes && sz) {
      key = `${activePattern}_${sz}`;
    } else if (product.requiresColors && product.requiresSizes && sz) {
      key = `${activeColor}_${sz}`;
    } else if (product.requiresSizes && sz) {
      key = sz;
    } else if (product.requiresColors) {
      key = activeColor;
    } else if (product.requiresPatterns) {
      key = activePattern;
    }

    if (map[key] !== undefined) {
      return map[key];
    }
    return 100; // Default fallback stock level
  };

  const updateSize = (sz: keyof SizeQtyMap, delta: number) => {
    const maxStock = getStockForVariant(sz);
    setColorSizes(prev => {
      const currentSizes = prev[activeColor] ? { ...prev[activeColor] } : { ...defaultSizes };
      const nextVal = (currentSizes[sz] || 0) + delta;
      currentSizes[sz] = Math.min(maxStock, Math.max(0, nextVal));
      return { ...prev, [activeColor]: currentSizes };
    });
  };

  const setSizeDirect = (sz: keyof SizeQtyMap, val: number) => {
    const maxStock = getStockForVariant(sz);
    setColorSizes(prev => {
      const currentSizes = prev[activeColor] ? { ...prev[activeColor] } : { ...defaultSizes };
      currentSizes[sz] = Math.min(maxStock, Math.max(0, val || 0));
      return { ...prev, [activeColor]: currentSizes };
    });
  };

  const effectivePrice = getEffectivePrice(totalQty);

  if (!product.requiresMockup) {
    return (
      <div className={styles.pageWrapper}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
          {/* Left Column: Image Gallery */}
          <div>
            <div style={{ background: '#faf9f6', padding: '32px', borderRadius: '12px', border: '1px solid #eaeaea', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
              <img src={activeGalleryImage || product.image} style={{ maxWidth: '100%', height: '360px', objectFit: 'contain', borderRadius: '8px' }} alt={product.name} />
            </div>
            {/* Gallery thumbnails */}
            {product.gallery && product.gallery.length > 0 && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <div 
                  onClick={() => setActiveGalleryImage(product.image)}
                  style={{ width: '70px', height: '70px', borderRadius: '6px', border: (activeGalleryImage === product.image || (!activeGalleryImage && activeGalleryImage !== '')) ? '2px solid #1a1a1a' : '1px solid #ccc', cursor: 'pointer', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#faf9f6' }}
                >
                  <img src={product.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {product.gallery.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveGalleryImage(img)}
                    style={{ width: '70px', height: '70px', borderRadius: '6px', border: activeGalleryImage === img ? '2px solid #1a1a1a' : '1px solid #ccc', cursor: 'pointer', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#faf9f6' }}
                  >
                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Configuration & Checkout */}
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', color: '#1a1a1a' }}>{product.name}</h1>
            <span className="badge badge-neutral" style={{ marginBottom: '16px', display: 'inline-block', background: '#eaeaea', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{product.category}</span>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '24px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-600, #8c5b45)' }}>₹{effectivePrice}</span>
              <span style={{ color: '#666', fontSize: '0.95rem' }}>/ piece</span>
            </div>

            <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '28px', fontSize: '0.95rem' }}>{product.shortDesc}</p>

            <div style={{ borderTop: '1px solid #eaeaea', paddingTop: '24px', marginBottom: '24px' }}>
              {/* Color selector */}
              {product.requiresColors && (
                <div style={{ marginBottom: '28px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0' }}>Choose Color Variant</h4>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {product.colors.map(c => {
                      const dbCol = dbColors.find(col => col.hex.toLowerCase() === c.toLowerCase());
                      const colName = dbCol ? dbCol.name : (c.startsWith('#') ? 'Color' : c);
                      return (
                        <div 
                          key={c} 
                          onClick={() => setActiveColor(c)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            padding: '8px 16px', 
                            borderRadius: '24px', 
                            border: activeColor === c ? '2px solid #1a1a1a' : '1px solid #dcdcdc', 
                            cursor: 'pointer',
                            backgroundColor: activeColor === c ? '#fafafa' : '#fff'
                          }}
                        >
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: c, border: '1px solid rgba(0,0,0,0.1)' }} />
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>{colName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pattern selector */}
              {product.requiresPatterns && (product as any).patterns && (product as any).patterns.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0' }}>Choose Pattern / Weave</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {(product as any).patterns.map((patId: string) => {
                      const dbPat = dbPatterns.find(p => p.id === patId);
                      const patName = dbPat ? dbPat.name : patId;
                      const patImg = dbPat ? dbPat.image : 'https://images.unsplash.com/photo-1610996843657-3f82fc464c17?auto=format&fit=crop&q=80&w=200';
                      const isSelected = activePattern === patId;

                      return (
                        <div 
                          key={patId} 
                          onClick={() => setActivePattern(patId)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            padding: '6px 14px', 
                            borderRadius: '20px', 
                            border: isSelected ? '2px solid #8c5b45' : '1px solid #dcdcdc', 
                            cursor: 'pointer', 
                            backgroundColor: isSelected ? 'rgba(140, 91, 69, 0.08)' : '#ffffff',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '12px'
                          }}
                        >
                          <img src={patImg} style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} alt={patName} />
                          <span>{patName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizing selection */}
              {(!product.requiresColors || activeColor) ? (
                product.requiresSizes ? (
                  <div style={{ marginBottom: '28px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0' }}>Choose Size & Quantities</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {Object.entries(SIZE_GROUPS).map(([category, categorySizes]) => {
                        const activeCategorySizes = categorySizes.filter(sz => !product.sizes || product.sizes.length === 0 || product.sizes.includes(sz) || product.sizes.some(s => s.toLowerCase() === sz.toLowerCase()));
                        if (activeCategorySizes.length === 0) return null;
                        return (
                          <div key={category} style={{ border: '1px solid #eaeaea', borderRadius: '8px', padding: '16px', backgroundColor: '#fff' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>{category}</span>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                              {activeCategorySizes.map(sz => {
                                  const qty = sizes[sz] || 0;
                                  const maxStock = getStockForVariant(sz);
                                  const isOutOfStock = maxStock <= 0;
                                  return (
                                    <div key={sz} style={{ display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid #f0f0f0', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#fafafa', opacity: isOutOfStock ? 0.6 : 1 }}>
                                      <span style={{ fontSize: '12px', fontWeight: 700 }}>
                                        {sz}
                                        {isOutOfStock ? (
                                          <div style={{ fontSize: '9px', color: 'red' }}>Out of Stock</div>
                                        ) : maxStock <= 20 ? (
                                          <div style={{ fontSize: '9px', color: '#f59e0b' }}>{maxStock} left</div>
                                        ) : null}
                                      </span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <button type="button" onClick={() => updateSize(sz, -1)} style={{ padding: '2px 6px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', cursor: 'pointer' }} disabled={qty <= 0}>-</button>
                                        <input 
                                          type="number" 
                                          value={qty || ''} 
                                          onChange={e => setSizeDirect(sz, parseInt(e.target.value))} 
                                          style={{ width: '40px', textAlign: 'center', fontSize: '11px', border: '1px solid #ccc', borderRadius: '4px', padding: '2px' }}
                                          disabled={isOutOfStock}
                                        />
                                        <button type="button" onClick={() => updateSize(sz, 1)} style={{ padding: '2px 6px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', cursor: 'pointer' }} disabled={qty >= maxStock || isOutOfStock}>+</button>
                                      </div>
                                    </div>
                                  );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  // Flat Accessory Quantity Stepper
                  <div style={{ marginBottom: '28px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0' }}>Quantity</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button type="button" onClick={() => setQuantity(Math.max(0, quantity - 1))} style={{ width: '36px', height: '36px', border: '1px solid #ccc', background: '#fff', borderRadius: '6px', cursor: 'pointer' }} disabled={quantity <= 0}>-</button>
                      <input 
                        type="number" 
                        value={quantity || ''} 
                        onChange={e => setQuantity(Math.max(0, parseInt(e.target.value)))} 
                        style={{ width: '60px', height: '36px', textAlign: 'center', fontSize: '14px', border: '1px solid #ccc', borderRadius: '6px' }}
                      />
                      <button type="button" onClick={() => setQuantity(quantity + 1)} style={{ width: '36px', height: '36px', border: '1px solid #ccc', background: '#fff', borderRadius: '6px', cursor: 'pointer' }} disabled={quantity >= getStockForVariant('')}>+</button>
                    </div>
                  </div>
                )
              ) : (
                <div style={{ color: '#9ca3af', fontSize: '13px', fontStyle: 'italic', padding: '12px 0' }}>
                  Please select a color variant first to unlock available sizes.
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #eaeaea', paddingTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontWeight: 600, color: '#666' }}>Subtotal ({totalQty} pcs)</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 850 }}>₹{calculateTotal().toLocaleString('en-IN')}</span>
              </div>
              <button 
                type="button"
                onClick={handleAddToCart}
                style={{ width: '100%', padding: '16px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      
      {/* Top Navigation Stepper */}
      <div className={styles.stepperContainer}>
        <div className={styles.step}>
          <div className={styles.stepNumActive}>1</div>
          <span className={styles.stepTextActive}>Colour</span>
        </div>
        <div className={styles.stepLine}></div>
        <div className={styles.step}>
          <div className={styles.stepNum}>2</div>
          <span className={styles.stepText}>Size & Quantity</span>
        </div>
        <div className={styles.stepLine}></div>
        <div className={styles.step}>
          <div className={styles.stepNum}>3</div>
          <span className={styles.stepText}>Upload Design</span>
        </div>
        <div className={styles.stepLine}></div>
        <div className={styles.step}>
          <div className={styles.stepNum}>4</div>
          <span className={styles.stepText}>Preview & Position</span>
        </div>
        <div className={styles.stepLine}></div>
        <div className={styles.step}>
          <div className={styles.stepNum}>5</div>
          <span className={styles.stepText}>Add to Cart</span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        
        {/* Left Column: Product Info & Images */}
        <div className={styles.leftCol}>
          <div className={styles.gallery}>
            <div className={styles.mainImageWrapper}>
              <img src={product.image} className={styles.mainImage} alt={product.name} />
            </div>
          </div>
          
          <div className={styles.productCard}>
            <div className={styles.productDetails}>
              <h1 className={styles.title}>{product.name}</h1>
              <div className={styles.priceRow}>
                <span className={styles.price}>₹{product.startingPrice}</span>
                <span className={styles.priceSuffix}>/ piece</span>
                <span className={styles.taxBadge}>Inclusive of all taxes</span>
              </div>
              <p className={styles.desc}>{product.shortDesc}</p>
              
              <div className={styles.features}>
                <div className={styles.feature}><Box size={16} /> Premium Fabric</div>
                <div className={styles.feature}><ShieldCheck size={16} /> Soft & Breathable</div>
                <div className={styles.feature}><ShieldCheck size={16} /> Quality Guaranteed</div>
                <div className={styles.feature}><Box size={16} /> Bulk Orders Welcome</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Config (Color & Sizes) */}
        <div className={styles.middleCol}>
          {product.requiresColors && (
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>1. Choose Colour</h3>
              <div className={styles.colorGrid}>
                {product.colors.map(c => {
                  const dbCol = dbColors.find(col => col.hex.toLowerCase() === c.toLowerCase());
                  const colName = dbCol ? dbCol.name : (c.startsWith('#') ? 'Color' : c);
                  return (
                    <div key={c} className={styles.colorItem} onClick={() => setActiveColor(c)}>
                      <div className={`${styles.colorCircle} ${activeColor === c ? styles.colorCircleActive : ''}`} style={{ backgroundColor: c }}>
                        {activeColor === c && <ShieldCheck size={14} color={c === '#ffffff' ? '#000' : '#fff'} />}
                      </div>
                      <span className={styles.colorName}>{colName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {product.requiresPatterns && (product as any).patterns && (product as any).patterns.length > 0 && (
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>{product.requiresColors ? '2. Choose Pattern / Weave' : '1. Choose Pattern / Weave'}</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {(product as any).patterns.map((patId: string) => {
                  const dbPat = dbPatterns.find(p => p.id === patId);
                  const patName = dbPat ? dbPat.name : patId;
                  const patImg = dbPat ? dbPat.image : 'https://images.unsplash.com/photo-1610996843657-3f82fc464c17?auto=format&fit=crop&q=80&w=200';
                  const isSelected = activePattern === patId;

                  return (
                    <div 
                      key={patId} 
                      onClick={() => setActivePattern(patId)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '6px 14px', 
                        borderRadius: '20px', 
                        border: isSelected ? '2px solid #8c5b45' : '1px solid #dcdcdc', 
                        cursor: 'pointer', 
                        backgroundColor: isSelected ? 'rgba(140, 91, 69, 0.08)' : '#ffffff',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '12px'
                      }}
                    >
                      <img src={patImg} style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} alt={patName} />
                      <span>{patName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>{product.requiresColors ? '2. Choose Size & Quantity' : '1. Choose Size & Quantity'}</h3>
            
            {(!product.requiresColors || activeColor) ? (
              product.requiresSizes ? (
                <div className={styles.sizeCategories}>
                  {Object.entries(SIZE_GROUPS).map(([category, categorySizes]) => {
                    const activeCategorySizes = categorySizes.filter(sz => !product.sizes || product.sizes.length === 0 || product.sizes.includes(sz) || product.sizes.some(s => s.toLowerCase() === sz.toLowerCase()));
                    if (activeCategorySizes.length === 0) return null;
                    const categoryTotal = activeCategorySizes.reduce((sum, sz) => sum + (sizes[sz] || 0), 0);
                    return (
                      <details key={category} className={styles.sizeCategoryDetails} open={category === 'Adult Standard'}>
                        <summary className={styles.sizeCategorySummary}>
                          <span>{category}</span>
                          {categoryTotal > 0 && <span className={styles.categoryBadge}>{categoryTotal} added</span>}
                        </summary>
                        <div className={styles.tableWrapper}>
                          <table className={styles.sizeTable}>
                            <thead>
                              <tr>
                                <th>Size</th>
                                <th>Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeCategorySizes.map(sz => {
                                const qty = sizes[sz] || 0;
                                const maxStock = getStockForVariant(sz);
                                const isOutOfStock = maxStock <= 0;
                                return (
                                  <tr key={sz} style={{ opacity: isOutOfStock ? 0.6 : 1 }}>
                                    <td className={styles.szName}>
                                      {sz}
                                      {isOutOfStock ? (
                                        <span style={{ fontSize: '11px', color: 'red', marginLeft: '6px' }}>(Out of Stock)</span>
                                      ) : maxStock <= 20 ? (
                                        <span style={{ fontSize: '11px', color: '#f59e0b', marginLeft: '6px' }}>({maxStock} left)</span>
                                      ) : null}
                                    </td>
                                    <td>
                                      <div className={styles.tableStepper}>
                                        <button onClick={() => updateSize(sz, -1)} disabled={qty <= 0}>-</button>
                                        <input 
                                          type="number" 
                                          value={qty || ''} 
                                          onChange={e => setSizeDirect(sz, parseInt(e.target.value))} 
                                          placeholder="0"
                                          disabled={isOutOfStock}
                                        />
                                        <button 
                                          onClick={() => updateSize(sz, 1)} 
                                          disabled={qty >= maxStock || isOutOfStock}
                                        >+</button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    );
                  })}
                </div>
              ) : (
                 <div className={styles.tableStepper} style={{ width: '150px', marginBottom: '20px' }}>
                    <button onClick={() => setQuantity(Math.max(0, quantity - 1))}>-</button>
                    <input type="number" value={quantity || ''} onChange={e => setQuantity(Math.max(0, parseInt(e.target.value)))} placeholder="0"/>
                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                 </div>
              )
            ) : (
              <div style={{ color: '#9ca3af', fontSize: '13px', fontStyle: 'italic', padding: '12px 0' }}>
                Please select a color variant first to unlock available sizes.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Design */}
        <div className={styles.rightCol}>
          {product.requiresMockup && (
            <>
              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>{product.requiresColors ? '3. Add Your Design' : '2. Add Your Design'}</h3>
                
                <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud size={24} color="#6b7280" />
                  <div className={styles.uploadTextContainer}>
                    <h4>Upload your design</h4>
                    <span className={styles.formats}>PNG, JPG, PDF (Max 20MB)</span>
                  </div>
                  <button className={styles.browseBtn} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Browse</button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleGlobalFileUpload}
                    accept="image/png, image/jpeg, image/svg+xml, application/pdf"
                    style={{ display: 'none' }}
                  />
                </div>

                <div className={styles.helpArea}>
                  <div className={styles.helpContent}>
                    <div className={styles.helpHeader}>
                      <HelpCircle size={16} color="#b45309" />
                      <h4>Need help with design?</h4>
                    </div>
                    <button className={styles.talkBtn} onClick={() => setDesignMode('need_help')}>Contact Us</button>
                  </div>
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.accordionHeader} onClick={() => setIsMockupOpen(!isMockupOpen)}>
                  <h3 className={styles.panelTitle} style={{marginBottom: 0}}>{product.requiresColors ? '4. Preview & Position Your Design' : '3. Preview & Position Your Design'}</h3>
                  {isMockupOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {!isMockupOpen && <p className={styles.accordionHint}>Appears after you upload a design</p>}
                
                {isMockupOpen && (
                  <div className={styles.accordionContent}>
                    <MockupCanvasEditor 
                      productId={product.id}
                      artwork={artwork}
                      mockup={mockup}
                      setArtwork={setArtwork}
                      setMockup={setMockup}
                      onPopoverStateChange={setIsArtworkPopoverOpen}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>

      {/* Bottom Sticky Action Bar */}
      {totalQty > 0 && (
        <div className={styles.bottomBar}>
          <div className={styles.bottomContainer}>
          <div className={styles.bottomStats}>
            <ShoppingBag size={24} color="#666" />
            <div className={styles.bCol}>
              <span className={styles.bLabel}>Total Pieces</span>
              <span className={styles.bVal}>{totalQty}</span>
            </div>
            <div className={styles.bDivider}></div>
            <div className={styles.bCol}>
              <span className={styles.bLabel}>Estimated Price</span>
              <div className={styles.bPriceRow}>
                <span className={styles.bPrice}>₹{calculateTotal().toLocaleString('en-IN')}</span>
                <span className={styles.bTax}>(Inclusive of all taxes)</span>
              </div>
            </div>
          </div>
          <div className={styles.bottomActions}>
            <button className={styles.saveBtn}>
              <Bookmark size={18} /> Continue Shopping
            </button>
            <button className={styles.cartBtn} onClick={handleAddToCart}><ShoppingBag size={18} /> Add to Cart • ₹{calculateTotal().toLocaleString('en-IN')}</button>
          </div>
        </div>
      </div>
      )}

    </div>
  );
}

export default ProductPage;
