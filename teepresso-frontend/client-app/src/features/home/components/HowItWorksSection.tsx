"use client";

import React from 'react';
import {
  ClipboardList,
  UploadCloud,
  CheckCircle2,
  Layers,
  PackageCheck,
  LucideIcon
} from 'lucide-react';
import styles from './HowItWorksSection.module.css';

interface OrderStep {
  title: string;
  description: string;
  icon: LucideIcon;
}

const steps: OrderStep[] = [
  {
    title: 'Submit Requirements',
    description: 'Select your apparel styles, colors, and piece count.',
    icon: ClipboardList,
  },
  {
    title: 'Upload Artwork',
    description: 'Share your logo or artwork for a print-readiness check.',
    icon: UploadCloud,
  },
  {
    title: 'Approve Mockup',
    description: 'Review and sign off on your digital proof before print begins.',
    icon: CheckCircle2,
  },
  {
    title: 'Production',
    description: 'Precision printing and tailoring crafted with premium fabrics.',
    icon: Layers,
  },
  {
    title: 'Delivered',
    description: 'Carefully packed and delivered right to your doorstep on schedule.',
    icon: PackageCheck,
  },
];

export function HowItWorksSection() {
  return (
    <section className={styles.section} id="how-it-works">
      <div className="container">
        
        {/* Section Header */}
        <div className={styles.header}>
          <span className={styles.label}>YOUR ORDER JOURNEY</span>
          <h2 className={styles.heading}>From Idea to Delivery</h2>
          <p className={styles.subtitle}>
            A simple, transparent process for your custom apparel order.
          </p>
        </div>

        {/* 5-Step Order Journey */}
        <div className={styles.stepsContainer}>
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === steps.length - 1;

            return (
              <div key={idx} className={styles.stepItem}>
                
                {/* Icon Circle with Connecting Line */}
                <div className={styles.iconWrapper}>
                  <div className={styles.iconCircle}>
                    <Icon size={22} strokeWidth={1.75} className={styles.stepIcon} />
                  </div>
                  {!isLast && <div className={styles.connectorLine} aria-hidden="true" />}
                </div>

                {/* Content */}
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.description}</p>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default HowItWorksSection;
