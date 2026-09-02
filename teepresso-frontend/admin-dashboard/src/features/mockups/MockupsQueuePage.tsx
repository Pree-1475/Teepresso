import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, UploadCloud, Save, Image as ImageIcon, DownloadCloud, ExternalLink } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import styles from './MockupsQueuePage.module.css';
import { API_BASE_URL } from '@/common/config/api';

interface OrderItem {
  name: string;
  artworkMode?: string;
  placements?: Record<string, any>;
}

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  orgName: string;
  productName: string;
  mockupStatus: string;
  currentStage: string;
  items: OrderItem[] | string;
}

export function MockupsQueuePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingItem, setUploadingItem] = useState<{orderId: string, itemIdx: number, placementKey: string} | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        // Filter orders that have mockup pending
        const filtered = data.orders.filter((o: Order) => {
          if (o.mockupStatus === 'Approved' || o.currentStage === 'Delivered') return false;
          let items: any[] = [];
          if (typeof o.items === 'string') {
            try { items = JSON.parse(o.items); } catch(e) {}
          } else if (Array.isArray(o.items)) {
            items = o.items;
          }
          return items.some(item => {
            if (!item.placements) return false;
            return Object.values(item.placements).some((p: any) => p && p.previewUrl);
          });
        });
        setOrders(filtered);
      }
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  
  const handleDownloadZip = async (order: Order) => {
    let itemsArr: any[] = [];
    if (typeof order.items === 'string') {
      try { itemsArr = JSON.parse(order.items); } catch(e) {}
    } else if (Array.isArray(order.items)) {
      itemsArr = order.items;
    }

    const zip = new JSZip();
    const folder = zip.folder(`Order_${order.orderId}_Artworks`);
    if (!folder) return;

    let hasImages = false;

    for (const [idx, item] of itemsArr.entries()) {
      if (item.placements) {
        for (const [key, placementData] of Object.entries(item.placements)) {
          const url = (placementData as any)?.previewUrl;
          if (url) {
            try {
              let blob: Blob;
              if (url.startsWith('data:')) {
                // Base64
                const res = await fetch(url);
                blob = await res.blob();
              } else {
                // Remote URL
                const res = await fetch(url);
                blob = await res.blob();
              }
              const ext = blob.type.split('/')[1] || 'png';
              folder.file(`${item.name.replace(/[^a-zA-Z0-9]/g, '_')}_${key}.${ext}`, blob);
              hasImages = true;
            } catch (err) {
              console.error('Error fetching image for zip', err);
            }
          }
        }
      }
    }

    if (hasImages) {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${order.orderId}_Artworks.zip`);
    } else {
      alert('No valid artworks found to download.');
    }
  };

  const handleVerify = async (order: Order) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mockupStatus: 'Approved', currentStage: 'Mockup Approved' })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // For simplicity, we just use a File input to convert to base64, then send PUT request to update the order's items array
  const handleReplaceDesign = (e: React.ChangeEvent<HTMLInputElement>, order: Order, itemIdx: number, placementKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingItem({ orderId: order.id, itemIdx, placementKey });

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      
      // We need to parse items, update the specific placement, and save
      let itemsArr: any[] = [];
      if (typeof order.items === 'string') {
        try { itemsArr = JSON.parse(order.items); } catch(e) {}
      } else if (Array.isArray(order.items)) {
        itemsArr = [...order.items];
      }

      if (itemsArr[itemIdx] && itemsArr[itemIdx].placements && itemsArr[itemIdx].placements[placementKey]) {
        itemsArr[itemIdx].placements[placementKey].previewUrl = base64;
      } else {
        // Init placement if somehow missing
        if (!itemsArr[itemIdx]) itemsArr[itemIdx] = {};
        if (!itemsArr[itemIdx].placements) itemsArr[itemIdx].placements = {};
        itemsArr[itemIdx].placements[placementKey] = { previewUrl: base64 };
      }

      try {
        await fetch(`${API_BASE_URL}/orders/${order.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: itemsArr }) // Note: our backend API might not process base64 to GCS on PUT /orders/:id out of the box, we may need to fix that or let it stay base64
        });
        fetchOrders();
      } catch (err) {
        console.error(err);
      } finally {
        setUploadingItem(null);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.workspace}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mockup Verification</h1>
          <p className={styles.subtitle}>Review client uploaded designs, replace artwork, and approve for production.</p>
        </div>
        <button onClick={fetchOrders} className="erp-btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <RefreshCw size={14} /><span>Refresh Queue</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '24px' }}>Loading mockups...</div>
      ) : error ? (
        <div style={{ padding: '24px', color: 'red' }}>{error}</div>
      ) : orders.length === 0 ? (
        <div style={{ padding: '24px' }}>No orders waiting for mockup verification!</div>
      ) : (
        <div className={styles.proofsGrid}>
          {orders.map(order => {
            let items: OrderItem[] = [];
            if (typeof order.items === 'string') {
              try { items = JSON.parse(order.items); } catch(e) {}
            } else if (Array.isArray(order.items)) {
              items = order.items;
            }

            return (
              <div key={order.id} className={styles.proofCard} style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-hover)', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-text-title)' }}>{order.orderId}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{order.customerName} - {order.orgName}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <a href="https://www.canva.com/" target="_blank" rel="noopener noreferrer" className="erp-btn-secondary" style={{ padding: '6px 12px', height: 'fit-content', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                      <ExternalLink size={14} style={{ marginRight: '6px' }}/> Export to Canva
                    </a>
                    <button onClick={() => handleDownloadZip(order)} className="erp-btn-secondary" style={{ padding: '6px 12px', height: 'fit-content', display: 'flex', alignItems: 'center' }}>
                      <DownloadCloud size={14} style={{ marginRight: '6px' }}/> Download Zip
                    </button>
                    <button onClick={() => handleVerify(order)} className="erp-btn-primary" style={{ padding: '6px 12px', height: 'fit-content', display: 'flex', alignItems: 'center' }}>
                      <CheckCircle2 size={14} style={{ marginRight: '6px' }}/> Verify & Approve
                    </button>
                  </div>
                </div>
                
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {items.filter(item => {
                    if (!item.placements) return false;
                    return Object.values(item.placements).some((p: any) => p && p.previewUrl);
                  }).map((item, idx) => (
                    <div key={idx} style={{ border: '1px dashed var(--color-border)', borderRadius: '8px', padding: '12px' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--color-text-title)' }}>{item.name}</h4>
                      
                      {item.placements && Object.keys(item.placements).length > 0 ? (
                        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}>
                          {Object.entries(item.placements).map(([key, placementData]: [string, any]) => (
                            <div key={key} style={{ minWidth: '120px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{key}</span>
                              {placementData?.previewUrl ? (
                                <img src={placementData.previewUrl} alt={key} style={{ width: '100px', height: '100px', objectFit: 'contain', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-canvas-bg)' }} />
                              ) : (
                                <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-canvas-bg)', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                                  <ImageIcon size={24} color="#9ca3af" />
                                </div>
                              )}
                              
                              <label style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <UploadCloud size={12} /> Replace
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleReplaceDesign(e, order, idx, key)} disabled={uploadingItem?.orderId === order.id && uploadingItem?.itemIdx === idx} />
                              </label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No artwork uploaded by client.</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default MockupsQueuePage;
