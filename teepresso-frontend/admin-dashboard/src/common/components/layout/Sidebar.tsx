import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  ChevronUp,
  ClipboardList,
  TrendingUp,
  Box,
  Shield,
  Sliders,
  Warehouse
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [snippetsMenuOpen, setSnippetsMenuOpen] = useState(false);

  // Close submenu on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickedOutsideSidebar = !target.closest(`.${styles.sidebar}`);
      const clickedOutsideFlyout = !target.closest('.wagtail-flyout-panel');
      if (clickedOutsideSidebar && clickedOutsideFlyout) {
        setSubmenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close submenu when sidebar is collapsed
  useEffect(() => {
    if (collapsed) {
      setSubmenuOpen(false);
    }
  }, [collapsed]);
  
  const userStr = localStorage.getItem('teepresso_user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Admin', role: 'admin' };

  // Menu Definition
  const dashboardItem = { label: 'Dashboard', path: '/', icon: LayoutDashboard };
  
  const ordersGroup = {
    label: 'Orders',
    icon: ShoppingBag,
    subItems: [
      { label: 'Order Queue', path: '/orders' },
      { label: 'Verify Mockups', path: '/mockups' },
      { label: 'Dispatch', path: '/dispatch' }
    ]
  };

  // Auto-expand Orders submenu if visiting any orders sub-page
  useEffect(() => {
    const isOrderPath = ordersGroup.subItems.some(sub => sub.path === location.pathname);
    if (isOrderPath && !collapsed) {
      setSubmenuOpen(true);
    }
  }, [location.pathname, collapsed]);

  const otherItems = [
    { label: 'Products', path: '/products', icon: Box },
    { label: 'Stock Overview', path: '/stock-overview', icon: Warehouse },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Offline POS', path: '/offline-orders', icon: ClipboardList },
    { label: 'Reports', path: '/reports', icon: TrendingUp },
    { label: 'Snippets', path: '/snippets', icon: Sliders },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  if (user.role === 'admin') {
    otherItems.push({ label: 'Manage Users', path: '/users', icon: Shield });
  }

  return (
    <div style={{ display: 'flex', position: 'relative' }}>
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
          {/* Dashboard */}
          <NavLink
            to={dashboardItem.path}
            onClick={() => { setSubmenuOpen(false); setSnippetsMenuOpen(false); }}
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            end
          >
            <div className={styles.navLinkLeft}>
              <LayoutDashboard size={16} className={styles.navIcon} />
              {!collapsed && <span>{dashboardItem.label}</span>}
            </div>
            {!collapsed && <ChevronRight size={14} className={styles.navChevron} />}
          </NavLink>

          {/* Collapsible Orders Menu (Down itself) */}
          <div
            className={`${styles.navLink} ${submenuOpen ? styles.navLinkActive : ''}`}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: collapsed ? 'center' : 'space-between' }}
            onClick={() => {
              if (collapsed) {
                setCollapsed(false);
                setSubmenuOpen(true);
                setSnippetsMenuOpen(false);
              } else {
                setSubmenuOpen(!submenuOpen);
                setSnippetsMenuOpen(false);
              }
            }}
          >
            <div className={styles.navLinkLeft}>
              <ShoppingBag size={16} className={styles.navIcon} />
              {!collapsed && <span>Orders</span>}
            </div>
            {!collapsed && <ChevronRight size={14} style={{ transform: submenuOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />}
          </div>

          {submenuOpen && !collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ordersGroup.subItems.map((sub, idx) => (
                <NavLink
                  key={idx}
                  to={sub.path}
                  onClick={() => setSnippetsMenuOpen(false)}
                  className={({ isActive }) => `${styles.subNavLink} ${isActive ? styles.subNavLinkActive : ''}`}
                >
                  <span>{sub.label}</span>
                </NavLink>
              ))}
            </div>
          )}



          {/* Other Pages */}
          {otherItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={idx}
                to={item.path}
                onClick={() => { setSubmenuOpen(false); setSnippetsMenuOpen(false); }}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                <div className={styles.navLinkLeft}>
                  <Icon size={16} className={styles.navIcon} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && <ChevronRight size={14} className={styles.navChevron} />}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom User Profile */}
        <div className={styles.bottomSection} style={{ position: 'relative' }}>
          {/* Floating Logout Popover */}
          {popoverOpen && (
            <div className={styles.profilePopover}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Account options
              </div>
              <button onClick={onLogout} className={styles.popoverItem} style={{ fontWeight: 'bold', color: 'var(--color-status-danger)' }}>
                Sign Out / Logout
              </button>
            </div>
          )}

          <div className={styles.userProfile} style={{ cursor: 'pointer' }} onClick={() => setPopoverOpen(!popoverOpen)}>
            <div className={styles.userAvatar}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>TP</span>
            </div>
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                <span className={styles.userName} style={{ color: 'var(--color-text-title)' }}>{user.name}</span>
                <ChevronUp size={14} style={{ color: 'var(--color-text-muted)' }} />
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Sidebar;
