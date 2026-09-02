'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import styles from './CartDrawer.module.css';
import { X, ShoppingBag, ArrowRight, Sparkles, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CartDrawer() {
  const { cart, isCartDrawerOpen, setIsCartDrawerOpen, removeFromCart, addToCart } = useCart();
  const navigate = useNavigate();

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

  const hasPagdi = cart.items.some(item => 
    item.productId.includes('pagdi') || 
    item.name.toLowerCase().includes('pagdi')
  );

  const shouldRecommendPagdi = hasKurta && !hasPagdi;

  const handleAddPagdi = () => {
    addToCart({
      productId: 'royal-festive-pagdi',
      name: 'Royal Bandhani Festive Pagdi',
      category: 'Accessories',
      pricePerUnit: 299,
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
                  src={item.name.toLowerCase().includes('pagdi') ? 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80' : '/images/mockups/tshirt-blank.svg'} 
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

          {/* FESTIVE PAGDI CROSS-SELL RECOMMENDATION */}
          {cart.items.length > 0 && shouldRecommendPagdi && (
            <div className={styles.recommendationBox} style={{
              backgroundColor: '#fffbeb',
              border: '1.5px dashed #f59e0b',
              borderRadius: '10px',
              padding: '14px',
              marginTop: '16px',
              marginBottom: '16px'
            }}>
              <div className={styles.recommendationHeader} style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px'
              }}>
                <Sparkles size={14} color="#d97706" /> Complete Your Royal Festive Outfit!
              </div>

              <div className={styles.recommendationContent} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img 
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80" 
                  alt="Royal Bandhani Pagdi" 
                  style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #fcd34d' }} 
                />
                <div className={styles.recommendationInfo} style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '13px', color: '#78350f', fontWeight: 700 }}>Royal Bandhani Festive Pagdi</h4>
                  <p style={{ margin: '2px 0 6px 0', fontSize: '11px', color: '#92400e' }}>Traditional handcrafted Rajasthani Zari Safah.</p>
                  <button 
                    className={styles.recommendationBtn}
                    onClick={handleAddPagdi}
                    style={{
                      backgroundColor: '#d97706',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={12} /> Add Pagdi (₹299)
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
