import React, { useState, useEffect } from 'react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, History, Package, Plus, RefreshCw } from 'lucide-react';
import styles from './InventoryPage.module.css';

interface InventoryTransaction {
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  notes: string;
  handler: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  gsm: number;
  color: string;
  sizesStock: {
    S: number;
    M: number;
    L: number;
    XL: number;
    XXL: number;
  };
  totalStock: number;
  reorderPoint: number;
  unit: string;
  transactions: InventoryTransaction[];
}

export function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [txType, setTxType] = useState<'IN' | 'OUT'>('IN');
  const [txSize, setTxSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('M');
  const [txQty, setTxQty] = useState<number>(50);
  const [txNotes, setTxNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/inventory');
      const data = await res.json();
      if (data.success) {
        setInventory(data.inventory);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setErrorMsg('');

    try {
      const res = await fetch(`http://localhost:5000/api/v1/inventory/${selectedItem.id}/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: txType,
          size: txSize,
          quantity: txQty,
          notes: txNotes || `${txType === 'IN' ? 'Stocked in' : 'Stocked out'} size ${txSize}`,
          handler: 'Operations Manager'
        })
      });

      const data = await res.json();
      if (data.success) {
        setSelectedItem(null);
        setTxNotes('');
        setTxQty(50);
        fetchInventory();
      } else {
        setErrorMsg(data.message || 'Operation failed');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to backend server');
    }
  };

  if (loading) {
    return (
      <div className="admin-page-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
          <RefreshCw className="animate-spin" size={16} />
          <span>Syncing real-time inventory ledger...</span>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalItemsCount = inventory.reduce((sum, item) => sum + item.totalStock, 0);
  const lowStockItems = inventory.filter(item => item.totalStock <= item.reorderPoint);

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-title)' }}>Inventory Blanks Ledger</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Warehouse stock levels, allocations & procurement transactions</p>
        </div>
        <button onClick={fetchInventory} className={styles.refreshBtn}>
          <RefreshCw size={13} /> Sync Ledger
        </button>
      </div>

      {/* Stats summary row */}
      <div className={styles.statsStrip}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Total Blank Units in Stock</span>
          <span className={styles.statVal}>{totalItemsCount.toLocaleString()} Pcs</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Unique Apparel SKUs</span>
          <span className={styles.statVal}>{inventory.length} Blanks</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Alerts Required</span>
          <span className={`${styles.statVal} ${lowStockItems.length > 0 ? styles.alertText : ''}`}>
            {lowStockItems.length} SKUs Low Stock
          </span>
        </div>
      </div>

      {/* Low stock alerts panel */}
      {lowStockItems.length > 0 && (
        <div className={styles.alertsBar}>
          <AlertTriangle size={15} color="#D97706" />
          <span>
            <strong>Reorder Alert:</strong> The following blanks have dipped below safe thresholds: {' '}
            {lowStockItems.map((item, idx) => (
              <span key={item.id} className={styles.skulink}>
                {item.name} ({item.color}) [{item.totalStock} {item.unit} left]{idx < lowStockItems.length - 1 ? ', ' : ''}
              </span>
            ))}
          </span>
        </div>
      )}

      {/* Main Stock Table */}
      <div className="admin-table-container" style={{ marginBottom: '32px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Blank Description</th>
              <th>GSM & Color</th>
              <th>S</th>
              <th>M</th>
              <th>L</th>
              <th>XL</th>
              <th>XXL</th>
              <th>Total Stock</th>
              <th>Reorder Limit</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => {
              const isLow = item.totalStock <= item.reorderPoint;
              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-title)' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{item.category}</div>
                  </td>
                  <td>
                    <span className="logistics-id">{item.gsm} GSM</span> • <span style={{ color: 'var(--color-text-body)' }}>{item.color}</span>
                  </td>
                  <td>{item.sizesStock.S}</td>
                  <td>{item.sizesStock.M}</td>
                  <td>{item.sizesStock.L}</td>
                  <td>{item.sizesStock.XL}</td>
                  <td>{item.sizesStock.XXL}</td>
                  <td style={{ fontWeight: 700 }}>
                    <span className={isLow ? styles.lowStockCount : ''}>
                      {item.totalStock} {item.unit}
                    </span>
                    {isLow && <span className={styles.alertDot} title="Low stock warning">⚠️</span>}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{item.reorderPoint} {item.unit}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className={styles.logStockBtn}
                    >
                      <Plus size={13} /> Stock In/Out
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Transaction History Logs */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-title)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <History size={16} /> Recent Warehouse Transactions
        </h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Apparel Item</th>
                <th>Adjustment</th>
                <th>Quantity</th>
                <th>Operator</th>
                <th>Notes / Allocation Reference</th>
              </tr>
            </thead>
            <tbody>
              {inventory.flatMap(item =>
                item.transactions.map((tx, idx) => ({ ...tx, itemName: item.name, itemColor: item.color, key: `${item.id}-${idx}` }))
              )
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map(tx => (
                <tr key={tx.key}>
                  <td style={{ color: 'var(--color-text-muted)' }}>{tx.date}</td>
                  <td>{tx.itemName} ({tx.itemColor})</td>
                  <td>
                    <span className={tx.type === 'IN' ? styles.txInBadge : styles.txOutBadge}>
                      {tx.type === 'IN' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {tx.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{tx.quantity} Pcs</td>
                  <td>{tx.handler}</td>
                  <td>{tx.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className="logistics-id">{selectedItem.gsm} GSM Blank SKU</span>
                <h2 style={{ fontSize: '16px', marginTop: '2px', color: '#0F172A' }}>{selectedItem.name} ({selectedItem.color})</h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedItem(null)}>✕</button>
            </div>

            <form onSubmit={handleTransactionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label className={styles.label}>Transaction Type</label>
                  <select
                    value={txType}
                    onChange={e => setTxType(e.target.value as 'IN' | 'OUT')}
                    className={styles.select}
                  >
                    <option value="IN">STOCK IN (Procurement/Restock)</option>
                    <option value="OUT">STOCK OUT (Order Allocation)</option>
                  </select>
                </div>
                <div style={{ width: '80px' }}>
                  <label className={styles.label}>Size</label>
                  <select
                    value={txSize}
                    onChange={e => setTxSize(e.target.value as any)}
                    className={styles.select}
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={styles.label}>Quantity (Pcs)</label>
                <input
                  type="number"
                  min={1}
                  value={txQty}
                  onChange={e => setTxQty(Number(e.target.value))}
                  className={styles.input}
                  required
                />
              </div>

              <div>
                <label className={styles.label}>Adjustment Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Allocation for upcoming fest / Vendor supply receipt"
                  value={txNotes}
                  onChange={e => setTxNotes(e.target.value)}
                  className={styles.input}
                />
              </div>

              {errorMsg && (
                <div style={{ color: '#E11D48', fontSize: '12px', fontWeight: 500 }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '6px 16px',
                    borderRadius: '6px',
                    background: txType === 'IN' ? '#059669' : '#D97706',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  Process Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default InventoryPage;
