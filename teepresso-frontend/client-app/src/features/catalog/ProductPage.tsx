'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStorefront } from '@/common/context/StorefrontContext';
import { useCart, SizeQtyMap, ArtworkData, MockupState } from '@/features/cart/context/CartContext';
import styles from './ProductPage.module.css';
import { ShoppingBag, ArrowLeft, UploadCloud, ShieldCheck, Box, HelpCircle, ChevronDown, ChevronUp, Bookmark, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '@/common/config/api';
import { MockupCanvasEditor } from './components/MockupCanvasEditor';

interface ColorSnippet {
  id: string;
  name: string;
  hex: string;
}

interface SizeSnippet {
  id: string;
  name: string;
  category: 'Kids Sizes' | 'Adult Standard' | 'Adult Plus (Special)';
}

interface PatternSnippet {
  id: string;
  name: string;
  image: string;
  category?: string;
}

interface PriceTier {
  minQty: number;
  price: number;
}

interface ProductItem {
  id: string;
  name: string;
  category: string;
  shortDesc?: string;
  startingPrice: number;
  priceRange?: string;
  image: string;
  gallery?: string[];
  colors?: string[];
  sizes?: string[];
  patterns?: string[];
  tiers?: PriceTier[];
  requiresSizes?: boolean;
  requiresColors?: boolean;
  requiresPatterns?: boolean;
  requiresMockup?: boolean;
  applyVolumeDiscount?: boolean;
}

const defaultSizes: SizeQtyMap = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, '4XL': 0, '5XL': 0, '6XL': 0 };

