'use client';

import React from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { Button } from '@/common/components/ui/Button/Button';
import { Input } from '@/common/components/ui/Input/Input';
import { User, Phone, ArrowRight } from 'lucide-react';
import styles from './Step.module.css';

export function Step1BusinessInfo() {
  const { state, updateCustomer, nextStep } = useOrderFlow();
  const { customer } = state;

  const isValid = customer.name.trim().length >= 2 && customer.phone.trim().length >= 10;

  return (
    <div className={styles.stepContainer}>
      <span className={styles.stepBadge}>STEP 1 OF 8 • CUSTOMER DETAILS</span>
      <h2 className={styles.title}>Who is this order for?</h2>
      <p className={styles.description}>
        We keep things simple! Just enter your name and WhatsApp/phone number so we can link your design mockup.
      </p>

      <div className={styles.formGridSingle}>
        <Input
          label="Your Full Name *"
          name="name"
          value={customer.name}
          onChange={(e) => updateCustomer({ name: e.target.value })}
          placeholder="e.g. Rahul Sharma"
          leftIcon={<User size={18} color="var(--color-primary-600)" />}
        />

        <Input
          label="Phone / WhatsApp Number *"
          type="tel"
          name="phone"
          value={customer.phone}
          onChange={(e) => updateCustomer({ phone: e.target.value })}
          placeholder="e.g. 98765 43210"
          leftIcon={<Phone size={18} color="var(--color-primary-600)" />}
        />
      </div>

      <div className={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          onClick={nextStep}
          disabled={!isValid}
          rightIcon={<ArrowRight size={18} />}
        >
          Select Apparel & Color
        </Button>
      </div>
    </div>
  );
}
