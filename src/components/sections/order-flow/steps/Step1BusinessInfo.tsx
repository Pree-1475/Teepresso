'use client';

import React from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import styles from './Step.module.css';

export function Step1BusinessInfo() {
  const { state, updateContactInfo, nextStep } = useOrderFlow();
  const { contactInfo } = state;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateContactInfo({ [e.target.name]: e.target.value });
  };

  const isComplete = contactInfo.companyName && contactInfo.contactPerson && contactInfo.email && contactInfo.phone;

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.title}>Business Information</h2>
      <p className={styles.description}>Let&apos;s start with the basics. Who are we partnering with?</p>
      
      <div className={styles.formGrid}>
        <Input 
          label="Company / Institution Name *" 
          name="companyName"
          value={contactInfo.companyName}
          onChange={handleChange}
          placeholder="e.g. Acme Corp"
        />
        <Input 
          label="Contact Person *" 
          name="contactPerson"
          value={contactInfo.contactPerson}
          onChange={handleChange}
          placeholder="e.g. Jane Doe"
        />
        <Input 
          label="Email Address *" 
          type="email"
          name="email"
          value={contactInfo.email}
          onChange={handleChange}
          placeholder="jane@acmecorp.com"
        />
        <Input 
          label="Phone Number *" 
          type="tel"
          name="phone"
          value={contactInfo.phone}
          onChange={handleChange}
          placeholder="(555) 123-4567"
        />
        <Input 
          label="Delivery Location / City *" 
          name="deliveryLocation"
          value={contactInfo.deliveryLocation}
          onChange={handleChange}
          placeholder="e.g. New York, NY"
        />
        <Input 
          label="GST / Tax ID (Optional)" 
          name="gst"
          value={contactInfo.gst}
          onChange={handleChange}
          placeholder="For B2B invoicing"
        />
      </div>
      
      <div className={styles.actions}>
        <Button variant="primary" onClick={nextStep} disabled={!isComplete}>
          Continue to Products
        </Button>
      </div>
    </div>
  );
}
