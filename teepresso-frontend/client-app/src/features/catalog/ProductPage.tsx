'use client';

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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [activeColor, setActiveColor] = useState<string>('');
  
  // Config state
  const [sizes, setSizes] = useState<SizeQtyMap>({ ...defaultSizes });
  const [quantity, setQuantity] = useState<number>(0);
  
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

  const SIZE_GROUPS: Record<string, string[]> = {
    'Kids Sizes': ['2Y', '4Y', '6Y', '8Y', '10Y', '12Y'],
    'Adult Standard': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'Adult Plus (Special)': ['3XL', '4XL', '5XL']
  };

  const allSizes = Object.values(SIZE_GROUPS).flat();

  const totalQty = product.requiresSizes 
    ? allSizes.reduce((sum, sz) => sum + (sizes[sz] || 0), 0)
    : quantity;

  const getEffectivePrice = (qty: number) => {
    let price = product.startingPrice;
    if (product.applyVolumeDiscount) {
      if (totalQty >= 150) {
        price = Math.round(product.startingPrice * 0.8);
      } else if (totalQty >= 75) {
        price = Math.round(product.startingPrice * 0.9);
      }
    }
    return price;
  };

  const calculateTotal = () => {
    return totalQty * getEffectivePrice(totalQty);
  };

  const handleAddToCart = () => {
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
      pricePerUnit: getEffectivePrice(totalQty),
      requiresSizes: product.requiresSizes,
      requiresColors: product.requiresColors,
      requiresMockup: product.requiresMockup,
      applyVolumeDiscount: product.applyVolumeDiscount,
      colorVariants: [colorVariant],
      artwork: {
        ...artwork,
        instructions
      }
    });
  };

  const updateSize = (sz: keyof SizeQtyMap, delta: number) => {
    setSizes(prev => ({...prev, [sz]: Math.max(0, (prev[sz] || 0) + delta)}));
  };

  const setSizeDirect = (sz: keyof SizeQtyMap, val: number) => {
    setSizes(prev => ({...prev, [sz]: Math.max(0, val || 0)}));
  };

  const effectivePrice = getEffectivePrice(totalQty);

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
                {product.colors.map(c => (
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
                  const categoryTotal = categorySizes.reduce((sum, sz) => sum + (sizes[sz] || 0), 0);
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
                              const qty = sizes[sz] || 0;
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
