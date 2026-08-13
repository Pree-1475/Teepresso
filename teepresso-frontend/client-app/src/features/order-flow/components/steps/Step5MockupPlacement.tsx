'use client';

import React from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { Button } from '@/common/components/ui/Button/Button';
import { MockupCanvasEditor } from '../MockupCanvasEditor';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import styles from './Step.module.css';

export function Step5MockupPlacement() {
  const { nextStep, prevStep } = useOrderFlow();

  return (
    <div className={styles.stepContainer}>
      <span className={styles.stepBadge}>STEP 5 OF 8 • MOCKUP & PLACEMENT</span>
      <h2 className={styles.title}>Visual Mockup Editor</h2>
      <p className={styles.description}>
        Adjust your artwork scale, rotation, and position on the front or back view. Or switch to design assistance!
      </p>

      <MockupCanvasEditor />

      <div className={styles.actions} style={{ marginTop: 'var(--spacing-6)' }}>
        <Button variant="outline" onClick={prevStep} leftIcon={<ArrowLeft size={16} />}>Back</Button>
        <Button variant="primary" size="lg" onClick={nextStep} rightIcon={<ArrowRight size={18} />}>
          Review Order Summary
        </Button>
      </div>
    </div>
  );
}
