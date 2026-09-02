'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useStorefront } from '@/common/context/StorefrontContext';
import styles from './CartDrawer.module.css';
import { X, ShoppingBag, ArrowRight, Sparkles, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/common/config/api';

export function CartDrawer() {
  const { cart, isCartDrawerOpen, setIsCartDrawerOpen, removeFromCart, addToCart } = useCart();
  const { festiveRecommendationProductId } = useStorefront();
  const navigate = useNavigate();

  const [recProduct, setRecProduct] = useState<any>(null);

  useEffect(() => {
    if (!festiveRecommendationProductId) return;
    fetch(`${API_BASE_URL}/products/${festiveRecommendationProductId}`)
      .then(r => r.json())
      .then(data => {
        if (data?.success && data?.product) {
          setRecProduct(data.product);
        }
      })
      .catch(() => null);
  }, [festiveRecommendationProductId]);

  if (!isCartDrawerOpen) return null;

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    navigate('/checkout');
  };

  const hasKurta = cart.items.some(item => 
    item.category === 'Kurtas' || 
    item.productId.includes('kurta') || 
    item.name.toLowerCase().includes('kurta')
  );

  const targetRecId = recProduct?.id || 'royal-festive-pagdi';

  const hasPagdi = cart.items.some(item => 
    item.productId === targetRecId || 
    item.name.toLowerCase().includes('pagdi')
  );

  const shouldRecommendPagdi = hasKurta && !hasPagdi;

  const handleAddPagdi = () => {
    const pName = recProduct?.name || 'Royal Bandhani Festive Pagdi';
    const pPrice = Number(recProduct?.startingPrice || 299);
    const pCat = recProduct?.category || 'Accessories';

    addToCart({
      productId: targetRecId,
      name: pName,
      category: pCat,
      pricePerUnit: pPrice,
      requiresSizes: false,
      requiresColors: true,
      requiresMockup: false,
      applyVolumeDiscount: false,
      colorVariants: [
        {
          id: `cv_${Date.now()}`,
          color: 'Saffron Yellow',
          colorHex: '#e5c158',
          sizes: { 'Free Size': 1 }
        }
      ],
      artwork: {
        file: null,
        previewUrl: '',
        mode: 'none',
        instructions: '',
        placements: {}
      }
    });
  };

  const pTitle = recProduct?.name || 'Royal Bandhani Festive Pagdi';
  const pSubheading = recProduct?.shortDesc?.includes('Pagdi') ? 'Royal Bandhani Pagdi' : (recProduct?.name || 'Royal Bandhani Pagdi');
  const pDesc = recProduct?.shortDesc || 'Traditional handcrafted Rajasthani Zari Safah.';
  const pPrice = Number(recProduct?.startingPrice || 299);
  const pImg = recProduct?.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80';

  return (
    <>
      <div className={styles.drawerOverlay} onClick={() => setIsCartDrawerOpen(false)} />
      <div className={`${styles.drawerContent} ${isCartDrawerOpen ? styles.drawerContentOpen : ''}`}>
        
        <div className={styles.drawerHeader}>
          <h2>Your Shopping Cart ({cart.items.reduce((s, i) => s + (i.totalItemQuantity || 1), 0)} items)</h2>
          <button className={styles.closeBtn} onClick={() => setIsCartDrawerOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          {cart.items.length === 0 ? (
            <div className={styles.emptyState}>
              <ShoppingBag size={48} style={{ marginBottom: '16px', color: '#ccc' }} />
              <h3>Your cart is empty</h3>
              <p>Explore our catalog to add products to your cart.</p>
              <button 
                className="btn-primary" 
                onClick={() => { setIsCartDrawerOpen(false); navigate('/products'); }}
                style={{ marginTop: '16px', padding: '8px 20px', cursor: 'pointer' }}
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            cart.items.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <img 
                  src={item.name.toLowerCase().includes('pagdi') ? pImg : '/images/mockups/tshirt-blank.svg'} 
                  alt={item.name} 
                  className={styles.itemImage} 
                />
                
                <div className={styles.itemDetails}>
                  <div className={styles.itemName}>{item.name}</div>
                  
                  {item.colorVariants.map((variant, idx) => (
                    <div key={idx} className={styles.itemMeta} style={{ marginBottom: '6px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                        Color: <strong>{variant.color}</strong>
                        {variant.pattern && (
                          <span style={{ color: '#d97706', marginLeft: '6px' }}>• Pattern: {variant.pattern}</span>
                        )}
                      </div>
                      
                      {item.requiresSizes && variant.sizes && (
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                          Sizes: {Object.entries(variant.sizes)
                            .filter(([_, qty]) => (qty || 0) > 0)
                            .map(([sz, qty]) => `${sz} × ${qty}`)
                            .join(', ') || 'Standard'}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className={styles.itemMeta} style={{ margin: '4px 0' }}>
                    {item.artwork.mode === 'has_design' && <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 600 }}>✓ Custom Artwork Included</span>}
                    {item.artwork.mode === 'need_help' && <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 600 }}>✓ Design Assistance Requested</span>}
                  </div>

                  <div className={styles.itemPriceRow}>
                    <span className={styles.itemPrice}>₹{item.totalItemPrice.toLocaleString('en-IN')}</span>
                    <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* DYNAMIC FESTIVE CROSS-SELL RECOMMENDATION */}
          {cart.items.length > 0 && shouldRecommendPagdi && (
            <div className={styles.recommendationBox} style={{
              backgroundColor: '#fffbeb',
              border: '1.5px dashed #f59e0b',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '16px',
              marginBottom: '16px'
            }}>
              {/* Badge */}
              <div style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <Sparkles size={14} color="#d97706" /> Complete Your Royal Festive Outfit!
              </div>

              {/* Subheading */}
              <div 
                style={{ fontSize: '11px', fontWeight: 600, color: '#92400e', marginBottom: '8px', cursor: 'pointer' }}
                onClick={() => { setIsCartDrawerOpen(false); navigate(`/product/${targetRecId}`); }}
              >
                Royal Bandhani Pagdi
              </div>

              <div className={styles.recommendationContent} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <img 
                  src={pImg} 
                  alt={pTitle} 
                  style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #fcd34d', cursor: 'pointer' }} 
                  onClick={() => { setIsCartDrawerOpen(false); navigate(`/product/${targetRecId}`); }}
                />
                <div className={styles.recommendationInfo} style={{ flex: 1 }}>
                  {/* Product Title */}
                  <h4 
                    style={{ margin: 0, fontSize: '14px', color: '#78350f', fontWeight: 800, cursor: 'pointer' }}
                    onClick={() => { setIsCartDrawerOpen(false); navigate(`/product/${targetRecId}`); }}
                  >
                    {pTitle}
                  </h4>
                  {/* Description */}
                  <p style={{ margin: '4px 0 8px 0', fontSize: '11px', color: '#92400e', lineHeight: '1.3' }}>{pDesc}</p>
                  
                  {/* Action Button */}
                  <button 
                    className={styles.recommendationBtn}
                    onClick={handleAddPagdi}
                    style={{
                      backgroundColor: '#d97706',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={14} /> Add Pagdi (₹{pPrice})
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className={styles.drawerFooter}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Subtotal</span>
              <span className={styles.totalValue}>₹{cart.subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              Proceed to Checkout <ArrowRight size={18} />
            </button>
            <button className={styles.continueShoppingBtn} onClick={() => setIsCartDrawerOpen(false)}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
