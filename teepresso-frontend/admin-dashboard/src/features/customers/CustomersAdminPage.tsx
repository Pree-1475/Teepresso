import React, { useState, useEffect } from 'react';
import { Mail, Phone, Search, Download, Plus, MoreHorizontal, X, User, Building } from 'lucide-react';
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

export function CustomersAdminPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load live customer database from backend
  useEffect(() => {
    fetch('http://localhost:5000/api/v1/customers')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.customers)) {
          setCustomers(data.customers);
        }
      })
      .catch(err => console.error('Failed to load customers from backend:', err))
      .finally(() => setLoading(false));
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orgName: '',
    orgType: 'Corporate' as 'University' | 'Corporate' | 'Startup' | 'Community',
    totalOrders: 1,
    totalSpent: 0,
  });

  const [formError, setFormError] = useState('');

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.orgName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      orgName: '',
      orgType: 'Corporate',
      totalOrders: 1,
      totalSpent: 0,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.orgName.trim()) {
      setFormError('Please fill in all required fields (Name, Email, Organization).');
      return;
    }

    const newCustomer: CustomerItem = {
      id: `c_${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || 'N/A',
      orgName: formData.orgName.trim(),
      orgType: formData.orgType,
      totalOrders: Number(formData.totalOrders || 0),
      totalSpent: Number(formData.totalSpent || 0),
      lastOrderDate: 'Just Now',
    };

    setCustomers([newCustomer, ...customers]);
    setShowModal(false);
  };

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = ['ID,Name,Email,Phone,Organization,OrgType,TotalOrders,TotalSpent,LastOrderDate'];
    const rows = customers.map(c => `"${c.id}","${c.name}","${c.email}","${c.phone}","${c.orgName}","${c.orgType}",${c.totalOrders},${c.totalSpent},"${c.lastOrderDate}"`);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'teepresso_customers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.workspace}>
      
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customers & Organizations</h1>
          <p className={styles.subtitle}>Registered accounts & lifetime order value (LTV)</p>
        </div>
        <div className={styles.actions}>
          <button 
            onClick={handleOpenModal} 
            className="erp-btn-primary" 
            style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}
          >
            <Plus size={14} />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} className="text-muted" />
          <input
            type="text"
            placeholder="Search Customers, Organizations, Email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <button 
            onClick={handleExportCSV} 
            className="erp-btn-secondary" 
            style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}
          >
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
                  <div style={{ fontWeight: 600, color: 'var(--color-text-title)' }}>{c.name || '—'}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>ID: {c.id}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{c.orgName || '—'}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>{c.orgType || '—'}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <Mail size={12} className="text-muted" /> {c.email || '—'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '2px' }}>
                    <Phone size={12} className="text-muted" /> {c.phone || '—'}
                  </div>
                </td>
                <td><strong>{c.totalOrders !== undefined ? c.totalOrders : 0}</strong></td>
                <td><strong>₹{(c.totalSpent || 0).toLocaleString('en-IN')}</strong></td>
                <td className="text-muted">{c.lastOrderDate || 'Registered via OTP'}</td>
                <td>
                  <button className={styles.moreBtn}><MoreHorizontal size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD NEW CUSTOMER MODAL OVERLAY */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            backgroundColor: 'var(--color-surface-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            width: '100%',
            maxWidth: '520px',
            overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-surface-hover)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} style={{ color: 'var(--color-primary-600)' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text-title)' }}>
                  Add New Customer / Organization
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} style={{ padding: '24px' }}>
              {formError && (
                <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', color: '#dc2626', borderRadius: '4px', fontSize: '12px', fontWeight: 600, marginBottom: '16px' }}>
                  ⚠️ {formError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-title)', marginBottom: '6px' }}>Customer Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Anish Kumar"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '13px' }}
                    required
                  />
                </div>

                {/* Email & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-title)', marginBottom: '6px' }}>Email Address *</label>
                    <input
                      type="email"
                      placeholder="anish@company.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '13px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-title)', marginBottom: '6px' }}>Phone Number</label>
                    <input
                      type="text"
                      placeholder="98765 12345"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '13px' }}
                    />
                  </div>
                </div>

                {/* Organization Name & Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-title)', marginBottom: '6px' }}>Organization Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp / BITS Pilani"
                      value={formData.orgName}
                      onChange={e => setFormData({ ...formData, orgName: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '13px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-title)', marginBottom: '6px' }}>Org Type</label>
                    <select
                      value={formData.orgType}
                      onChange={e => setFormData({ ...formData, orgType: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '13px', backgroundColor: 'var(--color-surface-white)' }}
                    >
                      <option value="Corporate">Corporate</option>
                      <option value="University">University</option>
                      <option value="Startup">Startup</option>
                      <option value="Community">Community</option>
                    </select>
                  </div>
                </div>

                {/* Orders & Initial Spent */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-title)', marginBottom: '6px' }}>Total Orders</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.totalOrders}
                      onChange={e => setFormData({ ...formData, totalOrders: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-title)', marginBottom: '6px' }}>Lifetime Value (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.totalSpent}
                      onChange={e => setFormData({ ...formData, totalSpent: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="erp-btn-secondary"
                  style={{ cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="erp-btn-primary"
                  style={{ cursor: 'pointer' }}
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default CustomersAdminPage;
