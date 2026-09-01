import { API_BASE_URL } from '@/common/config/api';
'use client';
import { useStorefront } from '@/common/context/StorefrontContext';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRODUCTS_CATALOG, ProductItem } from '@/features/catalog/data/productsData';
import { useCart, SizeQtyMap, ColorVariant, ArtworkData, MockupState } from '@/features/cart/context/CartContext';
import styles from './ProductPage.module.css';
import { ShoppingBag, ArrowLeft, UploadCloud, Plus, X, ShieldCheck, Box, HelpCircle, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import { MockupCanvasEditor } from './components/MockupCanvasEditor';

const defaultSizes: SizeQtyMap = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, '4XL': 0, '5XL': 0, '6XL': 0 };

export function ProductPage() {
  const { contactPhone } = useStorefront();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string>('');
  
  // Config state
  const [activePattern, setActivePattern] = useState<string>('Standard');
  const [matrixSizes, setMatrixSizes] = useState<Record<string, SizeQtyMap>>({});
  const [quantity, setQuantity] = useState<number>(0);

  const currentMatrixKey = `${activeColor || 'Default'}_${activePattern || 'Standard'}`;
  const currentSizes = matrixSizes[currentMatrixKey] || { ...defaultSizes };

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
    if (!id) return;
    let isMounted = true;

    const loadProductData = async () => {
      setLoading(true);
      setError(null);

      const targetId = id.toLowerCase().trim();

      try {
        // 1. Try direct fetch by ID
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        const data = await res.json();
        if (data.success && data.product && isMounted) {
          const prod = data.product;
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

          const safeProduct = {
            ...prod,
            colors: parsedColors,
            patterns: parsedPatterns,
            startingPrice: Number(prod.startingPrice || 0)
          };

          setProduct(safeProduct);
          if (parsedColors.length > 0) setActiveColor(parsedColors[0]);
          if (parsedPatterns.length > 0) setActivePattern(parsedPatterns[0]);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Direct fetch failed, trying full catalog fallback...', e);
      }

      // 2. Fallback: Fetch full products catalog and match by ID or slug
      try {
        const allRes = await fetch(`${API_BASE_URL}/products`);
        const allData = await allRes.json();
        if (allData.success && Array.isArray(allData.products) && allData.products.length > 0 && isMounted) {
          const matched = allData.products.find((p: any) => {
            const pId = (p.id || '').toLowerCase();
            const pName = (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-');
            return pId === targetId || pName.includes(targetId) || targetId.includes(pId);
          }) || allData.products[0];

          setProduct(matched);
          if (Array.isArray(matched.colors) && matched.colors.length > 0) {
            setActiveColor(matched.colors[0]);
          }
          if (Array.isArray(matched.patterns) && matched.patterns.length > 0) {
            setActivePattern(matched.patterns[0]);
          }
        } else if (isMounted) {
          setError('Product not found in database catalog.');
        }
      } catch (err) {
        console.error('Catalog fallback fetch failed:', err);
        if (isMounted) setError('Network error: unable to load product specs.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProductData();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className={styles.pageWrapper} style={{ padding: '40px 0', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Animated Header Skeleton */}
          <div style={{ width: '200px', height: '24px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '32px', animation: 'pulse 1.5s infinite' }}></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
            
            {/* Left Box Skeleton */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '100%', height: '380px', backgroundColor: '#f3f4f6', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
              <div style={{ width: '70%', height: '24px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
              <div style={{ width: '40%', height: '20px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
            </div>

            {/* Middle Config Skeleton */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ width: '100%', height: '120px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}></div>
              <div style={{ width: '100%', height: '220px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}></div>
            </div>

            {/* Right Panel Skeleton */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ width: '100%', height: '180px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}></div>
              <div style={{ width: '100%', height: '140px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}></div>
            </div>

          </div>

          <div style={{ textAlign: 'center', marginTop: '40px', color: '#6b7280', fontWeight: 600, fontSize: '14px' }}>
            Fetching product specs & pricing live from database...
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
            {error || 'The requested product could not be found in our database catalog.'}
          </p>
          <button onClick={() => navigate('/products')} className="btn-primary" style={{ padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
            Return to Products Catalog
          </button>
        </div>
      </div>
    );
  }

  const SIZE_GROUPS: Record<string, string[]> = {
    'Kids Sizes': ['2Y', '4Y', '6Y', '8Y', '10Y', '12Y'],
    'Adult Standard': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'Adult Plus (Special)': ['3XL', '4XL', '5XL']
  };

  const allSizes = Object.values(SIZE_GROUPS).flat();

  const totalQty = product?.requiresSizes
    ? Object.values(matrixSizes || {}).reduce((tot, map) => {
        if (!map || typeof map !== 'object') return tot;
        return tot + Object.values(map).reduce((s, v) => s + (v || 0), 0);
      }, 0)
    : (quantity || 0);



  const getEffectivePrice = (qty: number) => {
    const base = product?.startingPrice || 0;
    if (product?.applyVolumeDiscount) {
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

    addToCart({
      productId: product.id,
      name: product.name,
      category: product.category || 'Apparel',
      pricePerUnit: unitPrice,
      requiresSizes: !!product.requiresSizes,
      requiresColors: !!product.requiresColors,
      requiresMockup: !!product.requiresMockup,
      applyVolumeDiscount: !!product.applyVolumeDiscount,
      colorVariants: [
        {
          id: `cv_${Date.now()}`,
          color: activeColor || 'Default',
          colorHex: activeColor || '#000000',
          sizes: currentSizes
        }
      ],
      artwork: {
        file: artwork.file || null,
        previewUrl: artwork.previewUrl || '',
        mode: designMode,
        instructions,
        placements: artwork.placements || {}
      }
    });

    navigate('/cart');
  };

    const effectivePrice = getEffectivePrice(totalQty);

  const phoneStr = String(contactPhone || '919390771123').replace(/[^0-9]/g, '');
  const formattedWaPhone = phoneStr.length === 10 ? `91${phoneStr}` : (phoneStr || '919390771123');
  const waHelpUrl = `https://wa.me/${formattedWaPhone}?text=${encodeURIComponent(`Hi Teepresso Team! I need help with design for ${product?.name || 'custom apparel'}`)}`;

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
              <img src={product?.image || '/images/mockups/tshirt-blank.svg'} className={styles.mainImage} alt={product.name} />
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
                {(Array.isArray(product?.colors) ? product.colors : []).map(c => (
                  <div key={c} className={styles.colorItem} onClick={() => setActiveColor(c)}>
                    <div className={`${styles.colorCircle} ${activeColor === c ? styles.colorCircleActive : ''}`} style={{ backgroundColor: c }}>
                      {activeColor === c && <ShieldCheck size={14} color={c === '#ffffff' ? '#000' : '#fff'} />}
                    </div>
                    <span className={styles.colorName}>{c.startsWith('#') ? 'Color' : c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>{product.requiresColors ? '2. Choose Size & Quantity' : '1. Choose Size & Quantity'}</h3>
            
            {product.requiresSizes ? (
              <div className={styles.sizeCategories}>
                {Object.entries(SIZE_GROUPS).map(([category, categorySizes]) => {
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
