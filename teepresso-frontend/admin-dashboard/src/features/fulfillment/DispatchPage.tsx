import React, { useState } from 'react';
import { Search, Filter, Download, Plus, MoreHorizontal, Truck } from 'lucide-react';
import styles from './DispatchPage.module.css';

interface DispatchItem {
  id: string;
  waybillId: string;
  orderId: string;
  client: string;
  destination: string;
  courier: string;
  boxes: number;
  weightKg: number;
  status: 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Ready to Dispatch';
}

const DISPATCH_DATA: DispatchItem[] = [
  {
    id: '1',
    waybillId: 'EWAY-9982-1049',
    orderId: 'TP-2026-8720',
    client: 'Global Consulting Group',
    destination: 'Bandra Kurla Complex, Mumbai',
    courier: 'Blue Dart Express',
    boxes: 4,
    weightKg: 28.5,
    status: 'In Transit'
  },
  {
    id: '2',
    waybillId: 'EWAY-8812-4410',
    orderId: 'TP-2026-8519',
    client: "St. Xavier's Cultural Club",
    destination: 'Dhobi Talao, South Mumbai',
    courier: 'Delhivery Surface',
    boxes: 2,
    weightKg: 14.0,
    status: 'Delivered'
  },
  {
    id: '3',
    waybillId: 'EWAY-7721-0091',
    orderId: 'TP-2026-9104',
    client: 'Greenwood Heights RWA',
    destination: 'Thane West, Maharashtra',
    courier: 'DTDC Priority',
    boxes: 3,
    weightKg: 19.2,
    status: 'Out for Delivery'
  },
  {
    id: '4',
    waybillId: 'PENDING-GEN',
    orderId: 'TP-2026-9011',
    client: 'ZettaScale Tech Inc.',
    destination: 'HSR Layout, Bangalore',
    courier: 'Pending Assignment',
    boxes: 12,
    weightKg: 145.0,
    status: 'Ready to Dispatch'
  }
];

export function DispatchPage() {
  const [items] = useState<DispatchItem[]>(DISPATCH_DATA);
  const [search, setSearch] = useState('');

  const filtered = items.filter(item => {
    return (
      item.waybillId.toLowerCase().includes(search.toLowerCase()) ||
      item.client.toLowerCase().includes(search.toLowerCase()) ||
      item.orderId.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className={styles.workspace}>
      
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dispatch Radar</h1>
          <p className={styles.subtitle}>Track outbound logistics, couriers, and E-Way bills.</p>
        </div>
        <div className={styles.actions}>
          <button className="erp-btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={14} />
            <span>Generate E-Way Bill</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} className="text-muted" />
          <input
            type="text"
            placeholder="Search E-Way Bill, Client, Order ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <button className="erp-btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Truck size={14} />
            <span>Couriers</span>
          </button>
          <button className="erp-btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Filter size={14} />
            <span>Filter Status</span>
          </button>
          <button className="erp-btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Download size={14} />
            <span>Export Manifest</span>
          </button>
        </div>
      </div>

      {/* Clean Table Container */}
      <div className="erp-table-container">
        <table className="erp-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" /></th>
              <th>Waybill / Order Ref</th>
              <th>Client Organization</th>
              <th>Destination</th>
              <th>Courier Partner</th>
              <th>Cargo</th>
              <th>Status</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id}>
                <td><input type="checkbox" /></td>
                <td>
                  <div className="text-mono" style={{ fontWeight: 600 }}>{item.waybillId}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Ref: {item.orderId}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{item.client}</div>
                </td>
                <td className="text-muted" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.destination}
                </td>
                <td>
                  <span style={{ fontWeight: 500 }}>{item.courier}</span>
                </td>
                <td>
                  <div>{item.boxes} Boxes</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>{item.weightKg} kg</div>
                </td>
                <td>
                  <span className={`badge ${
                    item.status === 'Delivered' ? 'badge-success' : 
                    item.status === 'Ready to Dispatch' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {item.status}
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

export default DispatchPage;
