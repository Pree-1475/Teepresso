'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import styles from './Step.module.css';

export function Step9Success() {
  return (
    <div className={styles.stepContainer} style={{ textAlign: 'center', padding: 'var(--spacing-16) var(--spacing-8)' }}>
      <CheckCircle size={64} color="var(--color-success-text)" style={{ margin: '0 auto var(--spacing-6)' }} />
      <h2 style={{ fontSize: 'var(--text-4xl)', color: 'var(--color-primary-900)', marginBottom: 'var(--spacing-4)' }}>
        Your Request has been Submitted
      </h2>
      <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto var(--spacing-8)' }}>
        Thank you for choosing T Presso. Our team is reviewing your requirements, artwork, and printing preferences. 
        We will contact you within 24 hours with a comprehensive quote and digital mockup for approval.
      </p>
      
      <div style={{ padding: 'var(--spacing-6)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-lg)', maxWidth: '400px', margin: '0 auto var(--spacing-8)' }}>
        <h3 style={{ fontSize: 'var(--text-base)', margin: '0 0 var(--spacing-2) 0' }}>What happens next?</h3>
        <ol style={{ textAlign: 'left', color: 'var(--color-text-secondary)', margin: 0, paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <li>Our team reviews your submission.</li>
          <li>We prepare a detailed quote and timeline.</li>
          <li>We send a digital mockup for your final sign-off.</li>
          <li>Production begins immediately upon approval!</li>
        </ol>
      </div>

      <div>
        <Button variant="primary" onClick={() => window.location.href = '/'}>
          Return to Homepage
        </Button>
      </div>
    </div>
  );
}
