import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Download, Send, Image } from 'lucide-react';
import styles from './MockupsQueuePage.module.css';

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  orgName: string;
  productName: string;
  category: string;
  totalPieces: number;
  mockupStatus: 'Pending Editing' | 'Customer Approval Pending' | 'Approved' | 'Revision Requested';
}

const MOCKUP_ORDERS: Order[] = [
  {
    id: '1',
    orderId: 'TP-2026-8842',
    customerName: 'Rahul Sharma',
    phone: '+91 98765 43210',
    orgName: 'IIT Bombay TechFest',
    productName: 'Custom Kurta Seasonal Batch',
    category: 'Kurtas',
    totalPieces: 50,
    mockupStatus: 'Customer Approval Pending'
  },
  {
    id: '2',
    orderId: 'TP-2026-9011',
    customerName: 'Ananya Verma',
    phone: '+91 87654 32109',
    orgName: 'ZettaScale Tech Inc.',
    productName: 'Heavyweight Oversized Tee',
    category: 'T-Shirts',
    totalPieces: 320,
    mockupStatus: 'Pending Editing'
  },
  {
    id: '3',
    orderId: 'TP-2026-9104',
    customerName: 'Vikramaditya Roy',
    phone: '+91 76543 21098',
    orgName: 'Greenwood Heights RWA',
    productName: 'Festive Printed Kurta',
    category: 'Kurtas',
    totalPieces: 85,
    mockupStatus: 'Approved'
  }
];

export function MockupsQueuePage() {
  const [orders] = useState<Order[]>(MOCKUP_ORDERS);

  return (
    <div className={styles.workspace}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Proofing & Design Queue</h1>
          <p className={styles.subtitle}>Manage artwork vectors and client mockups before production.</p>
        </div>
        <div className={styles.actions}>
          <button className="erp-btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <RefreshCw size={14} />
            <span>Sync Assets</span>
          </button>
        </div>
      </div>

      {/* Grid of Design Tasks */}
      <div className={styles.proofsGrid}>
        {orders.map(item => (
          <div key={item.id} className={styles.proofCard}>
            
            <div className={styles.cardHeader}>
              <div>
                <span className="text-mono text-muted">{item.orderId}</span>
                <h3 className={styles.orgText}>{item.orgName}</h3>
              </div>
              <span className={`badge ${
                item.mockupStatus === 'Approved' ? 'badge-success' : 
                item.mockupStatus === 'Pending Editing' ? 'badge-danger' : 'badge-warning'
              }`}>
                {item.mockupStatus}
              </span>
            </div>

            <div className={styles.imageStagePlaceholder}>
              <Image size={24} color="var(--color-text-muted)" />
              <span className="text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>Mockup Preview</span>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.infoRow}>
                <span className="text-muted">Customer:</span>
                <strong>{item.customerName}</strong>
              </div>
              <div className={styles.infoRow}>
                <span className="text-muted">Product:</span>
                <span>{item.totalPieces} Pcs • {item.productName}</span>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button className="erp-btn-primary" style={{ width: '100%' }}>
                Open Workspace
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default MockupsQueuePage;
