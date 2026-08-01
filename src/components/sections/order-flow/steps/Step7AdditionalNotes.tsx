'use client';

import React from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { Button } from '@/components/ui/Button/Button';
import styles from './Step.module.css';

export function Step7AdditionalNotes() {
  const { state, updateAdditionalNotes, nextStep, prevStep } = useOrderFlow();

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.title}>Additional Notes</h2>
      <p className={styles.description}>Any special requests, packaging instructions, or specific deadlines?</p>
      
      <div style={{ marginTop: 'var(--spacing-6)' }}>
        <textarea
          value={state.additionalNotes}
          onChange={(e) => updateAdditionalNotes(e.target.value)}
          placeholder="e.g. Please individually polybag all XL sizes. We need these delivered by October 15th for our annual event."
          style={{
            width: '100%',
            minHeight: '150px',
            padding: 'var(--spacing-4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            resize: 'vertical'
          }}
        />
      </div>

      <div className={styles.actions}>
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button variant="primary" onClick={nextStep}>
          Review Order
        </Button>
      </div>
    </div>
  );
}
