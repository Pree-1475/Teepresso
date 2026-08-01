'use client';

import React from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { Button } from '@/components/ui/Button/Button';
import styles from './Step.module.css';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export function Step3SizeDistribution() {
  const { state, updateProductSizes, nextStep, prevStep } = useOrderFlow();

  const handleSizeChange = (productId: string, size: string, value: string) => {
    const num = parseInt(value) || 0;
    const product = state.products.find(p => p.id === productId);
    if (product) {
      updateProductSizes(productId, { ...product.sizes, [size]: num });
    }
  };

  const getProductTotal = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    if (!product) return 0;
    return Object.values(product.sizes).reduce((sum, qty) => sum + (qty || 0), 0);
  };

  const isComplete = state.products.every(p => getProductTotal(p.id) > 0);

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.title}>Quantities & Sizes</h2>
      <p className={styles.description}>Enter the breakdown of sizes for each product in your order.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)', marginTop: 'var(--spacing-6)' }}>
        {state.products.map(product => (
          <div key={product.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{product.name}</h3>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                Total: {getProductTotal(product.id)}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: 'var(--spacing-2)' }}>
              {sizes.map(size => (
                <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
                  <label style={{ fontSize: 'var(--text-xs)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>{size}</label>
                  <input 
                    type="number"
                    min="0"
                    value={product.sizes[size] || ''}
                    onChange={(e) => handleSizeChange(product.id, size, e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: 'var(--spacing-2)', 
                      textAlign: 'center', 
                      border: '1px solid var(--color-border)', 
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-background)'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {!isComplete && (
        <div style={{ marginTop: 'var(--spacing-4)', padding: 'var(--spacing-3)', backgroundColor: 'var(--color-warning-50)', color: 'var(--color-warning-text)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
          Please enter at least one quantity for each selected product to continue.
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button variant="primary" onClick={nextStep} disabled={!isComplete}>
          Continue to Colors
        </Button>
      </div>
    </div>
  );
}
