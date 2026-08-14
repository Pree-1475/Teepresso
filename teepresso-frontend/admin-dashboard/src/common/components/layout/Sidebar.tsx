import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Palette,
  Database,
  Truck,
  Users,
  ClipboardList,
  Shirt,
  TrendingUp,
  LogOut,
  Layers
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const userStr = localStorage.getItem('teepresso_user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Production Manager', role: 'admin' };

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Orders Queue', path: '/orders', icon: ShoppingBag },
    { label: 'Proofing Gallery', path: '/mockups', icon: Palette },
    { label: 'Warehouse Blanks', path: '/inventory', icon: Database },
    { label: 'Dispatch Radar', path: '/dispatch', icon: Truck },
    { label: 'Workforce Roster', path: '/attendance', icon: Users },
    { label: 'Offline POS', path: '/offline-orders', icon: ClipboardList },
    { label: 'Product Catalog', path: '/products', icon: Shirt },
    { label: 'Financial Ledger', path: '/reports', icon: TrendingUp }
  ];

  return (
    <aside className={styles.sidebar}>
      {/* Brand Header */}
      <div className={styles.brandHeader}>
        <div className={styles.logoBadge}>
          <Layers size={16} color="#FFFFFF" />
        </div>
        <div className={styles.brandInfo}>
          <span className={styles.brandName}>teepresso</span>
          <span className={styles.brandRole}>{user.role.toUpperCase()} CONSOLE</span>
        </div>
      </div>

      {/* Flat Monochrome Nav Links */}
      <nav className={styles.navSection}>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
              end={item.path === '/'}
            >
              <Icon size={15} className={styles.navIcon} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className={styles.userFooter}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.name}</span>
          <span className={styles.userRole}>{user.role}</span>
        </div>
        <button onClick={onLogout} className={styles.logoutBtn} title="Sign Out">
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
