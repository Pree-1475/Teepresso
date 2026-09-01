import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Edit3, Send, Loader2 } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import styles from './approval.module.css';

function ApprovalFlowContent() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order') || 'TP-2026-8842';

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [status, setStatus] = useState<'pending' | 'approved' | 'revision'>('pending');
  const [showRevisionForm, setShowRevisionForm] = useState<boolean>(false);
  const [revisionNote, setRevisionNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`http://localhost:5000/api/v1/orders/track?orderId=${encodeURIComponent(orderId)}`);
      const data = await response.json();
      if (data.success && data.order) {
        setOrder(data.order);
        // Map backend mockup status to client view status
        if (data.order.mockupStatus === 'Approved') {
          setStatus('approved');
        } else if (data.order.mockupStatus === 'Revision Requested') {
          setStatus('revision');
          setRevisionNote(data.order.revisionNote || '');
        } else {
          setStatus('pending');
        }
      } else {
        setErrorMsg('Order design proof not found. Verify the URL link.');
      }
    } catch (err) {
      setErrorMsg('Unable to retrieve design proof details. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!order) return;
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/v1/orders/${order.id}/mockup`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' })
      });
      const data = await response.json();
      if (data.success) {
        setStatus('approved');
      } else {
        alert(data.message || 'Failed to submit approval.');
      }
    } catch (err) {
      alert('Network error submitting design approval.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/v1/orders/${order.id}/mockup`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Revision Requested',
          revisionNote: revisionNote
        })
      });
      const data = await response.json();
      if (data.success) {
        setStatus('revision');
      } else {
        alert(data.message || 'Failed to submit revision notes.');
      }
    } catch (err) {
      alert('Network error submitting revision.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer} style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Loader2 className="animate-spin" size={32} color="#0F0F11" />
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className={styles.pageContainer}>
        <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Proof Not Found</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>{errorMsg}</p>
        </div>
      </div>
    );
  }

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
              src={order.mockupUrl}
              alt="Final Watermarked Mockup Proof"
              className={styles.mockupImage}
            />

            {/* Teepresso Watermark Overlay */}
            {order.hasWatermark && (
              <div className={styles.watermarkPatternOverlay}>
                <span className={styles.watermarkText}>TEEPRESSO PROOF</span>
              </div>
            )}
          </div>

          {status === 'pending' && (
            <>
              <h2 className={styles.questionTitle}>Does this look good?</h2>

              <div className={styles.actionBtnGroup}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleApprove}
                  disabled={submitting}
                  leftIcon={submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  style={{ backgroundColor: '#217336' }}
                >
                  Approve Design
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowRevisionForm(!showRevisionForm)}
                  disabled={submitting}
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
                  <Button variant="primary" size="sm" type="submit" disabled={submitting} leftIcon={submitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}>
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

export const ApproveMockupPage = () => {
  return (
    <Suspense fallback={<div>Loading Approval View...</div>}>
      <ApprovalFlowContent />
    </Suspense>
  );
}

export default ApproveMockupPage;
