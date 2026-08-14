import React, { useState } from 'react';
import { Mail, Phone, Search, Download, Plus, MoreHorizontal } from 'lucide-react';
import styles from './CustomersAdminPage.module.css';

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  orgName: string;
  orgType: 'University' | 'Corporate' | 'Startup' | 'Community';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

const CUSTOMERS_DATA: CustomerItem[] = [
  {
    id: 'c_1',
    name: 'Rahul Sharma',
    email: 'rahul.s@iitb.ac.in',
    phone: '98765 43210',
    orgName: 'IIT Bombay TechFest',
    orgType: 'University',
    totalOrders: 4,
    totalSpent: 84500,
    lastOrderDate: 'Aug 10, 2026',
  },
  {
    id: 'c_2',
    name: 'Ananya Verma',
    email: 'ananya@techcorp.io',
    phone: '98112 23344',
    orgName: 'ZettaScale Tech Inc.',
    orgType: 'Startup',
    totalOrders: 2,
    totalSpent: 76000,
    lastOrderDate: 'Aug 11, 2026',
  },
  {
    id: 'c_3',
    name: 'Priya Nair',
    email: 'pnair@globalconsulting.com',
    phone: '97445 56677',
    orgName: 'Global Consulting Group',
    orgType: 'Corporate',
    totalOrders: 6,
    totalSpent: 245000,
    lastOrderDate: 'Aug 07, 2026',
  },
  {
    id: 'c_4',
    name: 'Vikramaditya Roy',
    email: 'roy@suburbansociety.org',
    phone: '99001 12233',
    orgName: 'Greenwood Heights RWA',
    orgType: 'Community',
    totalOrders: 3,
    totalSpent: 92400,
    lastOrderDate: 'Aug 09, 2026',
  },
];

export function CustomersAdminPage() {
  const [customers] = useState<CustomerItem[]>(CUSTOMERS_DATA);
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.orgName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.workspace}>
      
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customers & Organizations</h1>
          <p className={styles.subtitle}>Registered accounts & lifetime order value (LTV)</p>
        </div>
        <div className={styles.actions}>
          <button className="erp-btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={14} />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} className="text-muted" />
          <input
            type="text"
            placeholder="Search Customers, Organizations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <button className="erp-btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Clean Table Container */}
      <div className="erp-table-container">
        <table className="erp-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" /></th>
              <th>Customer Name</th>
              <th>Organization</th>
              <th>Contact Details</th>
              <th>Total Orders</th>
              <th>Lifetime Value</th>
              <th>Last Order</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td><input type="checkbox" /></td>
                <td>
                  <div style={{ fontWeight: 500 }}>{c.name}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{c.orgName}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>{c.orgType}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <Mail size={12} className="text-muted" /> {c.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '2px' }}>
                    <Phone size={12} className="text-muted" /> {c.phone}
                  </div>
                </td>
                <td><strong>{c.totalOrders}</strong></td>
                <td><strong>₹{c.totalSpent.toLocaleString('en-IN')}</strong></td>
                <td className="text-muted">{c.lastOrderDate}</td>
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

export default CustomersAdminPage;
