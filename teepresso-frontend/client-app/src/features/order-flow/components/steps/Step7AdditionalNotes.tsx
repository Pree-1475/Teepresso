'use client';

import React from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { Button } from '@/common/components/ui/Button/Button';
import { Input } from '@/common/components/ui/Input/Input';
import { MapPin, Truck, ArrowRight, ArrowLeft } from 'lucide-react';
import styles from './Step.module.css';

export function Step7AdditionalNotes() {
  const { state, updateDelivery, nextStep, prevStep } = useOrderFlow();
  const { delivery, isUrgentOrder } = state;

  const isValid = delivery.address.trim().length >= 5 && delivery.city.trim().length >= 2 && delivery.pincode.trim().length >= 5;

  return (
    <div className={styles.stepContainer}>
      <span className={styles.stepBadge}>STEP 7 OF 8 • DELIVERY ADDRESS</span>
      <h2 className={styles.title}>Where should we ship your batch?</h2>
      <p className={styles.description}>Provide the shipping destination for your bulk order.</p>

      {/* Delivery Notice */}
      <div className={styles.deliveryNoticeBox}>
        <Truck size={24} color="var(--color-primary-600)" />
        <div>
          <div className={styles.noticeTitle}>
            {isUrgentOrder ? '⚡ Express 48-Hour Priority Dispatch' : '📦 Standard Delivery: 4–5 Business Days'}
          </div>
          <div className={styles.noticeDesc}>
            All shipments are insured with live WhatsApp tracking provided upon dispatch.
          </div>
        </div>
      </div>

      <div className={styles.formGrid}>
        <Input
          label="Street Address / Building Name *"
          name="address"
          value={delivery.address}
          onChange={(e) => updateDelivery({ address: e.target.value })}
          placeholder="e.g. 102 Greenways Colony, MG Road"
          leftIcon={<MapPin size={18} color="var(--color-primary-600)" />}
        />

        <Input
          label="City / District *"
          name="city"
          value={delivery.city}
          onChange={(e) => updateDelivery({ city: e.target.value })}
          placeholder="e.g. Mumbai, Bengaluru, Delhi"
        />

        <Input
          label="Pincode *"
          name="pincode"
          value={delivery.pincode}
          onChange={(e) => updateDelivery({ pincode: e.target.value })}
          placeholder="e.g. 400001"
        />
      </div>

      <div className={styles.actions}>
        <Button variant="outline" onClick={prevStep} leftIcon={<ArrowLeft size={16} />}>Back</Button>
        <Button variant="primary" size="lg" onClick={nextStep} disabled={!isValid} rightIcon={<ArrowRight size={18} />}>
          Continue to Payment & Confirmation
        </Button>
      </div>
    </div>
  );
}
