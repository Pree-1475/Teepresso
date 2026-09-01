'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCart } from '@/features/cart/context/CartContext';
import { Menu, X, ShoppingBag, User as UserIcon, LogOut, PackageCheck, Layers, Home, Sparkles, LogIn, Truck } from 'lucide-react';
import styles from './Header.module.css';
import { FestiveHeader } from './FestiveHeader';

const getInitialMode = (): 'STANDARD' | 'FESTIVE' => {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('teepresso_storefront_mode');
    if (cached === 'FESTIVE' || cached === 'STANDARD') {
      return cached;
    }
  }
  return 'STANDARD';
};

export function Header() {
  const [mode, setMode] = useState<'STANDARD' | 'FESTIVE'>(getInitialMode);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, setIsCartDrawerOpen } = useCart();

  const totalCartItems = cart.items.reduce((acc, item) => acc + item.totalItemQuantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    const fetchSettings = () => {
      fetch('http://localhost:5000/api/v1/settings')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.settings && data.settings.storefrontMode) {
            const newMode = data.settings.storefrontMode as 'STANDARD' | 'FESTIVE';
            setMode(newMode);
            localStorage.setItem('teepresso_storefront_mode', newMode);
          }
        })
        .catch(() => {});
    };

    fetchSettings();
    const interval = setInterval(fetchSettings, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  if (mode === 'FESTIVE') {
    return <FestiveHeader />;
  }

  const userProfileMarkup = (className: string) => (
    isAuthenticated && (
      <div style={{ position: 'relative' }} className={className}>
        <button 
          type="button" 
          className={styles.userProfileBtn}
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        >
          <div className={styles.avatarCircle}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <span className={styles.userNameText}>{user?.name.split(' ')[0]}</span>
        </button>

        {isUserMenuOpen && (
          <div className={styles.userDropdownMenu}>
            <div className={styles.dropdownHeader}>
              <strong>{user?.name}</strong>
              <span className={styles.userRoleTag}>{user?.role.replace('_', ' ')}</span>
            </div>

            <Link 
              href="/my-orders" 
              className={styles.dropdownItem}
              onClick={() => setIsUserMenuOpen(false)}
            >
              <PackageCheck size={16} /> My Orders
            </Link>

            <button 
              type="button" 
              className={`${styles.dropdownItem} ${styles.logoutItem}`}
              onClick={handleLogout}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}
      </div>
    )
  );

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.container}`}>
        
        {/* Left Nav */}
        <nav className={styles.leftNav}>
          <div className={styles.desktopLeftLinks}>
            <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.activeLink : ''}`}>
              Home
            </Link>
            <Link href="/products" className={`${styles.navLink} ${pathname === '/products' ? styles.activeLink : ''}`}>
              All Products
            </Link>
            <Link href="/festive" className={`${styles.navLink} ${pathname === '/festive' ? styles.activeLink : ''} ${styles.festiveTag}`}>
              <Sparkles size={14} /> Festive Kurtas
            </Link>
          </div>
        </nav>

        {/* Brand Logo */}
        <div className={styles.logoWrapper}>
          <Link href="/" className={styles.logo}>
            TEEPRESSO
          </Link>
        </div>

        {/* Right Nav / Actions */}
        <div className={styles.rightNav}>
          <div className={styles.desktopRightLinks}>
            <Link href="/how-it-works" className={styles.navLink}>
              How It Works
            </Link>
            <Link href="/fabric-guide" className={styles.navLink}>
              Fabrics
            </Link>
          </div>

          <div className={styles.actionGroup}>
            {userProfileMarkup(styles.desktopUserGroup)}

            {!isAuthenticated && (
              <Link href="/login" className={styles.loginBtn}>
                <LogIn size={18} />
                <span>Sign In</span>
              </Link>
            )}

            <button 
              type="button" 
              className={styles.cartBtn}
              onClick={() => setIsCartDrawerOpen(true)}
              aria-label="Open Cart"
            >
              <ShoppingBag size={20} />
              {totalCartItems > 0 && (
                <span className={styles.cartBadge}>{totalCartItems}</span>
              )}
            </button>

            <button 
              type="button" 
              className={styles.mobileMenuToggle}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <div className={styles.mobileDrawerContent}>
            {userProfileMarkup(styles.mobileUserGroup)}

            <nav className={styles.mobileNav}>
              <Link href="/" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                <Home size={18} /> Home
              </Link>
              <Link href="/products" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                <Layers size={18} /> All Products
              </Link>
              <Link href="/festive" className={`${styles.mobileNavLink} ${styles.mobileFestiveLink}`} onClick={() => setIsMobileMenuOpen(false)}>
                <Sparkles size={18} /> Festive Collection
              </Link>
              <Link href="/how-it-works" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                <Truck size={18} /> How It Works
              </Link>
              <Link href="/fabric-guide" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                <Layers size={18} /> Fabric Guide
              </Link>
              {!isAuthenticated && (
                <Link href="/login" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                  <LogIn size={18} /> Sign In / Register
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
