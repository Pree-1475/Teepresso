import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import styles from './InventoryPage.module.css';

interface BlankItem {
  id: string;
  sku: string;
  garmentName: string;
  category: string;
  color: string;
  gsm: string;
  unitCost: number;
  onHand: number;
  totalVal: number;
  stockStatus: 'Optimal' | 'Low Stock' | 'Critical';
}

const INVENTORY_DATA: BlankItem[] = [
  {
    id: '1',
    sku: 'BLK-TEE-240-BLK',
    garmentName: '240 GSM Oversized Cotton Blank Tee',
    category: 'T-Shirts',
    color: 'Jet Black',
    gsm: '240 GSM',
    unitCost: 220,
    onHand: 450,
    totalVal: 99000,
    stockStatus: 'Optimal'
  },
  {
    id: '2',
    sku: 'BLK-KRT-180-WHT',
    garmentName: '180 GSM Pure Linen Short Kurta Blank',
    category: 'Kurtas',
    color: 'Off-White',
    gsm: '180 GSM',
    unitCost: 380,
    onHand: 35,
    totalVal: 13300,
    stockStatus: 'Low Stock'
  },
  {
    id: '3',
    sku: 'BLK-PLO-220-NVY',
    garmentName: '220 GSM Pique Cotton Corporate Polo Blank',
    category: 'Polos',
    color: 'Navy Blue',
    gsm: '220 GSM',
    unitCost: 310,
    onHand: 280,
    totalVal: 86800,
    stockStatus: 'Optimal'
  },
  {
    id: '4',
    sku: 'BLK-HDY-350-GRY',
    garmentName: '350 GSM Heavy Fleece Pullover Hoodie Blank',
    category: 'Hoodies',
    color: 'Heather Grey',
    gsm: '350 GSM',
    unitCost: 550,
    onHand: 12,
    totalVal: 6600,
    stockStatus: 'Critical'
  }
];

export function InventoryPage() {
  const [items] = useState<BlankItem[]>(INVENTORY_DATA);
  const [search, setSearch] = useState('');

  const filtered = items.filter(item => {
    return (
      item.garmentName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className={styles.workspace}>
      
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Blanks Stock</h1>
          <p className={styles.subtitle}>Manage warehouse inventory and blank garments.</p>
        </div>
        <div className={styles.actions}>
          <button className="erp-btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={14} />
            <span>Restock Blanks</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} className="text-muted" />
          <input
            type="text"
            placeholder="Search Garment, SKU..."
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

      {/* Clean Table Container */}
      <div className="erp-table-container">
        <table className="erp-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" /></th>
              <th>SKU</th>
              <th>Garment Name</th>
              <th>Category</th>
              <th>Color / Spec</th>
              <th>Unit Cost</th>
              <th>Stock</th>
              <th>Total Value</th>
              <th>Status</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id}>
                <td><input type="checkbox" /></td>
                <td className="text-mono">{item.sku}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{item.garmentName}</div>
                </td>
                <td className="text-muted">{item.category}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{item.color}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>{item.gsm}</div>
                </td>
                <td>₹{item.unitCost}</td>
                <td><strong style={{ color: item.onHand < 50 ? 'var(--color-status-danger)' : 'inherit' }}>{item.onHand} Pcs</strong></td>
                <td>₹{item.totalVal.toLocaleString('en-IN')}</td>
                <td>
                  <span className={`badge ${
                    item.stockStatus === 'Optimal' ? 'badge-success' : 
                    item.stockStatus === 'Low Stock' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {item.stockStatus}
                  </span>
                </td>
                <td>
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

export default InventoryPage;
