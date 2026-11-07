'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCart } from '@/features/cart/context/CartContext';
import { Menu, X, ShoppingBag, User as UserIcon, LogOut, PackageCheck, Layers, Home, Sparkles, LogIn, Truck } from 'lucide-react';
import styles from './Header.module.css';
import { STOREFRONT_MODE } from '@/common/config/storefront';
import { FestiveHeader } from './FestiveHeader';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const pathname = usePathname();
  const isProductPage = pathname.startsWith('/product/');
  const isHomePage = pathname === '/';
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, setIsCartDrawerOpen } = useCart();

  const totalCartItems = cart.items.reduce((acc, item) => acc + item.totalItemQuantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const signInMarkup = (className: string) => {
    if (pathname === '/login') return null;
    return !isAuthenticated && (
      <div className={className}>
        <Link href="/login" className={styles.quoteBtn}>
          Sign In
        </Link>
      </div>
    );
  };

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
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''} ${isHomePage && !isScrolled ? styles.onDarkHero : ''}`}>
      <div className={`container ${styles.container}`}>
        
        {/* Left Nav */}
        <nav className={styles.leftNav}>
          <div className={styles.desktopLeftLinks}>
            <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.activeLink : ''}`}>
              Home
            </Link>
            <Link href="/products" className={`${styles.navLink} ${pathname === '/products' ? styles.activeLink : ''}`}>
              Products
            </Link>
            <Link href="/festive" className={`${styles.navLink} ${pathname === '/festive' ? styles.activeLink : ''}`} style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>
              Festive <span className={styles.newBadge}>New</span>
            </Link>
            <Link href="/fabric-guide" className={`${styles.navLink} ${pathname === '/fabric-guide' ? styles.activeLink : ''}`}>
              Fabric & Printing
            </Link>
          </div>

          {/* Mobile Hamburger Menu (Only on Product Page) */}
          {isProductPage && (
            <button 
              className={styles.mobileHamburgerBtn}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" strokeDasharray="4 3"/>
                <line x1="4" y1="12" x2="20" y2="12" strokeDasharray="4 3"/>
                <line x1="4" y1="18" x2="20" y2="18" strokeDasharray="4 3"/>
              </svg>
            </button>
          )}

          {/* User Profile Badge (Moved to Left on Mobile Only, hidden on Product Page) */}
          {!isProductPage && userProfileMarkup(styles.mobileOnlyProfile)}
          {!isProductPage && signInMarkup(styles.mobileOnlyProfile)}
        </nav>

        {/* Center Logo */}
        <div className={styles.logo}>
          <Link href="/">
            <span className={styles.logoText}>teepresso.</span>
          </Link>
        </div>

        {/* Right Nav */}
        <div className={styles.rightNav}>
          <div className={styles.desktopRightLinks}>
            <Link href="/my-orders" className={`${styles.navLink} ${pathname === '/my-orders' ? styles.activeLink : ''}`}>
              My Orders
            </Link>
          </div>
          
          

          {signInMarkup(styles.desktopOnlyProfile)}
          {/* User Profile Badge (Right on Desktop Only) */}
          {userProfileMarkup(styles.desktopOnlyProfile)}

          <button 
            type="button" 
            className={styles.bagBtn} 
            aria-label="Open Cart" 
            onClick={() => setIsCartDrawerOpen(true)}
            style={{ position: 'relative' }}
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalCartItems > 0 && (
              <span className={styles.cartBadge}>{totalCartItems}</span>
            )}
          </button>
          
        </div>

      </div>

      {/* Floating Action Button (FAB) for Mobile Menu (Hidden on Product Page) */}
      {!isProductPage && (
        <button 
          className={`${styles.fabButton} ${isMobileMenuOpen ? styles.fabHidden : ''}`}
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" strokeDasharray="4 3"/>
            <line x1="4" y1="12" x2="20" y2="12" strokeDasharray="4 3"/>
            <line x1="4" y1="18" x2="20" y2="18" strokeDasharray="4 3"/>
          </svg> MENU
        </button>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenuOverlay} onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Mobile Menu Card */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''} ${isProductPage ? styles.mobileMenuRaised : ''}`}>
        <nav className={styles.mobileNavWrapper}>
          <ul className={styles.mobileNavList}>
            <li>
              <Link href="/" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                <Home size={18} style={{ marginRight: '8px' }} /> Home
              </Link>
            </li>
            <li>
              <Link href="/products" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                <ShoppingBag size={18} style={{ marginRight: '8px' }} /> Products
              </Link>
            </li>
            <li>
              <Link href="/festive" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                <Sparkles size={18} style={{ marginRight: '8px' }} /> Festive Collection
              </Link>
            </li>
            <li>
              <Link href="/my-orders" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                <Truck size={18} style={{ marginRight: '8px' }} /> My Orders
              </Link>
            </li>
            {isAuthenticated ? (
              <li>
                <button className={`${styles.mobileNavLink} ${styles.mobileActionPill}`} onClick={handleLogout}>
                  <LogOut size={18} style={{ marginRight: '8px' }} /> Sign Out
                </button>
              </li>
            ) : (
              <li>
                <Link href="/login" className={`${styles.mobileNavLink} ${styles.mobileActionPill}`} onClick={() => setIsMobileMenuOpen(false)}>
                  <LogIn size={18} style={{ marginRight: '8px' }} /> Sign In
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        {/* FAB Close Button Morph */}
        <button 
          className={styles.fabCloseButton}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <X size={24} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
