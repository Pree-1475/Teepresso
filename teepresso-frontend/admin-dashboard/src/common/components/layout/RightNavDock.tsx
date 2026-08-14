import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  Box,
  Palette,
  Truck,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  UserCircle
} from 'lucide-react';
import styles from './RightNavDock.module.css'; // Keeping filename to avoid breaking imports, but it acts as a left Sidebar

export function RightNavDock() {
  const topItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Orders', path: '/orders', icon: Package },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Products', path: '/products', icon: Box },
    { label: 'Design Queue', path: '/mockups', icon: Palette },
    { label: 'Production', path: '/inventory', icon: Box },
    { label: 'Dispatch', path: '/dispatch', icon: Truck },
    { label: 'Payments', path: '/offline-orders', icon: CreditCard },
    { label: 'Reports', path: '/reports', icon: BarChart3 }
  ];

  const bottomItems = [
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Help', path: '/help', icon: HelpCircle },
    { label: 'Profile', path: '/profile', icon: UserCircle }
  ];

  return (
    <aside className={styles.erpSidebar}>
      <div className={styles.sidebarSection}>
        {topItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `${styles.iconItem} ${isActive ? styles.iconItemActive : ''}`
              }
              end={item.path === '/'}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className={styles.tooltip}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className={styles.sidebarSection}>
        {bottomItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `${styles.iconItem} ${isActive ? styles.iconItemActive : ''}`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className={styles.tooltip}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}

export default RightNavDock;
