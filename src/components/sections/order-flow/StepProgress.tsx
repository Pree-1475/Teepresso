'use client';
import React from 'react';
import { useOrderFlow } from './OrderFlowContext';
import styles from './StepProgress.module.css';

const steps = [
  'Business Info', 'Products', 'Quantities', 'Colors', 'Artwork', 'Printing', 'Notes', 'Review', 'Submit'
];

export function StepProgress() {
  const { state } = useOrderFlow();

  return (
    <div className={styles.container}>
      <p className={styles.mobileText}>Step {state.currentStep} of 9: {steps[state.currentStep - 1]}</p>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${(state.currentStep / 9) * 100}%` }} />
      </div>
      <div className={styles.desktopSteps}>
        {steps.map((step, index) => (
          <div key={index} className={`${styles.stepIndicator} ${state.currentStep > index + 1 ? styles.completed : ''} ${state.currentStep === index + 1 ? styles.active : ''}`}>
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
