import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  ShoppingBag,
  Palette,
  Truck,
  Users,
  Settings,
  Shirt,
  ArrowLeftToLine,
  ArrowRightToLine,
  ChevronRight,
  ClipboardList,
  TrendingUp,
  Box
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const userStr = localStorage.getItem('teepresso_user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Admin', role: 'admin' };

  const navItems = [
    { label: 'Search', path: '/search', icon: Search, noChevron: true },
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Orders', path: '/orders', icon: ShoppingBag },
    { label: 'Mockups', path: '/mockups', icon: Palette },
    { label: 'Products', path: '/products', icon: Box },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Dispatch', path: '/dispatch', icon: Truck },
    { label: 'Offline POS', path: '/offline-orders', icon: ClipboardList },
    { label: 'Reports', path: '/reports', icon: TrendingUp },
  ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      {/* Top Header Row (Collapse Btn + Brand) */}
      <div className={styles.topSection}>
        {collapsed ? (
          <button className={styles.collapseBtnCenter} onClick={() => setCollapsed(false)}>
            <ArrowRightToLine size={16} />
          </button>
        ) : (
          <div className={styles.brandHero}>
            <div className={styles.heroCircle}>
              <Shirt className={styles.heroIcon} color="#ffffff" strokeWidth={1.5} />
            </div>
            <button className={styles.collapseBtnRight} onClick={() => setCollapsed(true)}>
              <ArrowLeftToLine size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className={styles.navSection}>
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
              end={item.path === '/'}
            >
              <div className={styles.navLinkLeft}>
                <Icon size={16} className={styles.navIcon} />
                {!collapsed && <span>{item.label}</span>}
              </div>
              {!collapsed && !item.noChevron && (
                <ChevronRight size={14} className={styles.navChevron} />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Profile */}
      <div className={styles.bottomSection}>
        <div className={styles.userProfile}>
          <button className={styles.iconBtn} onClick={() => {}} title="Settings">
            <Settings size={18} />
          </button>
          {!collapsed && (
            <button className={styles.userBtn} onClick={onLogout}>
              <div className={styles.userAvatar}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>TP</span>
              </div>
              <span className={styles.userName}>{user.name}</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
