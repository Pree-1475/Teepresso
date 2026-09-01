import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  ShieldAlert,
  X
} from 'lucide-react';
import styles from './OrdersPage.module.css';
import { API_BASE_URL } from '@/common/config/api';


interface Order {
  id: string;
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  orgName: string;
  orgType: string;
  productName: string;
  category: string;
  totalPieces: number;
  totalAmount: number;
  orderDate: string;
  estimatedDelivery: string;
  currentStage: 'Order Placed' | 'Waiting for Approval' | 'Approved' | 'Design in Progress' | 'Printing' | 'Quality Check' | 'Packed' | 'In Transit' | 'Delivered';
  isUrgent: boolean;
  paymentStatus: string;
  notes: string;
}

const STAGES = [
  'All',
  'Order Placed',
  'Waiting for Approval',
  'Approved',
  'Printing',
  'Quality Check',
  'In Transit',
  'Delivered'
];

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStage, setUpdatingStage] = useState(false);

  // Get current user role
  const storedUser = localStorage.getItem('teepresso_user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isManager = currentUser?.role === 'manager';

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStage = async (orderId: string, newStage: string) => {
    setUpdatingStage(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, currentStage: newStage as any } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, currentStage: newStage as any });
        }
      }
    } catch (err) {
      console.error('Failed to update stage:', err);
    } finally {
      setUpdatingStage(false);
    }
  };

  const filtered = orders.filter(item => {
    const matchesSearch = 
      item.orderId.toLowerCase().includes(search.toLowerCase()) ||
      item.orgName.toLowerCase().includes(search.toLowerCase()) ||
      (!isManager && item.customerName.toLowerCase().includes(search.toLowerCase()));
    
    if (activeTab === 'All') return matchesSearch;
    return item.currentStage === activeTab && matchesSearch;
  });

  return (
    <div className={styles.workspace}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders Queue</h1>
          <p className={styles.subtitle}>Manage all production orders and walk-in sales.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="erp-btn-secondary" onClick={fetchOrders} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabContainer} style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px', overflowX: 'auto' }}>
        {STAGES.map(stage => (
          <button
            key={stage}
            onClick={() => setActiveTab(stage)}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: activeTab === stage ? '#ECEF22' : 'transparent',
              color: '#0F0F11',
              fontWeight: 600,
              borderRadius: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: activeTab === stage ? '#0F0F11' : 'transparent'
            }}
          >
            {stage}
          </button>
        ))}
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

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</div>
      ) : (
        <div className="erp-table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} onClick={() => setSelectedOrder(item)} style={{ cursor: 'pointer' }}>
                  <td className="text-mono" style={{ fontWeight: 'bold' }}>{item.orderId}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      {isManager ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                          <ShieldAlert size={10} /> Masked
                        </span>
                      ) : item.customerName}
                    </div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>{item.orgName}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.productName}</div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>{item.category}</div>
                  </td>
                  <td>{item.totalPieces} pcs</td>
                  <td>₹{item.totalAmount.toLocaleString('en-IN')}</td>
                  <td>
                    <span className="badge badge-info">
                      {item.currentStage}
                    </span>
                  </td>
                  <td>
                    {item.isUrgent ? (
                      <span className="badge badge-danger">Express</span>
                    ) : (
                      <span className="text-muted">Normal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Inspection Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#F8F8F5',
            border: '3px solid #0F0F11',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            padding: '24px',
            boxShadow: '8px 8px 0px 0px #0F0F11',
            position: 'relative'
          }}>
            <button 
              onClick={() => setSelectedOrder(null)} 
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>Inspect Order: {selectedOrder.orderId}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <strong style={{ fontSize: '12px', color: '#666' }}>Client Organization:</strong>
                <div>{selectedOrder.orgName} ({selectedOrder.orgType})</div>
              </div>
              <div>
                <strong style={{ fontSize: '12px', color: '#666' }}>Apparel Specs:</strong>
                <div>{selectedOrder.productName}</div>
              </div>
              <div>
                <strong style={{ fontSize: '12px', color: '#666' }}>Quantity / Value:</strong>
                <div>{selectedOrder.totalPieces} Pcs / ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <strong style={{ fontSize: '12px', color: '#666' }}>Payment Status:</strong>
                <div>{selectedOrder.paymentStatus}</div>
              </div>
              <div>
                <strong style={{ fontSize: '12px', color: '#666' }}>Customer Contact:</strong>
                {isManager ? (
                  <div style={{ color: '#991b1b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldAlert size={12} /> Contact Details Masked (Manager Role)
                  </div>
                ) : (
                  <div>{selectedOrder.customerName} ({selectedOrder.phone} | {selectedOrder.email})</div>
                )}
              </div>
              <div>
                <strong style={{ fontSize: '12px', color: '#666' }}>Order Date:</strong>
                <div>{selectedOrder.orderDate}</div>
              </div>
            </div>

            {selectedOrder.notes && (
              <div style={{ background: '#eee', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px' }}>
                <strong>Notes:</strong> {selectedOrder.notes}
              </div>
            )}

            <div style={{ borderTop: '2px dashed #0F0F11', paddingTop: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Update Production Stage:</label>
              <select
                disabled={updatingStage}
                value={selectedOrder.currentStage}
                onChange={e => handleUpdateStage(selectedOrder.id, e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #0F0F11',
                  fontWeight: 600,
                  fontSize: '14px',
                  background: '#ECEF22'
                }}
              >
                {STAGES.filter(s => s !== 'All').map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
                <option value="Design in Progress">Design in Progress</option>
                <option value="Packed">Packed</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
