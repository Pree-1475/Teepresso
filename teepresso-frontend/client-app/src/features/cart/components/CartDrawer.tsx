'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import styles from './CartDrawer.module.css';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CartDrawer() {
  const { cart, isCartDrawerOpen, setIsCartDrawerOpen, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    navigate('/checkout');
  };



  const hasKurta = cart.items.some(item => item.category === 'Kurtas' || item.id === 'custom-kurta-seasonal');
  const hasPagdi = cart.items.some(item => item.productId === 'festive-pagdi');
  const shouldRecommendPagdi = hasKurta && !hasPagdi;

  return (
    <>
      <div className={styles.drawerOverlay} onClick={() => setIsCartDrawerOpen(false)} />
      <div className={`${styles.drawerContent} ${isCartDrawerOpen ? styles.drawerContentOpen : ''}`}>
        
        <div className={styles.drawerHeader}>
          <h2>Your Cart</h2>
          <button className={styles.closeBtn} onClick={() => setIsCartDrawerOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          {cart.items.length === 0 ? (
            <div className={styles.emptyState}>
              <ShoppingBag size={48} style={{ marginBottom: '16px', color: '#ccc' }} />
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything yet.</p>
            </div>
          ) : (
            cart.items.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <img src={item.image || 'https://images.unsplash.com/photo-1610996843657-3f82fc464c17?auto=format&fit=crop&q=80&w=800'} alt={item.name} className={styles.itemImage} />
                
                <div className={styles.itemDetails}>
                  <div className={styles.itemName}>{item.name}</div>
                  
                  {(() => {
                    const getColorName = (hexOrName: string) => {
                      const mapping: Record<string, string> = {
                        '#8c5b45': 'Brown',
                        '#d2c4b4': 'Beige',
                        '#d35400': 'Saffron Orange',
                        '#27ae60': 'Emerald Green',
                        '#8e44ad': 'Royal Purple',
                        '#1f1d1c': 'Charcoal Black',
                        '#ffffff': 'Classic White',
                      };
                      return mapping[hexOrName.toLowerCase()] || hexOrName;
                    };

                    return item.colorVariants.map((variant, idx) => {
                      const qty = item.requiresSizes
                        ? Object.values(variant.sizes).reduce((sum, q) => sum + (q || 0), 0)
                        : variant.quantity;
                      
                      const sizesList = item.requiresSizes
                        ? Object.entries(variant.sizes)
                            .filter(([_, q]) => q > 0)
                            .map(([sz, q]) => `${sz} (${q})`)
                            .join(', ')
                        : '';

                      return (
                        <div key={idx} className={styles.itemMeta} style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          {item.requiresColors && (
                            <div>Color: <strong>{getColorName(variant.color)}</strong></div>
                          )}
                          {item.requiresSizes ? (
                            <div>Sizes: <strong>{sizesList || 'None Selected'}</strong></div>
                          ) : (
                            <div>Quantity: <strong>{qty}</strong></div>
                          )}
                        </div>
                      );
                    });
                  })()}

                  <div className={styles.itemMeta}>
                    {item.artwork.mode === 'has_design' && <span style={{ color: '#10b981' }}>✓ Design selected</span>}
                    {item.artwork.mode === 'need_help' && <span style={{ color: '#f59e0b' }}>✓ Design help requested</span>}
                  </div>

                  <div className={styles.itemPriceRow}>
                    <span className={styles.itemPrice}>₹{item.totalItemPrice.toLocaleString('en-IN')}</span>
                    <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}

          {cart.items.length > 0 && shouldRecommendPagdi && (
            <div className={styles.recommendationBox}>
              <div className={styles.recommendationHeader}>✨ Perfect match for your Kurta!</div>
              <div className={styles.recommendationContent}>
                <img src={'/images/products/pagdi-mockup.jpg'} alt="Festive Pagdi" className={styles.recommendationImg} />
                <div className={styles.recommendationInfo}>
                  <h4>Festive Pagdi</h4>
                  <p>Complete your traditional look with our premium pagdi.</p>
                  <button 
                    className={styles.recommendationBtn}
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      navigate('/product/festive-pagdi');
                    }}
                  >
                    View Details
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
              Proceed to Checkout <ArrowRight size={20} />
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
