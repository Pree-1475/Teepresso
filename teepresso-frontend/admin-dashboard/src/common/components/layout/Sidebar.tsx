import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Palette,
  Shirt,
  Users,
  TrendingUp,
  LogOut,
  Layers,
  ClipboardList,
  Truck,
  Database
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  // Read active user details
  const userStr = localStorage.getItem('teepresso_user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Production Manager', role: 'admin', email: 'admin@teepresso.com' };

  // Define navigation based on operational roles
  const getNavItems = (role: string) => {
    const common = [{ label: 'Overview', path: '/', icon: LayoutDashboard }];
    
    switch (role) {
      case 'admin':
        return [
          ...common,
          { label: 'Orders Queue', path: '/orders', icon: ShoppingBag },
          { label: 'Proof Approvals', path: '/mockups', icon: Palette },
          { label: 'Profit & Loss', path: '/reports', icon: TrendingUp },
          { label: 'Employee Attendance', path: '/attendance', icon: ClipboardList },
          { label: 'Product Catalog', path: '/products', icon: Shirt },
          { label: 'Customers', path: '/customers', icon: Users },
        ];
      case 'manager':
        return [
          ...common,
          { label: 'Inventory Ledger', path: '/inventory', icon: Database },
          { label: 'Orders Queue', path: '/orders', icon: ShoppingBag },
          { label: 'Offline Orders', path: '/offline-orders', icon: ClipboardList }
        ];
      case 'editing_team':
        return [
          ...common,
          { label: 'Mockups Queue', path: '/mockups', icon: Palette }
        ];
      case 'dispatch_team':
        return [
          ...common,
          { label: 'Dispatch Console', path: '/dispatch', icon: Truck }
        ];
      default:
        return common;
    }
  };

  const navItems = getNavItems(user.role);

  // Format email/role indicator
  const getRoleLabel = (r: string) => {
    if (r === 'admin') return 'Admin Portal';
    if (r === 'manager') return 'Ops Manager';
    if (r === 'editing_team') return 'Design Editor';
    if (r === 'dispatch_team') return 'Logistics Lead';
    return r;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className={styles.sidebar}>
      {/* Brand Header */}
      <div className={styles.brandHeader}>
        <div className={styles.logoBadge}>
          <Layers size={14} color="#FFFFFF" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className={styles.brandTitle}>teepresso</h2>
          <span className={styles.brandSub}>{getRoleLabel(user.role).toUpperCase()}</span>
        </div>
      </div>

      {/* Nav List with Subtle Left-Border Active Indicators */}
      <nav className={styles.navSection}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              end={item.path === '/'}
            >
              <Icon size={15} className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className={styles.userProfileFooter}>
        <div className={styles.avatar}>{getInitials(user.name)}</div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user.name}</div>
          <div className={styles.userRole}>{getRoleLabel(user.role)}</div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className={styles.logoutBtn}
          title="Sign Out of Console"
        >
          <LogOut size={13} />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
