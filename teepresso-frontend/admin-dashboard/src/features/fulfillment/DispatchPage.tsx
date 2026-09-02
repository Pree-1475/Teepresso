import React, { useState, useEffect } from 'react';
import { Search, Truck, Check } from 'lucide-react';
import styles from './DispatchPage.module.css';
import { API_BASE_URL } from '@/common/config/api';

interface Order {
  id: string;
  orderId: string;
  orgName: string;
  customerName: string;
  totalPieces: number;
  currentStage: string;
}

export function DispatchPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        // Show orders that are approved and not yet delivered/dispatched
        const filtered = data.orders.filter((o: any) => 
          o.mockupStatus === 'Approved' && 
          o.currentStage !== 'Delivered'
        );
        setOrders(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

    const handleUpdateStage = async (orderId: string, stage: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStage: stage })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = orders.filter(item => {
    return (
      item.orderId.toLowerCase().includes(search.toLowerCase()) ||
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.orgName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className={styles.workspace}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dispatch Management</h1>
          <p className={styles.subtitle}>Select ready orders and add them to the dispatched list.</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} className="text-muted" />
          <input
            type="text"
            placeholder="Search Order ID, Client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className="erp-table-container">
        {loading ? (
           <div style={{ padding: '24px' }}>Loading...</div>
        ) : orders.length === 0 ? (
           <div style={{ padding: '24px' }}>No orders ready for dispatch.</div>
        ) : (
          <table className="erp-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Client / Organization</th>
                <th>Pieces</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="text-mono" style={{ fontWeight: 600 }}>{item.orderId}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.orgName}</div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>{item.customerName}</div>
                  </td>
                  <td>{item.totalPieces} pcs</td>
                  <td>
                    <span className={`badge ${item.currentStage === 'In Transit' ? 'badge-info' : 'badge-warning'}`}>{item.currentStage}</span>
                  </td>
                  <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {item.currentStage !== 'In Transit' && (
                      <button 
                        onClick={() => handleUpdateStage(item.id, 'In Transit')}
                        className="erp-btn-secondary" 
                        style={{ padding: '6px 12px' }}
                      >
                        <Truck size={14} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }}/> Mark Dispatched
                      </button>
                    )}
                    <button 
                      onClick={() => handleUpdateStage(item.id, 'Delivered')}
                      className="erp-btn-primary" 
                      style={{ padding: '6px 12px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                    >
                      <Check size={14} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }}/> Mark Delivered
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
export default DispatchPage;
