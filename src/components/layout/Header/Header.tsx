'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingBag } from 'lucide-react';
import styles from './Header.module.css';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.container}`}>
        
        {/* Left Nav - hidden on mobile */}
        <nav className={styles.leftNav}>
          <Link href="/" className={`${styles.navLink} ${styles.activeLink}`}>Home</Link>
          <Link href="/design" className={styles.navLink}>Design</Link>
          <Link href="/process" className={styles.navLink}>Our Process</Link>
          <Link href="/about" className={styles.navLink}>About Us</Link>
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
            <Link href="/gallery" className={styles.navLink}>Gallery</Link>
            <Link href="/bulk-orders" className={styles.navLink}>Bulk Orders</Link>
          </div>
          <Link href="/quote" className={styles.quoteBtn}>Get a Quote</Link>
          <button className={styles.bagBtn} aria-label="Cart">
            <ShoppingBag size={20} strokeWidth={1.5} />
          </button>
          
          <button 
            className={styles.mobileMenuBtn}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav>
            <ul className={styles.mobileNavList}>
              <li><Link href="/" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
              <li><Link href="/design" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Design</Link></li>
              <li><Link href="/process" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Our Process</Link></li>
              <li><Link href="/about" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>About Us</Link></li>
              <li><Link href="/gallery" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Gallery</Link></li>
              <li><Link href="/bulk-orders" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Bulk Orders</Link></li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
