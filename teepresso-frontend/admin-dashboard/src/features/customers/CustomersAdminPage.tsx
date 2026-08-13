import React, { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import styles from './CustomersAdminPage.module.css';

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  orgName: string;
  orgType: 'University' | 'Corporate' | 'Startup' | 'Colony/Community';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

const CUSTOMERS_DATA: CustomerItem[] = [
  {
    id: 'c_1',
    name: 'Rahul Sharma',
    email: 'rahul.s@iitb.ac.in',
    phone: '9876543210',
    orgName: 'IIT Bombay TechFest Committee',
    orgType: 'University',
    totalOrders: 4,
    totalSpent: 84500,
    lastOrderDate: 'Aug 10, 2026',
  },
  {
    id: 'c_2',
    name: 'Ananya Verma',
    email: 'ananya@techcorp.io',
    phone: '9811223344',
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
    phone: '9744556677',
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
    phone: '9900112233',
    orgName: 'Greenwood Heights RWA',
    orgType: 'Colony/Community',
    totalOrders: 3,
    totalSpent: 92400,
    lastOrderDate: 'Aug 09, 2026',
  },
];

export function CustomersAdminPage() {
  const [customers] = useState<CustomerItem[]>(CUSTOMERS_DATA);

  return (
    <div className="admin-page-container">
      <div className={styles.header}>
        <h1 className={styles.title}>Customers & Organizations</h1>
        <p className={styles.subtitle}>Registered accounts & lifetime order value (LTV)</p>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Organization</th>
              <th>Contact Details</th>
              <th>Total Orders</th>
              <th>Lifetime Value (LTV)</th>
              <th>Last Order</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600, color: '#0F172A' }}>{c.name}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{c.orgName}</div>
                  <span className={styles.typeBadge}>{c.orgType}</span>
                </td>
                <td>
                  <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={11} color="var(--color-text-subtle)" /> {c.email}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={11} color="var(--color-text-subtle)" /> {c.phone}
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>{c.totalOrders} Orders</td>
                <td style={{ fontWeight: 700, color: '#0F172A' }}>
                  ₹{c.totalSpent.toLocaleString('en-IN')}
                </td>
                <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{c.lastOrderDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomersAdminPage;
