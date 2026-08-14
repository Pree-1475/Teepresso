'use client';

import React from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { ArrowRight } from 'lucide-react';
import styles from './Step.module.css';

export function Step1YourDetails() {
  const { state, updateCustomer, nextStep } = useOrderFlow();
  const { customer } = state;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim()) {
      alert('Please provide your Name and Phone Number to continue.');
      return;
    }
    nextStep();
  };

  return (
    <div className={`${styles.stepCard} ${styles.narrowCenteredCard}`}>
      <div className={styles.stepHeaderRow}>
        <div className={styles.stepTitleGroup}>
          <span className={styles.stepNumberBadge}>01</span>
          <h2 className={styles.stepTitle}>Your Details</h2>
        </div>
        <div className={styles.actionRowCompact}>
          <button type="button" className={styles.primaryBtnCompact} onClick={() => handleSubmit()}>
            Continue <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Full Name */}
          <div className={styles.inputField}>
            <label htmlFor="customer-name">Full Name *</label>
            <input
              id="customer-name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={customer.name}
              onChange={(e) => updateCustomer({ name: e.target.value })}
              required
              autoFocus
              style={{ padding: '8px 12px', borderRadius: '6px' }}
            />
          </div>

          {/* Phone */}
          <div className={styles.inputField}>
            <label htmlFor="customer-phone">Phone Number *</label>
            <input
              id="customer-phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={customer.phone}
              onChange={(e) => updateCustomer({ phone: e.target.value })}
              required
              style={{ padding: '8px 12px', borderRadius: '6px' }}
            />
          </div>

          {/* Email */}
          <div className={styles.inputField} style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="customer-email">Email Address</label>
            <input
              id="customer-email"
              type="email"
              placeholder="e.g. rahul@example.com"
              value={customer.email || ''}
              onChange={(e) => updateCustomer({ email: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px' }}
            />
          </div>

          {/* Organization / Group */}
          <div className={styles.inputField} style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="customer-org">Organization / College / Event</label>
            <input
              id="customer-org"
              type="text"
              placeholder="e.g. IIT Bombay Fest, Acme Corp"
              value={customer.organization || ''}
              onChange={(e) => updateCustomer({ organization: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px' }}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default Step1YourDetails;
