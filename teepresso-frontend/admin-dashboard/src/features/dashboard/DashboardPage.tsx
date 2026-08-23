import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Image as ImageIcon,
  Users,
  Search,
  CheckCircle2,
  Package,
  CheckCircle
} from 'lucide-react';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const navigate = useNavigate();

  const recentOrders = [
    { id: 'TP-1042', title: 'College Fest 2025', status: 'LIVE', time: '5 days ago' },
    { id: 'TP-1041', title: 'ZettaScale Tech Inc', status: 'LIVE', time: '3 weeks ago' },
    { id: 'TP-1040', title: 'Greenwood RWA', status: 'LIVE', time: '1 month ago' },
  ];

  return (
    <div className={styles.dashboardContainer}>
      
      {/* Wagtail-style Header Row */}
      <div className={styles.topHeaderRow}>
        <div className={styles.topLeft}>
          <h1 className={styles.pageTitle}>teepresso</h1>
          <div className={styles.statsRow}>
            <button className={styles.statBtn} onClick={() => navigate('/orders')}>
              <FileText size={14} />
              <span>1,284 Orders</span>
            </button>
            <button className={styles.statBtn} onClick={() => navigate('/products')}>
              <Package size={14} />
              <span>2,400 Items</span>
            </button>
            <button className={styles.statBtn} onClick={() => navigate('/customers')}>
              <Users size={14} />
              <span>45 Customers</span>
            </button>
          </div>
        </div>

        <div className={styles.topRight}>
          <div className={styles.siteLogoCircle}>
            <span>TP</span>
          </div>
          <div className={styles.siteInfo}>
            <span className={styles.siteName}>Teepresso</span>
            <a href="#" className={styles.siteLink}>Account</a>
            <a href="#" className={styles.siteLinkAccent}>Teepresso ERP guide <ArrowUpRightIcon /></a>
          </div>
        </div>
      </div>

      {/* Large Search Bar */}
      <div className={styles.searchContainer}>
        <Search size={16} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search all orders..." 
          className={styles.searchInput}
        />
      </div>

      {/* Recent Edits Panel */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <CheckCircle size={14} className={styles.panelIcon} />
          <h2>Your most recent edits</h2>
        </div>
        
        <div className={styles.panelBody}>
          <table className={styles.editsTable}>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} onClick={() => navigate(`/orders/${order.id}`)}>
                  <td className={styles.editTitle}>{order.title}</td>
                  <td className={styles.editStatus}>
                    <span className={styles.statusBadge}>{order.status}</span>
                  </td>
                  <td className={styles.editTime}>{order.time}</td>
                  <td className={styles.editActions}>•••</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  );
}

export default DashboardPage;