export function ProductPage() {
  const { contactPhone } = useStorefront();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [activeColor, setActiveColor] = useState<string>('Default');
  const [activePattern, setActivePattern] = useState<string>('Standard');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [matrixSizes, setMatrixSizes] = useState<Record<string, SizeQtyMap>>({});
  const [quantity, setQuantity] = useState<number>(0);

  // Live Database Snippets
  const [allColors, setAllColors] = useState<ColorSnippet[]>([]);
  const [allSizes, setAllSizes] = useState<SizeSnippet[]>([]);
  const [allPatterns, setAllPatterns] = useState<PatternSnippet[]>([]);

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parallel Unified Fetch (0 Hardcoding, 100% DB Dynamic)
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const loadAllProductData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [prodRes, colRes, sizeRes, patRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products/${id}`).then(r => r.json()).catch(() => null),
          fetch(`${API_BASE_URL}/colors`).then(r => r.json()).catch(() => null),
          fetch(`${API_BASE_URL}/sizes`).then(r => r.json()).catch(() => null),
          fetch(`${API_BASE_URL}/patterns`).then(r => r.json()).catch(() => null)
        ]);

        if (!isMounted) return;

        // Populate database snippets
        if (colRes?.success && Array.isArray(colRes.colors)) setAllColors(colRes.colors);
        if (sizeRes?.success && Array.isArray(sizeRes.sizes)) setAllSizes(sizeRes.sizes);
        if (patRes?.success && Array.isArray(patRes.patterns)) setAllPatterns(patRes.patterns);

        let prod: any = null;
        if (prodRes?.success && prodRes?.product) {
          prod = prodRes.product;
        } else {
          // Fallback fetch catalog
          const catRes = await fetch(`${API_BASE_URL}/products`);
          const catData = await catRes.json();
          if (catData?.success && Array.isArray(catData.products) && catData.products.length > 0) {
            const targetId = id.toLowerCase().trim();
            prod = catData.products.find((p: any) => {
              const pId = (p.id || '').toLowerCase();
              const pName = (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-');
              return pId === targetId || pName.includes(targetId) || targetId.includes(pId);
            }) || catData.products[0];
          }
        }

        if (prod && isMounted) {
          let parsedColors: string[] = [];
          if (Array.isArray(prod.colors)) parsedColors = prod.colors;
          else if (typeof prod.colors === 'string') {
            try { parsedColors = JSON.parse(prod.colors); } catch(e) {}
          }

          let parsedPatterns: string[] = [];
          if (Array.isArray(prod.patterns)) parsedPatterns = prod.patterns;
          else if (typeof prod.patterns === 'string') {
            try { parsedPatterns = JSON.parse(prod.patterns); } catch(e) {}
          }

          let parsedSizes: string[] = [];
          if (Array.isArray(prod.sizes)) parsedSizes = prod.sizes;
          else if (typeof prod.sizes === 'string') {
            try { parsedSizes = JSON.parse(prod.sizes); } catch(e) {}
          }

          const safeProduct: ProductItem = {
            ...prod,
            colors: parsedColors,
            patterns: parsedPatterns,
            sizes: parsedSizes,
            startingPrice: Number(prod.startingPrice || 0)
          };

          setProduct(safeProduct);
          setSelectedImage(safeProduct.image || '');

          if (parsedColors.length > 0) setActiveColor(parsedColors[0]);
          if (parsedPatterns.length > 0) setActivePattern(parsedPatterns[0]);
        } else if (isMounted) {
          setError('Requested product could not be loaded.');
        }
      } catch (err) {
        console.error('Failed to load dynamic product data:', err);
        if (isMounted) setError('Network error loading product specifications.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAllProductData();
    return () => { isMounted = false; };
  }, [id]);

  const currentMatrixKey = `${activeColor || 'Default'}_${activePattern || 'Standard'}`;
  const currentSizes = (matrixSizes && matrixSizes[currentMatrixKey]) ? matrixSizes[currentMatrixKey] : { ...defaultSizes };

  const updateSize = (sz: string, delta: number) => {
    setMatrixSizes(prev => {
      const currentMap = prev[currentMatrixKey] || { ...defaultSizes };
      const currentVal = currentMap[sz] || 0;
      const newVal = Math.max(0, currentVal + delta);
      return {
        ...prev,
        [currentMatrixKey]: {
          ...currentMap,
          [sz]: newVal
        }
      };
    });
  };

  const setSizeDirect = (sz: string, val: number) => {
    setMatrixSizes(prev => {
      const currentMap = prev[currentMatrixKey] || { ...defaultSizes };
      const newVal = Math.max(0, isNaN(val) ? 0 : val);
      return {
        ...prev,
        [currentMatrixKey]: {
          ...currentMap,
          [sz]: newVal
        }
      };
    });
  };

  const totalQty = product?.requiresSizes
    ? Object.values(matrixSizes || {}).reduce((tot, map) => {
        if (!map || typeof map !== 'object') return tot;
        return tot + Object.values(map).reduce((s, v) => s + (v || 0), 0);
      }, 0)
    : (quantity || 0);

  const getEffectivePrice = (qty: number) => {
    const base = Number(product?.startingPrice || 0);
    if (!product) return 0;
    
    // Use live database volume pricing tiers if configured on the product
    if (Array.isArray(product.tiers) && product.tiers.length > 0) {
      const sortedTiers = [...product.tiers].sort((a, b) => b.minQty - a.minQty);
      const matchedTier = sortedTiers.find(t => qty >= t.minQty);
      if (matchedTier) return Number(matchedTier.price);
    }

    if (product.applyVolumeDiscount) {
      if (qty >= 150) return Math.round(base * 0.8);
      if (qty >= 75) return Math.round(base * 0.9);
    }
    return base;
  };

  const calculateTotal = () => {
    const unitPrice = getEffectivePrice(totalQty);
    return totalQty * unitPrice;
  };

  const handleAddToCart = () => {
    if (!product || totalQty <= 0) return;
    const unitPrice = getEffectivePrice(totalQty);

    const colorVariantsList: any[] = [];

    if (product.requiresSizes && Object.keys(matrixSizes).length > 0) {
      Object.entries(matrixSizes).forEach(([matrixKey, sizesMap]) => {
        if (!sizesMap || typeof sizesMap !== 'object') return;
        const mapTotal = Object.values(sizesMap).reduce((s, v) => s + (v || 0), 0);
        if (mapTotal > 0) {
          const parts = matrixKey.split('_');
          const colName = parts[0] || activeColor || 'Default';
          const patName = parts[1] || activePattern || 'Standard';

          const colSnippet = allColors.find(c => c.name.toLowerCase() === colName.toLowerCase());
          const hexVal = colSnippet?.hex || (colName.startsWith('#') ? colName : '#1a1a1a');

          colorVariantsList.push({
            id: `cv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            color: colSnippet?.name || colName,
            colorHex: hexVal,
            pattern: patName !== 'Standard' ? patName : undefined,
            sizes: sizesMap
          });
        }
      });
    }

    if (colorVariantsList.length === 0) {
      const colSnippet = allColors.find(c => c.name.toLowerCase() === activeColor.toLowerCase());
      const hexVal = colSnippet?.hex || (activeColor.startsWith('#') ? activeColor : '#1a1a1a');

      colorVariantsList.push({
        id: `cv_${Date.now()}`,
        color: colSnippet?.name || activeColor || 'Default',
        colorHex: hexVal,
        pattern: activePattern !== 'Standard' ? activePattern : undefined,
        sizes: currentSizes
      });
    }

    addToCart({
      productId: product.id,
      name: product.name,
      category: product.category || 'Apparel',
      pricePerUnit: unitPrice,
      requiresSizes: !!product.requiresSizes,
      requiresColors: !!product.requiresColors,
      requiresMockup: !!product.requiresMockup,
      applyVolumeDiscount: !!product.applyVolumeDiscount,
      colorVariants: colorVariantsList,
      artwork: {
        file: artwork.file || null,
        previewUrl: artwork.previewUrl || '',
        mode: designMode,
        instructions,
        placements: artwork.placements || {}
      }
    });

    // Automatically opens CartDrawer in CartContext (No unwanted page redirection!)
  };

  const handleGlobalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
      setArtwork(prev => ({
        ...prev,
        file,
        previewUrl,
        mode: 'has_design',
        placements: {
          ...prev.placements,
          front: {
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
      };
      reader.readAsDataURL(file);
    }
  };

  // Dynamically group sizes from database
  const getGroupedSizesFromDb = () => {
    if (allSizes.length === 0) {
      return {
        'Adult Standard': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        'Adult Plus (Special)': ['3XL', '4XL', '5XL']
      };
    }

    const groups: Record<string, string[]> = {};
    allSizes.forEach(s => {
      const cat = s.category || 'Adult Standard';
      if (!groups[cat]) groups[cat] = [];
      // If product restricts sizes, filter
      if (!product?.sizes || product.sizes.length === 0 || product.sizes.includes(s.name)) {
        groups[cat].push(s.name);
      }
    });
    return groups;
  };

  const phoneStr = String(contactPhone || '919390771123').replace(/[^0-9]/g, '');
  const formattedWaPhone = phoneStr.length === 10 ? `91${phoneStr}` : (phoneStr || '919390771123');
  const waHelpUrl = `https://wa.me/${formattedWaPhone}?text=${encodeURIComponent(`Hi Teepresso Team! I need help with design for ${product?.name || 'custom apparel'}`)}`;

  if (loading) {
    return (
      <div className={styles.pageWrapper} style={{ padding: '40px 0', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ width: '200px', height: '24px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '32px', animation: 'pulse 1.5s infinite' }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '100%', height: '380px', backgroundColor: '#f3f4f6', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ width: '100%', height: '120px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}></div>
              <div style={{ width: '100%', height: '220px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ width: '100%', height: '180px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.pageWrapper} style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', padding: '40px', borderRadius: '12px' }}>
          <ShoppingBag size={48} color="#9ca3af" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#111827' }}>Product Unavailable</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            {error || 'The requested product specs could not be loaded.'}
          </p>
          <button onClick={() => navigate('/products')} className="btn-primary" style={{ padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
            Return to Products Catalog
          </button>
        </div>
      </div>
    );
  }

  const groupedSizes = getGroupedSizesFromDb();

  return (
    <div className={styles.pageWrapper}>
      
      {/* Top Stepper */}
      <div className={styles.stepperContainer}>
        <div className={styles.step}>
          <div className={styles.stepNumActive}>1</div>
          <span className={styles.stepTextActive}>Configure Specs</span>
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
          <span className={styles.stepText}>Add to Cart</span>
        </div>
      </div>

      <div className={styles.mainGrid} style={{ gridTemplateColumns: product.requiresMockup !== false ? '1fr 1.2fr 1fr' : '1fr 1.5fr', maxWidth: product.requiresMockup !== false ? '1400px' : '1100px' }}>
        
        {/* Left Column: Product Image & Overview */}
        <div className={styles.leftCol}>
          <div className={styles.gallery}>
            <div className={styles.mainImageWrapper}>
              <img src={selectedImage || product.image || '/images/mockups/tshirt-blank.svg'} className={styles.mainImage} alt={product.name} />
            </div>
            {Array.isArray(product.gallery) && product.gallery.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '12px', gap: '8px', position: 'relative' }}>
                <button 
                  onClick={() => {
                    const container = document.getElementById('product-gallery-scroll');
                    if (container) container.scrollBy({ left: -100, behavior: 'smooth' });
                  }}
                  style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <div 
                  id="product-gallery-scroll"
                  style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollBehavior: 'smooth', flex: 1, padding: '4px 0', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <style>{`#product-gallery-scroll::-webkit-scrollbar { display: none; }`}</style>
                  {[product.image, ...product.gallery].filter(Boolean).map((imgUrl, idx) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt={`View ${idx}`}
                      onClick={() => setSelectedImage(imgUrl)}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: (selectedImage || product.image) === imgUrl ? '2px solid var(--color-primary-600)' : '1px solid #e5e7eb',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    />
                  ))}
                </div>
                <button 
                  onClick={() => {
                    const container = document.getElementById('product-gallery-scroll');
                    if (container) container.scrollBy({ left: 100, behavior: 'smooth' });
                  }}
                  style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
          
          <div className={styles.productCard}>
            <div className={styles.productDetails}>
              <h1 className={styles.title}>{product.name}</h1>
              <div className={styles.priceRow}>
                <span className={styles.price}>₹{product.startingPrice}</span>
                <span className={styles.priceSuffix}>/ piece</span>
                <span className={styles.taxBadge}>Inclusive of all taxes</span>
              </div>
              {product.shortDesc && <p className={styles.desc}>{product.shortDesc}</p>}
              
              <div className={styles.features}>
                <div className={styles.feature}><Box size={16} /> Premium Fabric</div>
                <div className={styles.feature}><ShieldCheck size={16} /> Soft & Breathable</div>
                <div className={styles.feature}><ShieldCheck size={16} /> 100% Quality Guaranteed</div>
                <div className={styles.feature}><Box size={16} /> Bulk Discounts Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Configurator (Dynamic Patterns, Colors & Sizes) */}
        <div className={styles.middleCol}>
          
          {/* DYNAMIC PATTERNS SELECTOR */}
          {(product.requiresPatterns || (product.patterns && product.patterns.length > 0)) && (
            <div className={styles.panel} style={{ marginBottom: '16px' }}>
              <h3 className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#d97706" /> 1. Choose Pattern / Craft
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                {(product.patterns && product.patterns.length > 0 ? product.patterns : allPatterns.map(p => p.name)).map(patName => {
                  const patObj = allPatterns.find(p => p.name === patName);
                  const isSelected = activePattern === patName;

                  return (
                    <div
                      key={patName}
                      onClick={() => setActivePattern(patName)}
                      style={{
                        border: isSelected ? '2px solid #d97706' : '1px solid #e5e7eb',
                        backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.08)' : '#ffffff',
                        borderRadius: '8px',
                        padding: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                        position: 'relative'
                      }}
                    >
                      {patObj?.image ? (
                        <img src={patObj.image} alt={patName} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', marginBottom: '6px' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: '#f3f4f6', margin: '0 auto 6px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sparkles size={16} color="#d97706" />
                        </div>
                      )}
                      <span style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? '#b45309' : '#374151', display: 'block', lineHeight: 1.2 }}>
                        {patName}
                      </span>
                      {isSelected && (
                        <span style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: '#d97706', color: '#fff', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DYNAMIC COLORS SELECTOR */}
          {(product.requiresColors || (product.colors && product.colors.length > 0)) && (
            <div className={styles.panel} style={{ marginBottom: '16px' }}>
              <h3 className={styles.panelTitle}>
                {(product.requiresPatterns || (product.patterns && product.patterns.length > 0)) ? '2. Choose Colour' : '1. Choose Colour'}
              </h3>
              <div className={styles.colorGrid}>
                {(product.colors && product.colors.length > 0 ? product.colors : allColors.map(c => c.name)).map(colName => {
                  const colSnippet = allColors.find(c => c.name.toLowerCase() === colName.toLowerCase() || c.hex.toLowerCase() === colName.toLowerCase());
                  const hexVal = colSnippet?.hex || (colName.startsWith('#') ? colName : '#e0e0e0');
                  const isSelected = activeColor === colName;

                  return (
                    <div key={colName} className={styles.colorItem} onClick={() => setActiveColor(colName)}>
                      <div className={`${styles.colorCircle} ${isSelected ? styles.colorCircleActive : ''}`} style={{ backgroundColor: hexVal }}>
                        {isSelected && <ShieldCheck size={14} color={hexVal.toLowerCase() === '#ffffff' ? '#000' : '#fff'} />}
                      </div>
                      <span className={styles.colorName}>{colSnippet?.name || colName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DYNAMIC SIZES SELECTOR */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>
              {(product.requiresPatterns && product.requiresColors) ? '3. Choose Size & Quantity' : (product.requiresColors || product.requiresPatterns) ? '2. Choose Size & Quantity' : '1. Choose Size & Quantity'}
            </h3>
            
            {product.requiresSizes !== false ? (
              <div className={styles.sizeCategories}>
                {Object.entries(groupedSizes).map(([category, categorySizes]) => {
                  const categoryTotal = categorySizes.reduce((sum, sz) => sum + (currentSizes[sz] || 0), 0);
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
                            {categorySizes.map(sz => {
                              const qty = currentSizes[sz] || 0;
                              return (
                                <tr key={sz}>
                                  <td className={styles.szName}>{sz}</td>
                                  <td>
                                    <div className={styles.tableStepper}>
                                      <button onClick={() => updateSize(sz, -1)}>-</button>
                                      <input type="number" value={qty || ''} onChange={e => setSizeDirect(sz, parseInt(e.target.value))} placeholder="0"/>
                                      <button onClick={() => updateSize(sz, 1)}>+</button>
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
            )}
          </div>
        </div>

        {/* Right Column: Design & Mockup Preview */}
        {product.requiresMockup !== false && (
        <div className={styles.rightCol}>
              <div className={styles.panel} style={{ marginBottom: '16px' }}>
                <h3 className={styles.panelTitle}>Add Your Design / Artwork</h3>
                
                <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud size={24} color="#6b7280" />
                  <div className={styles.uploadTextContainer}>
                    <h4>Upload custom artwork</h4>
                    <span className={styles.formats}>PNG, JPG, SVG, PDF (Max 20MB)</span>
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
                    <a 
                      href={waHelpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.talkBtn}
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      Contact Us
                    </a>
                  </div>
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.accordionHeader} onClick={() => setIsMockupOpen(!isMockupOpen)}>
                  <h3 className={styles.panelTitle} style={{marginBottom: 0}}>Preview & Position Design</h3>
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
                    </div>
        )}

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
              <button className={styles.saveBtn} onClick={() => navigate('/products')}>
                <Bookmark size={18} /> Continue Shopping
              </button>
              <button className={styles.cartBtn} onClick={handleAddToCart}>
                <ShoppingBag size={18} /> Add to Cart • ₹{calculateTotal().toLocaleString('en-IN')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

class ProductErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ProductPage ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#fff', minHeight: '80vh' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', border: '1px solid #fee2e2', padding: '32px', borderRadius: '12px', backgroundColor: '#fef2f2' }}>
            <h2 style={{ color: '#991b1b', marginBottom: '12px' }}>Product Configuration Warning</h2>
            <p style={{ color: '#7f1d1d', fontSize: '14px', marginBottom: '20px' }}>
              {this.state.error?.message || 'A temporary rendering error occurred.'}
            </p>
            <button onClick={() => window.location.reload()} className="btn-primary" style={{ padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ProductPageWithErrorBoundary() {
  return (
    <ProductErrorBoundary>
      <ProductPage />
    </ProductErrorBoundary>
  );
}

export default ProductPageWithErrorBoundary;
