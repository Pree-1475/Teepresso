'use client';

import React from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { Button } from '@/components/ui/Button/Button';
import { Edit2 } from 'lucide-react';
import styles from './Step.module.css';

export function Step8ReviewOrder() {
  const { state, setStep, nextStep, prevStep, totalQuantity } = useOrderFlow();

  const renderSectionHeader = (title: string, stepNumber: number) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
      <h3 style={{ fontSize: 'var(--text-lg)', margin: 0, color: 'var(--color-primary-900)' }}>{title}</h3>
      <Button variant="ghost" size="sm" leftIcon={<Edit2 size={14} />} onClick={() => setStep(stepNumber)}>
        Edit
      </Button>
    </div>
  );

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.title}>Review Your Request</h2>
      <p className={styles.description}>Please review all details before submitting for a quote.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)', marginTop: 'var(--spacing-6)' }}>
        
        {/* Business Info */}
        <section>
          {renderSectionHeader('1. Contact & Delivery', 1)}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)', fontSize: 'var(--text-sm)' }}>
            <div><span style={{ color: 'var(--color-text-secondary)' }}>Company:</span> <strong>{state.contactInfo.companyName}</strong></div>
            <div><span style={{ color: 'var(--color-text-secondary)' }}>Contact:</span> <strong>{state.contactInfo.contactPerson}</strong></div>
            <div><span style={{ color: 'var(--color-text-secondary)' }}>Email:</span> <strong>{state.contactInfo.email}</strong></div>
            <div><span style={{ color: 'var(--color-text-secondary)' }}>Phone:</span> <strong>{state.contactInfo.phone}</strong></div>
            <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--color-text-secondary)' }}>Delivery Location:</span> <strong>{state.contactInfo.deliveryLocation}</strong></div>
          </div>
        </section>

        {/* Products & Sizes */}
        <section>
          {renderSectionHeader('2 & 3. Products & Quantities', 3)}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            {state.products.map(p => (
              <div key={p.id} style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-4)' }}>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-2)' }}>{p.name}</div>
                <div style={{ display: 'flex', gap: 'var(--spacing-4)', fontSize: 'var(--text-sm)' }}>
                  {Object.entries(p.sizes).filter(([_, qty]) => (qty || 0) > 0).map(([size, qty]) => (
                    <div key={size}><span style={{ color: 'var(--color-text-secondary)' }}>{size}:</span> <strong>{qty}</strong></div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'right', fontWeight: 'var(--font-weight-bold)' }}>Total Items: {totalQuantity}</div>
          </div>
        </section>

        {/* Colors */}
        <section>
          {renderSectionHeader('4. Garment Colors', 4)}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', fontSize: 'var(--text-sm)' }}>
            {state.products.map(p => (
              <div key={p.id}><strong>{p.name}</strong>: {p.colors.primary} {p.colors.specialRequest && `(${p.colors.specialRequest})`}</div>
            ))}
          </div>
        </section>

        {/* Artwork */}
        <section>
          {renderSectionHeader('5. Artwork', 5)}
          <div style={{ fontSize: 'var(--text-sm)' }}>
            {state.needsDesignAssistance ? (
              <strong style={{ color: 'var(--color-primary-600)' }}>Requested Design Assistance</strong>
            ) : (
              state.artwork.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 'var(--spacing-4)' }}>
                  {state.artwork.map(a => <li key={a.id}>{a.name}</li>)}
                </ul>
              ) : (
                <span style={{ color: 'var(--color-warning-text)' }}>No artwork uploaded</span>
              )
            )}
          </div>
        </section>

        {/* Printing Preferences */}
        <section>
          {renderSectionHeader('6. Printing Preferences', 6)}
          <div style={{ fontSize: 'var(--text-sm)' }}>
            <div><span style={{ color: 'var(--color-text-secondary)' }}>Method:</span> <strong>{state.printingPreferences.method}</strong></div>
            <div style={{ marginTop: 'var(--spacing-2)' }}><span style={{ color: 'var(--color-text-secondary)' }}>Placements:</span> <strong>{state.printingPreferences.placements.join(', ')}</strong></div>
          </div>
        </section>

      </div>

      <div className={styles.actions}>
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button variant="primary" size="lg" onClick={nextStep}>
          Submit Quote Request
        </Button>
      </div>
    </div>
  );
}
