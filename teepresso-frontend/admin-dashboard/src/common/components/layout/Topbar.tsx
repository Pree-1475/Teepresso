import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Radio, PanelRight, Command } from 'lucide-react';
import { CmdKModal } from './CmdKModal';
import styles from './Topbar.module.css';

interface TopbarProps {
  onToggleRightPanel: () => void;
  rightPanelOpen: boolean;
}

export function Topbar({ onToggleRightPanel, rightPanelOpen }: TopbarProps) {
  const location = useLocation();
  const [cmdOpen, setCmdOpen] = useState(false);

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return 'Factory Pipeline Shell';
      case '/orders': return 'Orders Queue';
      case '/offline-orders': return 'Offline POS Billing';
      case '/mockups': return 'Proofing Gallery';
      case '/products': return 'Product Catalog';
      case '/customers': return 'Customer Database';
      case '/inventory': return 'Warehouse Blanks';
      case '/dispatch': return 'Dispatch Radar';
      case '/attendance': return 'Workforce & Roster';
      case '/reports': return 'Financial Ledger';
      case '/analytics': return 'Business Analytics';
      default: return 'Teepresso ERP';
    }
  };

  const userStr = localStorage.getItem('teepresso_user');
  const user = userStr ? JSON.parse(userStr) : { role: 'admin', name: 'Production Manager' };

  return (
    <>
      <header className={styles.topbar}>
        {/* Page Title & Live Ticker */}
        <div className={styles.leftSection}>
          <h1 className={styles.pageHeading}>{getPageTitle(location.pathname)}</h1>
          <div className={styles.liveTickerContainer}>
            <Radio size={12} className={styles.tickerPulse} />
            <span className={styles.tickerText}>
              SHOP PULSE: PRINTING ACTIVE • ⚡ 3 EXPRESS BATCHES • 📦 1,480 BLANKS
            </span>
          </div>
        </div>

        {/* Global Search Capsule with Cmd+K Trigger */}
        <div className={styles.searchCapsule} onClick={() => setCmdOpen(true)}>
          <Search size={14} color="var(--color-text-muted)" />
          <span className={styles.searchPlaceholder}>Search orders, SKUs, commands...</span>
          <kbd className={styles.cmdShortcut}>⌘K</kbd>
        </div>

        {/* Right Controls */}
        <div className={styles.rightGroup}>
          <div className={styles.roleBadge}>
            <span>{user.role.toUpperCase()}</span>
          </div>

          <button
            type="button"
            onClick={onToggleRightPanel}
            className={`${styles.toggleDockBtn} ${rightPanelOpen ? styles.toggleDockBtnActive : ''}`}
            title="Toggle Pulse Rail"
          >
            <PanelRight size={15} />
            <span>Pulse Rail</span>
          </button>
        </div>
      </header>

      <CmdKModal isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}

export default Topbar;
