import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import styles from './OrdersPage.module.css';

interface OrderItem {
  id: string;
  orderId: string;
  client: string;
  org: string;
  category: string;
  product: string;
  qty: number;
  total: number;
  status: string;
  priority: 'High' | 'Normal' | 'Express';
}

const ORDERS_DATA: OrderItem[] = [
  {
    id: '1',
    orderId: 'TP-2026-8842',
    client: 'Rahul Sharma',
    org: 'IIT Bombay TechFest',
    category: 'Kurtas',
    product: 'Custom Kurta Seasonal Batch',
    qty: 50,
    total: 19950,
    status: 'Waiting for Approval',
    priority: 'Express'
  },
  {
    id: '2',
    orderId: 'TP-2026-9011',
    client: 'Ananya Verma',
    org: 'ZettaScale Tech Inc.',
    category: 'T-Shirts',
    product: 'Heavyweight Oversized Tee',
    qty: 320,
    total: 112000,
    status: 'Printing',
    priority: 'Normal'
  },
  {
    id: '3',
    orderId: 'TP-2026-9104',
    client: 'Vikramaditya Roy',
    org: 'Greenwood Heights RWA',
    category: 'Kurtas',
    product: 'Festive Printed Kurta',
    qty: 85,
    total: 38165,
    status: 'Approved',
    priority: 'Express'
  },
  {
    id: '4',
    orderId: 'TP-2026-8720',
    client: 'Priya Nair',
    org: 'Global Consulting Group',
    category: 'Polos',
    product: 'Corporate Polo Shirt',
    qty: 200,
    total: 85800,
    status: 'Dispatched',
    priority: 'High'
  },
  {
    id: '5',
    orderId: 'TP-2026-8519',
    client: 'Amitabh Sen',
    org: "St. Xavier's Cultural Club",
    category: 'Hoodies',
    product: 'Premium Pullover Hoodie',
    qty: 60,
    total: 47940,
    status: 'QC Check',
    priority: 'Normal'
  }
];

export function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderItem[]>(ORDERS_DATA);
  const [search, setSearch] = useState('');

  const filtered = orders.filter(item => {
    return item.orderId.toLowerCase().includes(search.toLowerCase()) ||
           item.org.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className={styles.workspace}>
      
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders Queue</h1>
          <p className={styles.subtitle}>Manage all production orders and walk-in sales.</p>
        </div>
        <div className={styles.actions}>
          <button className="erp-btn-primary" onClick={() => navigate('/offline-orders')} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={14} />
            <span>New POS Order</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} className="text-muted" />
          <input
            type="text"
            placeholder="Search Order ID, Client Org..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <button className="erp-btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Filter size={14} />
            <span>Filter</span>
          </button>
          <button className="erp-btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Clean Table */}
      <div className="erp-table-container">
        <table className="erp-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" /></th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Priority</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} onClick={() => navigate(`/orders/${item.id}`)}>
                <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                <td className="text-mono">{item.orderId}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{item.client}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>{item.org}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{item.product}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>{item.category}</div>
                </td>
                <td>{item.qty} pcs</td>
                <td>₹{item.total.toLocaleString('en-IN')}</td>
                <td>
                  <span className={`badge ${
                    item.status === 'Approved' ? 'badge-success' : 
                    item.status === 'Waiting for Approval' ? 'badge-warning' : 
                    item.status === 'Dispatched' ? 'badge-neutral' : 'badge-info'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  {item.priority === 'Express' || item.priority === 'High' ? (
                    <span className="badge badge-danger">{item.priority}</span>
                  ) : (
                    <span className="text-muted">Normal</span>
                  )}
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <button className={styles.moreBtn}><MoreHorizontal size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrdersPage;
