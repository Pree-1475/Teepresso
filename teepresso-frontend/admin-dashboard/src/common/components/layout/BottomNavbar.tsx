import React, { useState } from 'react';
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
  Search,
  Bell,
  LogOut,
  UserCircle
} from 'lucide-react';
import { CmdKModal } from './CmdKModal';
import styles from './BottomNavbar.module.css';

interface BottomNavbarProps {
  onLogout: () => void;
}

export function BottomNavbar({ onLogout }: BottomNavbarProps) {
  const [cmdOpen, setCmdOpen] = useState(false);

  const navItems = [
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

  return (
    <>
      <nav className={styles.bottomNav}>
        {/* Left Side: Brand */}
        <div className={styles.brandSection}>
          <span className={styles.brandName}>TEEPRESSO ERP</span>
        </div>

        {/* Right Side: All clickables */}
        <div className={styles.clickablesContainer}>
          <button className={styles.iconItem} onClick={() => setCmdOpen(true)} title="Search (⌘K)">
            <Search size={18} strokeWidth={1.8} />
          </button>
          
          <div className={styles.divider}></div>

          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={idx}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.iconItem} ${isActive ? styles.iconItemActive : ''}`
                }
                end={item.path === '/'}
                title={item.label}
              >
                <Icon size={18} strokeWidth={1.8} />
              </NavLink>
            );
          })}

          <div className={styles.divider}></div>

          <button className={styles.iconItem} title="Notifications">
            <Bell size={18} strokeWidth={1.8} />
          </button>
          <button className={styles.iconItem} title="Profile">
            <UserCircle size={18} strokeWidth={1.8} />
          </button>
          <button className={styles.iconItem} onClick={onLogout} title="Sign Out">
            <LogOut size={18} strokeWidth={1.8} />
          </button>
        </div>
      </nav>
      <CmdKModal isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}
