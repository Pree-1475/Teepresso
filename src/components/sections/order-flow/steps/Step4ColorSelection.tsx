'use client';

import React from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import styles from './Step.module.css';

const commonColors = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#0B1C3F' },
  { name: 'Heather Grey', hex: '#9AA0A6' },
  { name: 'Red', hex: '#C52233' },
  { name: 'Royal Blue', hex: '#1D4ED8' },
];

export function Step4ColorSelection() {
  const { state, updateProductColors, nextStep, prevStep } = useOrderFlow();

  const isComplete = state.products.every(p => p.colors.primary);

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.title}>Garment Colors</h2>
      <p className={styles.description}>Select the primary color for each product. Add any special requests if you need a specific Pantone match.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)', marginTop: 'var(--spacing-6)' }}>
        {state.products.map(product => (
          <div key={product.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-6)' }}>
            <h3 style={{ margin: '0 0 var(--spacing-4) 0', fontSize: 'var(--text-lg)' }}>{product.name}</h3>
            
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Primary Color *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-3)' }}>
                {commonColors.map(color => (
                  <button
                    key={color.hex}
                    onClick={() => updateProductColors(product.id, { primary: color.name })}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: color.hex,
                      border: product.colors.primary === color.name ? '3px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                      boxShadow: product.colors.primary === color.name ? '0 0 0 2px var(--color-surface) inset' : 'none',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    title={color.name}
                    aria-label={`Select ${color.name}`}
                  />
                ))}
              </div>
            </div>

            <Input 
              label="Special Color Request (Pantone / Custom)" 
              value={product.colors.specialRequest || ''}
              onChange={(e) => updateProductColors(product.id, { specialRequest: e.target.value })}
              placeholder="e.g. Pantone 186 C"
            />
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button variant="primary" onClick={nextStep} disabled={!isComplete}>
          Continue to Artwork
        </Button>
      </div>
    </div>
  );
}
