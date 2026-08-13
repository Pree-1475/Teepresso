'use client';

import React, { useState } from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { Button } from '@/common/components/ui/Button/Button';
import { CheckCircle2, ShieldCheck, Lock, CreditCard, Sparkles, MessageCircle, ArrowLeft } from 'lucide-react';
import styles from './Step.module.css';

export function Step8ReviewOrder() {
  const { state, completePayment, grandTotal, totalPieces, prevStep } = useOrderFlow();
  const { customer, product, paymentCompleted, orderId } = state;
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      completePayment();
      setIsProcessing(false);
    }, 1200);
  };

  if (paymentCompleted) {
    return (
      <div className={styles.successScreenBox}>
        <div className={styles.successIconWrapper}>
          <CheckCircle2 size={64} color="var(--color-primary-600)" />
        </div>

        <span className={styles.successBadge}>ORDER CONFIRMED • ID #{orderId}</span>
        <h2 className={styles.successTitle}>Your design request has been sent to our design team!</h2>
        
        <p className={styles.successDesc}>
          Thank you, <strong>{customer.name}</strong>! We have received your order for <strong>{totalPieces} pieces</strong> of <strong>{product.name} ({product.color})</strong>.
        </p>

        <div className={styles.nextStepsCard}>
          <h3 className={styles.nextStepsTitle}>What happens next?</h3>
          <ul className={styles.nextStepsList}>
            <li>1. Our Editing Team is reviewing your uploaded artwork and mockup coordinates.</li>
            <li>2. You will receive a high-res digital proof on WhatsApp (<strong>{customer.phone}</strong>) within 2 hours.</li>
            <li>3. Once you reply &quot;Approved&quot; on WhatsApp, production begins immediately!</li>
          </ul>
        </div>

        <div className={styles.whatsappHelpBtn}>
          <MessageCircle size={20} color="#25D366" />
          <span>Connect directly with your Teepresso Designer on WhatsApp</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepContainer}>
      <span className={styles.stepBadge}>STEP 8 OF 8 • PAYMENT & CONFIRMATION</span>
      <h2 className={styles.title}>Complete Order & Secure Payment</h2>
      <p className={styles.description}>Final step! Authorize payment to submit your order to our editing and production pipeline.</p>

      <div className={styles.paymentCard}>
        <div className={styles.paymentHeader}>
          <Lock size={20} color="var(--color-primary-600)" />
          <span>256-Bit Encrypted Secure Checkout</span>
        </div>

        <div className={styles.paymentAmountRow}>
          <div>
            <div className={styles.payLabel}>Total Amount Payable</div>
            <div className={styles.payAmount}>₹{grandTotal.toLocaleString('en-IN')}</div>
          </div>
          <span className={styles.gstTag}>Includes Taxes & Free Proofing</span>
        </div>

        <div className={styles.paymentMethodsNotice}>
          <CreditCard size={18} color="var(--color-text-secondary)" />
          <span>Supports UPI (GPay, PhonePe, Paytm), Net Banking, Cards & NEFT</span>
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handlePayNow}
          disabled={isProcessing}
          style={{ height: '52px', fontSize: '18px' }}
        >
          {isProcessing ? 'Processing Payment...' : `Pay ₹${grandTotal.toLocaleString('en-IN')} & Confirm Order`}
        </Button>
      </div>

      <div className={styles.actions} style={{ marginTop: 'var(--spacing-6)' }}>
        <Button variant="outline" onClick={prevStep} leftIcon={<ArrowLeft size={16} />}>Back to Delivery</Button>
      </div>
    </div>
  );
}
