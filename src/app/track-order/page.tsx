'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Search, CheckCircle2, MessageCircle, Clock, Truck, ShieldCheck, Zap, ArrowRight, UserCheck, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { TRACKING_STAGES, MOCK_ORDERS_DATABASE, TrackedOrder } from '@/data/trackingData';
import styles from './track-order.module.css';

export default function OrderTrackingPage() {
  const { user, isAuthenticated } = useAuth();

  const [orderIdInput, setOrderIdInput] = useState<string>('TP-2026-8842');
  const [phoneInput, setPhoneInput] = useState<string>('9876543210');
  const [foundOrder, setFoundOrder] = useState<TrackedOrder | null>(MOCK_ORDERS_DATABASE[0]);
  const [searched, setSearched] = useState<boolean>(true);

  // If user is authenticated, prefill phone number
  useEffect(() => {
    if (user?.phone) {
      setPhoneInput(user.phone);
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const match = MOCK_ORDERS_DATABASE.find(
      (o) => o.orderId.toLowerCase() === orderIdInput.trim().toLowerCase() && o.phone === phoneInput.trim()
    );
    setFoundOrder(match || null);
  };

  const getStageIndex = (stage: string) => {
    return TRACKING_STAGES.indexOf(stage as any);
  };

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        
        {/* Header */}
        <div className={styles.heroHeader}>
          <span className={styles.heroBadge}>📦 LIVE ORDER TRACKER</span>
          <h1 className={styles.heroTitle}>
            {isAuthenticated ? `Welcome back, ${user?.name.split(' ')[0]}!` : 'Track Your Teepresso Order'}
          </h1>
          <p className={styles.heroDesc}>
            {isAuthenticated 
              ? 'Select your active order below or search with an Order ID & Phone number.' 
              : 'Enter your Order ID and registered Phone/WhatsApp number to view production status and estimated delivery.'}
          </p>
        </div>

        {/* Logged In Quick Order Selector */}
        {isAuthenticated && (
          <div style={{ maxWidth: '580px', margin: '0 auto var(--spacing-6)' }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-800)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Your Active Orders
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {MOCK_ORDERS_DATABASE.map(ord => (
                <button
                  key={ord.orderId}
                  type="button"
                  onClick={() => {
                    setOrderIdInput(ord.orderId);
                    setPhoneInput(ord.phone);
                    setFoundOrder(ord);
                    setSearched(true);
                  }}
                  style={{
                    backgroundColor: foundOrder?.orderId === ord.orderId ? 'var(--color-primary-600)' : 'var(--color-surface)',
                    color: foundOrder?.orderId === ord.orderId ? '#fff' : 'var(--color-text-primary)',
                    border: '1px solid var(--color-primary-300)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Order #{ord.orderId} ({ord.totalPieces} Pcs)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Card */}
        <div className={styles.searchCard}>
          <form onSubmit={handleSearch}>
            <div className={styles.searchFormGrid}>
              <Input
                label="Order ID *"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="e.g. TP-2026-8842"
                required
              />
              <Input
                label="Phone Number *"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="e.g. 9876543210"
                required
              />
            </div>
            <Button variant="primary" size="md" fullWidth type="submit" leftIcon={<Search size={16} />}>
              Track Order Status
            </Button>
          </form>

          {!isAuthenticated && (
            <div style={{ marginTop: 'var(--spacing-4)', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              Want to see all your orders saved in one place?{' '}
              <Link href="/login" style={{ color: 'var(--color-primary-600)', fontWeight: 700 }}>
                Sign In to Your Account
              </Link>
            </div>
          )}

          {searched && !foundOrder && (
            <div className={styles.notFoundBox}>
              No active order found for Order ID <strong>{orderIdInput}</strong> and Phone <strong>{phoneInput}</strong>. Try searching with sample ID <strong>TP-2026-8842</strong>.
            </div>
          )}
        </div>

        {/* Search Result View */}
        {foundOrder && (
          <div className={styles.resultContainer}>
            
            {/* Mockup Approval Action Callout */}
            {foundOrder.currentStage === 'Waiting for Approval' && (
              <div className={styles.approvalAlertBanner}>
                <div className={styles.alertLeft}>
                  <Clock size={28} color="#e67e22" />
                  <div>
                    <div className={styles.alertTitle}>Your mockup is ready for approval!</div>
                    <div className={styles.alertDesc}>
                      Our design team has sent your custom proof. Review and approve directly on WhatsApp to start printing.
                    </div>
                  </div>
                </div>

                <a 
                  href={foundOrder.whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.whatsappBtn}
                >
                  <MessageCircle size={18} /> Review on WhatsApp
                </a>
              </div>
            )}

            {/* Order Details Header Card */}
            <div className={styles.orderMetaCard}>
              <div className={styles.orderMetaGrid}>
                <div>
                  <div className={styles.metaLabel}>Order ID</div>
                  <div className={styles.metaValue}>{foundOrder.orderId}</div>
                </div>

                <div>
                  <div className={styles.metaLabel}>Order Date</div>
                  <div className={styles.metaValue}>{foundOrder.orderDate}</div>
                </div>

                <div>
                  <div className={styles.metaLabel}>Est. Delivery</div>
                  <div className={styles.metaValue}>{foundOrder.estimatedDelivery}</div>
                </div>

                <div>
                  <div className={styles.metaLabel}>Apparel & Quantity</div>
                  <div className={styles.metaValue}>
                    {foundOrder.totalPieces} Pcs ({foundOrder.productName})
                  </div>
                </div>
              </div>

              {foundOrder.isUrgent && (
                <div style={{ marginTop: 'var(--spacing-3)' }}>
                  <span className={styles.urgentBadge}>⚡ EXPRESS URGENT ORDER</span>
                </div>
              )}
            </div>

            {/* 9-Stage Visual Timeline */}
            <div className={styles.timelineCard}>
              <h2 className={styles.timelineTitle}>Production & Delivery Status</h2>

              <div className={styles.stageList}>
                {TRACKING_STAGES.map((stage, idx) => {
                  const currentIdx = getStageIndex(foundOrder.currentStage);
                  const isPassed = idx < currentIdx;
                  const isActive = idx === currentIdx;

                  return (
                    <div
                      key={stage}
                      className={`${styles.stageItem} ${isPassed ? styles.stageItemPassed : ''} ${
                        isActive ? styles.stageItemActive : ''
                      }`}
                    >
                      <div className={styles.stageDot}>
                        {isPassed ? <CheckCircle2 size={12} /> : null}
                      </div>

                      <span className={styles.stageName}>{stage}</span>

                      {isActive && <span className={styles.activeStatusPill}>CURRENT STATUS</span>}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
