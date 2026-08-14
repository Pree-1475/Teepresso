import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Search, CheckCircle2, MessageCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import { Input } from '@/common/components/ui/Input/Input';
import styles from './track-order.module.css';

export const TRACKING_STAGES = [
  'Order Placed',
  'Waiting for Approval',
  'Approved',
  'Design in Progress',
  'Printing',
  'Quality Check',
  'Packed',
  'In Transit',
  'Delivered'
];

export function TrackOrderPage() {
  const { user, isAuthenticated } = useAuth();

  const [orderIdInput, setOrderIdInput] = useState<string>('TP-2026-8842');
  const [phoneInput, setPhoneInput] = useState<string>('9876543210');
  const [foundOrder, setFoundOrder] = useState<any | null>(null);
  const [searched, setSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If user is authenticated, prefill phone number
  useEffect(() => {
    if (user?.phone) {
      setPhoneInput(user.phone);
    }
  }, [user]);

  // Load initial order on mount if query params exist or default matches
  useEffect(() => {
    fetchOrderStatus('TP-2026-8842', '9876543210');
  }, []);

  const fetchOrderStatus = async (oid: string, tel: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`http://localhost:5000/api/v1/orders/track?orderId=${encodeURIComponent(oid)}&phone=${encodeURIComponent(tel)}`);
      const data = await response.json();
      if (data.success && data.order) {
        setFoundOrder(data.order);
        setSearched(true);
      } else {
        setFoundOrder(null);
        setErrorMsg(data.message || 'No order found matching credentials.');
        setSearched(true);
      }
    } catch (err) {
      setFoundOrder(null);
      setErrorMsg('Unable to connect to Teepresso Live operations. Please check connection.');
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrderStatus(orderIdInput, phoneInput);
  };

  const getStageIndex = (stage: string) => {
    return TRACKING_STAGES.indexOf(stage);
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
            <Button variant="primary" size="md" fullWidth type="submit" disabled={loading} leftIcon={loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}>
              {loading ? 'Searching Ledger...' : 'Track Order Status'}
            </Button>
          </form>

          {!isAuthenticated && (
            <div style={{ marginTop: 'var(--spacing-4)', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              Want to see all your orders saved in one place?{' '}
              <Link to="/login" style={{ color: 'var(--color-primary-600)', fontWeight: 700 }}>
                Sign In to Your Account
              </Link>
            </div>
          )}

          {searched && errorMsg && (
            <div className={styles.notFoundBox}>
              {errorMsg} Try searching with sample ID <strong>TP-2026-8842</strong> and Phone <strong>9876543210</strong>.
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
                      Our design team has sent your custom proof. Review and approve the artwork to start printing.
                    </div>
                  </div>
                </div>

                <Link 
                  to={`/approve-mockup?order=${foundOrder.orderId}`} 
                  className={styles.whatsappBtn}
                  style={{ backgroundColor: '#ECEF22', color: '#0F0F11', fontWeight: 700 }}
                >
                  <MessageCircle size={18} /> Review & Approve
                </Link>
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
                      style={{ animationDelay: `${idx * 0.1}s` }}
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

export default TrackOrderPage;
