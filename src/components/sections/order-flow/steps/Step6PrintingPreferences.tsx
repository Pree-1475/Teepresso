'use client';

import React from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { Button } from '@/components/ui/Button/Button';
import { Card, CardContent } from '@/components/ui/Card/Card';
import styles from './Step.module.css';

const placements = ['Front', 'Back', 'Left Chest', 'Right Chest', 'Left Sleeve', 'Right Sleeve', 'Neck Label'];
const methods = ['Screen Printing', 'Embroidery', 'Direct to Film (DTF)', 'Direct to Garment (DTG)', 'Not Sure - Recommend Best'];

export function Step6PrintingPreferences() {
  const { state, updatePrintingPreferences, nextStep, prevStep } = useOrderFlow();

  const togglePlacement = (placement: string) => {
    const current = state.printingPreferences.placements;
    if (current.includes(placement)) {
      updatePrintingPreferences({ placements: current.filter(p => p !== placement) });
    } else {
      updatePrintingPreferences({ placements: [...current, placement] });
    }
  };

  const isComplete = state.printingPreferences.placements.length > 0 && state.printingPreferences.method !== '';

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.title}>Printing Preferences</h2>
      <p className={styles.description}>Let us know where and how you want your artwork applied.</p>
      
      <div style={{ marginTop: 'var(--spacing-6)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--spacing-4)' }}>Print Placement(s) *</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-3)' }}>
          {placements.map(placement => {
            const isSelected = state.printingPreferences.placements.includes(placement);
            return (
              <button
                key={placement}
                onClick={() => togglePlacement(placement)}
                style={{
                  padding: 'var(--spacing-3) var(--spacing-5)',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-primary-50)' : 'var(--color-surface)',
                  color: isSelected ? 'var(--color-primary-700)' : 'var(--color-text-secondary)',
                  fontWeight: isSelected ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {placement}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 'var(--spacing-8)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--spacing-4)' }}>Printing Method *</h3>
        <div className={styles.selectionGrid}>
          {methods.map(method => {
            const isSelected = state.printingPreferences.method === method;
            return (
              <Card 
                key={method} 
                hoverable 
                onClick={() => updatePrintingPreferences({ method })}
                style={{ 
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--color-primary-600)' : undefined, 
                  backgroundColor: isSelected ? 'var(--color-primary-50)' : undefined 
                }}
              >
                <CardContent style={{ padding: 'var(--spacing-4)', textAlign: 'center' }}>
                  <span style={{ 
                    fontWeight: isSelected ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                    color: isSelected ? 'var(--color-primary-800)' : 'var(--color-text-primary)'
                  }}>
                    {method}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button variant="primary" onClick={nextStep} disabled={!isComplete}>
          Continue to Notes
        </Button>
      </div>
    </div>
  );
}
