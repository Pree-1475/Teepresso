import React, { useState, useEffect } from 'react';
import { Sparkles, Sun, CreditCard, Save, CheckCircle2, PhoneCall } from 'lucide-react';
import styles from '../products/ProductsAdminPage.module.css';
import { API_BASE_URL } from '@/common/config/api';

export function SettingsPage() {
  const [storefrontMode, setStorefrontMode] = useState<'STANDARD' | 'FESTIVE'>('FESTIVE');
  const [upiVpa, setUpiVpa] = useState('9390771123@axl');
  const [payeeName, setPayeeName] = useState('Teepresso Enterprise');
  const [festiveRecommendationProductId, setFestiveRecommendationProductId] = useState('royal-festive-pagdi');
  const [productsList, setProductsList] = useState<{ id: string; name: string }[]>([]);
  const [featuredProductIds, setFeaturedProductIds] = useState<string[]>([]);
  const [contactPhone, setContactPhone] = useState('919390771123');
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      const data = await res.json();
      if (data.success && data.settings) {
        if (data.settings.storefrontMode) setStorefrontMode(data.settings.storefrontMode);
        if (data.settings.upiVpa) setUpiVpa(data.settings.upiVpa);
        if (data.settings.payeeName) setPayeeName(data.settings.payeeName);
        if (data.settings.festiveRecommendationProductId) setFestiveRecommendationProductId(data.settings.festiveRecommendationProductId);
        if (Array.isArray(data.settings.featuredProductIds)) setFeaturedProductIds(data.settings.featuredProductIds);

        // Fetch products list for dropdown
        try {
          const pRes = await fetch(`${API_BASE_URL}/products`);
          const pData = await pRes.json();
          if (pData.success && Array.isArray(pData.products)) {
            setProductsList(pData.products.map((p: any) => ({ id: p.id, name: p.name })));
          }
        } catch(e) {}
        if (data.settings.contactPhone) setContactPhone(data.settings.contactPhone);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setErrorMsg('Failed to load live settings from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateSetting = async (key: string, value: any) => {
    setSavingKey(key);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Setting '${key}' updated successfully! Customer storefront updated.`);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(data.message || 'Failed to update setting');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error while saving setting');
    } finally {
      setSavingKey(null);
    }
  };

  
  const handleToggleFeatured = async (productId: string) => {
    const updated = featuredProductIds.includes(productId)
      ? featuredProductIds.filter(id => id !== productId)
      : [...featuredProductIds, productId];
    setFeaturedProductIds(updated);
    await handleUpdateSetting('featuredProductIds', updated);
  };

  const handleModeToggle = async (mode: 'STANDARD' | 'FESTIVE') => {
    setStorefrontMode(mode);
    await handleUpdateSetting('storefrontMode', mode);
  };

  return (
    <div className={styles.workspace}>
      {/* Header */}
      <div className={styles.header} style={{ marginBottom: '24px' }}>
        <div>
          <h1 className={styles.title}>System & Storefront Settings</h1>
          <p className={styles.subtitle}>Configure live storefront themes, payment gateways, and WhatsApp support contact numbers</p>
        </div>
      </div>

      {/* Global Notifications */}
      {errorMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-status-danger-bg)', borderLeft: '4px solid var(--color-status-danger)', color: 'var(--color-status-danger)', borderRadius: '4px', marginBottom: '20px' }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', color: '#065f46', borderRadius: '4px', marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <p>Loading live system settings...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          
          {/* Card 1: Storefront Theme Mode Switcher */}
          <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-text-title)' }}>Storefront Theme Mode</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Switch customer storefront theme in real-time</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-text-body)', lineHeight: 1.5, marginBottom: '20px' }}>
              Select between <strong>Standard Corporate Apparel Mode</strong> or <strong>Festive Dandiya/Diwali Kurta Mode</strong>. The storefront automatically switches banner visuals and collection features live.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {/* Standard Mode Card */}
              <div 
                onClick={() => handleModeToggle('STANDARD')}
                style={{
                  border: storefrontMode === 'STANDARD' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: storefrontMode === 'STANDARD' ? 'var(--color-surface-hover)' : 'transparent',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Sun size={16} color="var(--color-primary)" />
                  <strong style={{ fontSize: '14px', color: 'var(--color-text-title)' }}>Standard Mode</strong>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
                  Corporate T-Shirts, Hoodies, Polos & Workwear Catalog.
                </span>
                {storefrontMode === 'STANDARD' && (
                  <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
                    ACTIVE
                  </span>
                )}
              </div>

              {/* Festive Mode Card */}
              <div 
                onClick={() => handleModeToggle('FESTIVE')}
                style={{
                  border: storefrontMode === 'FESTIVE' ? '2px solid #d97706' : '1px solid var(--color-border)',
                  backgroundColor: storefrontMode === 'FESTIVE' ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Sparkles size={16} color="#d97706" />
                  <strong style={{ fontSize: '14px', color: '#b45309' }}>Festive Mode</strong>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
                  Seasonal Garba, Dandiya & Diwali Kurta Collections.
                </span>
                {storefrontMode === 'FESTIVE' && (
                  <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#d97706', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
                    ACTIVE
                  </span>
                )}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-canvas-bg)', padding: '10px 12px', borderRadius: '4px', borderLeft: '3px solid var(--color-primary)' }}>
              <strong>Current Status:</strong> Frontends are currently running in <strong>{storefrontMode}</strong> mode.
            </div>
          </div>

          {/* Card 1.5: Festive Cart Recommendation Product Settings */}
          <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-text-title)' }}>Cart Festive Cross-Sell Product</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Select which item is recommended in the cart when festive products are added</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className={styles.formLabel}>Cart Festive Recommendation Product *</label>
                <select
                  value={festiveRecommendationProductId}
                  onChange={e => setFestiveRecommendationProductId(e.target.value)}
                  className={styles.formInput}
                >
                  <option value="">-- No Cross-Sell / Select an Item --</option>
                  {productsList.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
                <span className={styles.formHelp}>When a customer adds a Kurta or Festive apparel to their cart, this item appears in the cart drawer cross-sell box.</span>
                <button
                  type="button"
                  onClick={() => handleUpdateSetting('festiveRecommendationProductId', festiveRecommendationProductId)}
                  disabled={savingKey === 'festiveRecommendationProductId'}
                  className="erp-btn-primary"
                  style={{ marginTop: '10px', padding: '6px 14px', fontSize: '12px', display: 'inline-flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}
                >
                  <Save size={12} />
                  <span>{savingKey === 'festiveRecommendationProductId' ? 'Saving...' : 'Save Festive Recommendation Product'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card: Homepage Featured Catalog */}
          <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(140, 91, 69, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-text-title)' }}>Homepage Featured Catalog</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Select which products are displayed in the Catalog section on the homepage</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-text-body)', marginBottom: '14px' }}>
              Checked items appear directly in the homepage Catalog section. You can also toggle this inside any product's edit page.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
              {productsList.map(p => {
                const isSelected = featuredProductIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleToggleFeatured(p.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'rgba(140, 91, 69, 0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <strong style={{ fontSize: '13px', display: 'block', color: 'var(--color-text-title)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{p.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>ID: {p.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Merchant Payment & Contact Phone Settings */}
          <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <CreditCard size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-text-title)' }}>Payment & WhatsApp Support Settings</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Configure Merchant VPA and system-wide WhatsApp contact</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className={styles.formLabel}>Storefront Contact / WhatsApp Support Number *</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className={styles.formInput}
                  placeholder="e.g. 919390771123 or 9390771123"
                />
                <span className={styles.formHelp}>System-wide WhatsApp number. Clicking "Contact Us" on product pages opens wa.me with this number.</span>
                <button
                  type="button"
                  onClick={() => handleUpdateSetting('contactPhone', contactPhone)}
                  disabled={savingKey === 'contactPhone'}
                  className="erp-btn-primary"
                  style={{ marginTop: '8px', padding: '6px 14px', fontSize: '12px', display: 'inline-flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}
                >
                  <Save size={12} />
                  <span>{savingKey === 'contactPhone' ? 'Saving...' : 'Save WhatsApp Number'}</span>
                </button>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <label className={styles.formLabel}>Merchant UPI VPA (Virtual Payment Address) *</label>
                <input
                  type="text"
                  value={upiVpa}
                  onChange={e => setUpiVpa(e.target.value)}
                  className={styles.formInput}
                  placeholder="e.g. 9390771123@axl or teepresso@upi"
                />
                <span className={styles.formHelp}>UPI address embedded into POS counter QR codes for instant customer scanning.</span>
                <button
                  type="button"
                  onClick={() => handleUpdateSetting('upiVpa', upiVpa)}
                  disabled={savingKey === 'upiVpa'}
                  className="erp-btn-primary"
                  style={{ marginTop: '8px', padding: '6px 14px', fontSize: '12px', display: 'inline-flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}
                >
                  <Save size={12} />
                  <span>{savingKey === 'upiVpa' ? 'Saving...' : 'Save UPI VPA'}</span>
                </button>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <label className={styles.formLabel}>Registered Merchant Payee Name *</label>
                <input
                  type="text"
                  value={payeeName}
                  onChange={e => setPayeeName(e.target.value)}
                  className={styles.formInput}
                  placeholder="e.g. Teepresso Enterprise"
                />
                <span className={styles.formHelp}>Business entity name displayed on customer GooglePay / PhonePe / Paytm screens.</span>
                <button
                  type="button"
                  onClick={() => handleUpdateSetting('payeeName', payeeName)}
                  disabled={savingKey === 'payeeName'}
                  className="erp-btn-primary"
                  style={{ marginTop: '8px', padding: '6px 14px', fontSize: '12px', display: 'inline-flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}
                >
                  <Save size={12} />
                  <span>{savingKey === 'payeeName' ? 'Saving...' : 'Save Payee Name'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default SettingsPage;
