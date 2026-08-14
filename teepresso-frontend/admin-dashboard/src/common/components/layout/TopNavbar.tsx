import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  LogOut,
  User
} from 'lucide-react';
import { CmdKModal } from './CmdKModal';
import styles from './TopNavbar.module.css';

interface TopNavbarProps {
  onLogout: () => void;
}

export function TopNavbar({ onLogout }: TopNavbarProps) {
  const navigate = useNavigate();
  const [cmdOpen, setCmdOpen] = useState(false);

  const storedUser = localStorage.getItem('teepresso_user');
  const user = storedUser ? JSON.parse(storedUser) : { name: 'Admin' };

  return (
    <>
      <header className={styles.erpTopbar}>
        {/* Left Side: Brand */}
        <div className={styles.brandSection} onClick={() => navigate('/')}>
          <span className={styles.brandName}>TEEPRESSO</span>
          <span className={styles.brandBadge}>ERP</span>
        </div>

        {/* Center: Global Search */}
        <div className={styles.searchSection}>
          <button className={styles.searchButton} onClick={() => setCmdOpen(true)}>
            <Search size={14} className={styles.searchIcon} />
            <span className={styles.searchText}>Search orders, customers, products...</span>
            <span className={styles.searchShortcut}>⌘K</span>
          </button>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className={styles.actionsSection}>
          <button className={styles.iconButton} title="Notifications">
            <Bell size={16} />
          </button>
          
          <div className={styles.divider}></div>

          <div className={styles.profileSection}>
            <div className={styles.avatar}>
              <User size={14} />
            </div>
            <span className={styles.userName}>{user.name}</span>
          </div>

          <button onClick={onLogout} className={styles.iconButton} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <CmdKModal isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}

export default TopNavbar;
