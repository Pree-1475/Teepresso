'use client';

import React from 'react';
import { useOrderFlow } from './OrderFlowContext';
import { Check } from 'lucide-react';
import styles from './StepProgress.module.css';

const STEPS = [
  { num: 1, label: 'Customer' },
  { num: 2, label: 'Product' },
  { num: 3, label: 'Quantities' },
  { num: 4, label: 'Artwork' },
  { num: 5, label: 'Mockup' },
  { num: 6, label: 'Review' },
  { num: 7, label: 'Delivery' },
  { num: 8, label: 'Payment' },
];

export function StepProgress() {
  const { state, setStep } = useOrderFlow();
  const { currentStep } = state;

  const currentLabel = STEPS[currentStep - 1]?.label || 'Configurator';
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className={styles.container}>
      {/* Mobile Stepper Header */}
      <div className={styles.mobileHeader}>
        <span className={styles.mobileText}>STEP {currentStep} OF {STEPS.length}</span>
        <span className={styles.mobileStepTitle}>{currentLabel}</span>
      </div>

      {/* Progress Line */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Desktop Stepper Nodes */}
      <div className={styles.desktopSteps}>
        <div className={styles.stepTrackLine}>
          <div className={styles.stepTrackFill} style={{ width: `${progressPercent}%` }} />
        </div>

        {STEPS.map((step) => {
          const isCompleted = currentStep > step.num;
          const isActive = currentStep === step.num;

          return (
            <button
              key={step.num}
              type="button"
              className={`${styles.stepNode} ${isCompleted ? styles.completed : ''} ${isActive ? styles.active : ''}`}
              onClick={() => step.num < currentStep && setStep(step.num)}
              disabled={step.num > currentStep}
            >
              <div className={styles.stepBubble}>
                {isCompleted ? <Check size={14} strokeWidth={3} /> : step.num}
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
