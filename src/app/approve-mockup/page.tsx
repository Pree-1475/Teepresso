'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Edit3, Send, ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { MOCK_ORDERS_DATABASE } from '@/data/trackingData';
import styles from './approval.module.css';

function ApprovalFlowContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order') || 'TP-2026-8842';

  const order = MOCK_ORDERS_DATABASE.find(o => o.orderId.toLowerCase() === orderId.toLowerCase()) || MOCK_ORDERS_DATABASE[0];

  const [status, setStatus] = useState<'pending' | 'approved' | 'revision'>('pending');
  const [showRevisionForm, setShowRevisionForm] = useState<boolean>(false);
  const [revisionNote, setRevisionNote] = useState<string>('');

  const handleApprove = () => {
    setStatus('approved');
    order.currentStage = 'Approved';
  };

  const handleSendRevision = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('revision');
    order.currentStage = 'Design in Progress';
    order.revisionRequested = true;
    order.revisionComment = revisionNote;
  };

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        
        {/* Header */}
        <div className={styles.heroHeader}>
          <span className={styles.heroBadge}>🎨 FINAL MOCKUP APPROVAL</span>
          <h1 className={styles.heroTitle}>Review Digital Proof</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Order ID: <strong>{order.orderId}</strong> • {order.totalPieces} Pcs ({order.productName})
          </p>
        </div>

        {/* Approval Card */}
        <div className={styles.approvalCard}>
          
          {/* Watermarked Mockup Canvas */}
          <div className={styles.mockupWatermarkedStage}>
            <img
              src={order.watermarkedMockupUrl}
              alt="Final Watermarked Mockup Proof"
              className={styles.mockupImage}
            />

            {/* Teepresso Watermark Overlay */}
            <div className={styles.watermarkPatternOverlay}>
              <span className={styles.watermarkText}>TEEPRESSO PROOF</span>
            </div>
          </div>

          {status === 'pending' && (
            <>
              <h2 className={styles.questionTitle}>Does this look good?</h2>

              <div className={styles.actionBtnGroup}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleApprove}
                  leftIcon={<Check size={18} />}
                  style={{ backgroundColor: '#217336' }}
                >
                  Approve Design
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowRevisionForm(!showRevisionForm)}
                  leftIcon={<Edit3 size={18} />}
                >
                  Request Changes
                </Button>
              </div>

              {/* Revision Request Form */}
              {showRevisionForm && (
                <form onSubmit={handleSendRevision} className={styles.revisionBox}>
                  <label className={styles.revisionLabel}>
                    Describe your requested change for our Editing Team:
                  </label>
                  <textarea
                    value={revisionNote}
                    onChange={(e) => setRevisionNote(e.target.value)}
                    placeholder="e.g. 'Please move the logo slightly higher' or 'Make the font bolder'."
                    className={styles.instructionTextarea}
                    rows={3}
                    required
                  />
                  <Button variant="primary" size="sm" type="submit" leftIcon={<Send size={14} />}>
                    Send Revision to Editing Team
                  </Button>
                </form>
              )}
            </>
          )}

          {status === 'approved' && (
            <div className={styles.statusNotice}>
              ✅ Thank you! Design approved. Order #{order.orderId} has been moved to production & printing!
            </div>
          )}

          {status === 'revision' && (
            <div className={styles.statusNotice} style={{ backgroundColor: '#fdf5e6', color: '#965f00' }}>
              📩 Revision requested! Your notes (&quot;{revisionNote}&quot;) have been returned to our Editing Team. You will receive an updated proof shortly.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default function MockupApprovalPage() {
  return (
    <Suspense fallback={<div>Loading Approval View...</div>}>
      <ApprovalFlowContent />
    </Suspense>
  );
}
