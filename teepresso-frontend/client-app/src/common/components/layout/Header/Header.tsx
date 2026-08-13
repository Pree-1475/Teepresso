'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Menu, X, ShoppingBag, User as UserIcon, LogOut, PackageCheck, Layers } from 'lucide-react';
import styles from './Header.module.css';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

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

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.container}`}>
        
        {/* Left Nav */}
        <nav className={styles.leftNav}>
          <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.activeLink : ''}`}>
            Home
          </Link>
          <Link href="/products" className={`${styles.navLink} ${pathname === '/products' ? styles.activeLink : ''}`}>
            Products
          </Link>
          <Link href="/custom-kurtas" className={`${styles.navLink} ${pathname === '/custom-kurtas' ? styles.activeLink : ''}`} style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>
            ✨ Custom Kurtas
          </Link>
          <Link href="/fabric-guide" className={`${styles.navLink} ${pathname === '/fabric-guide' ? styles.activeLink : ''}`}>
            Fabric & Printing
          </Link>
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
            <Link href="/bulk-orders" className={`${styles.navLink} ${pathname === '/bulk-orders' ? styles.activeLink : ''}`}>
              Bulk Orders
            </Link>

            <Link href="/track-order" className={`${styles.navLink} ${pathname === '/track-order' ? styles.activeLink : ''}`}>
              Track Order
            </Link>
          </div>
          
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
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
                    href="/track-order" 
                    className={styles.dropdownItem}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <PackageCheck size={16} /> Track My Orders
                  </Link>

                  <Link 
                    href="/bulk-orders" 
                    className={styles.dropdownItem}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Layers size={16} /> Custom Order Builder
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
          ) : (
            <Link href="/login" className={styles.quoteBtn}>
              Sign In
            </Link>
          )}

          <Link href="/bulk-orders" className={styles.bagBtn} aria-label="Order Cart">
            <ShoppingBag size={20} strokeWidth={1.5} />
          </Link>
          
          <button 
            className={styles.mobileMenuBtn}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav>
            <ul className={styles.mobileNavList}>
              <li>
                <Link href="/" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                  Products & Catalogue
                </Link>
              </li>
              <li>
                <Link href="/custom-kurtas" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>
                  ✨ Custom Kurtas Campaign
                </Link>
              </li>
              <li>
                <Link href="/bulk-orders" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                  Bulk Order Configurator
                </Link>
              </li>
              <li>
                <Link href="/track-order" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                  Track Orders
                </Link>
              </li>
              {isAuthenticated ? (
                <li>
                  <button className={styles.mobileNavLink} onClick={handleLogout} style={{ color: 'var(--color-error-text)' }}>
                    Sign Out ({user?.name})
                  </button>
                </li>
              ) : (
                <li>
                  <Link href="/login" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                    Sign In / Register
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
