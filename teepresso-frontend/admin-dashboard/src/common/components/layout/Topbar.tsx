import React from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, LayoutGrid, Settings, MapPin, ChevronDown } from 'lucide-react';
import styles from './Topbar.module.css';

export function Topbar() {
  const location = useLocation();

  // Map path to page title
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return 'Inventory'; // Set to match the image title "Inventory" by default for dashboard overview
      case '/orders': return 'Orders Queue';
      case '/offline-orders': return 'Offline Billing';
      case '/mockups': return 'Proofing Gallery';
      case '/products': return 'Product Catalog';
      case '/customers': return 'Customer Database';
      case '/inventory': return 'Inventory Ledger';
      case '/dispatch': return 'Logistics Console';
      case '/attendance': return 'Operations Register';
      case '/reports': return 'Financial Ledger';
      case '/analytics': return 'Business Analytics';
      default: return 'Teepresso';
    }
  };

  return (
    <header className={styles.topbar}>
      {/* Dynamic Page Heading */}
      <h1 className={styles.pageHeading}>{getPageTitle(location.pathname)}</h1>

      {/* Pill Actions Group */}
      <div className={styles.rightGroup}>
        {/* Storage Location Capsule */}
        <div className={styles.capsuleBtn}>
          <MapPin size={13} className={styles.capsuleIcon} />
          <span className={styles.capsuleText}>Storage: 51 Port Terminal Blvd # 12, Bayonne, NJ</span>
          <ChevronDown size={12} className={styles.chevron} />
        </div>

        {/* Month Filter Capsule */}
        <div className={styles.capsuleBtn}>
          <Calendar size={13} className={styles.capsuleIcon} />
          <span className={styles.capsuleText}>Month</span>
          <ChevronDown size={12} className={styles.chevron} />
        </div>

        {/* Grid Icon Capsule */}
        <button type="button" className={styles.iconPill} title="Layout View">
          <LayoutGrid size={14} />
        </button>

        {/* Settings Capsule */}
        <button type="button" className={styles.iconPill} title="Settings">
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
}

export default Topbar;
