'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import styles from './CartDrawer.module.css';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS_CATALOG } from '@/features/catalog/data/productsData';

export function CartDrawer() {
  const { cart, isCartDrawerOpen, setIsCartDrawerOpen, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    navigate('/checkout');
  };

  const getProductImage = (productId: string) => {
    const p = PRODUCTS_CATALOG.find(x => x.id === productId);
    return p?.image || '';
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
                <img src={getProductImage(item.productId)} alt={item.name} className={styles.itemImage} />
                
                <div className={styles.itemDetails}>
                  <div className={styles.itemName}>{item.name}</div>
                  
                  {item.colorVariants.map((variant, idx) => (
                    <div key={idx} className={styles.itemMeta}>
                      {item.requiresColors && (
                        <span>Color: <strong>{variant.color}</strong><br/></span>
                      )}
                      <span>Quantity: {item.totalItemQuantity}</span>
                    </div>
                  ))}

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
                <img src={getProductImage('festive-pagdi')} alt="Festive Pagdi" className={styles.recommendationImg} />
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
