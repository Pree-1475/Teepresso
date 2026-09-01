import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import styles from './FestiveHeader.module.css';

export function FestiveHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.container}`}>
        
        {/* Left Logo */}
        <div className={styles.logo}>
          <Link href="/">
            <div className={styles.logoWrapper}>
              {/* Fake logo icon for mockup purposes */}
              <div className={styles.logoIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16v4H4z" />
                  <path d="M8 8v12" />
                  <path d="M16 8v12" />
                  <path d="M4 20h16" />
                </svg>
              </div>
              <div className={styles.logoTextContainer}>
                <span className={styles.logoTitle}>TEEPRESSO</span>
                <span className={styles.logoSubtitle}>Wear Your Imagination</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center Nav */}
        <nav className={styles.centerNav}>
          <Link href="/products" className={styles.navLink}>
            Products <span className={styles.chevron}>v</span>
          </Link>
          <Link href="/how-it-works" className={styles.navLink}>
            How It Works
          </Link>
          <Link href="/custom-kurtas" className={styles.navLinkActive}>
            Custom Kurtas <span className={styles.newBadge}>New</span>
          </Link>
          <Link href="/our-work" className={styles.navLink}>
            Our Work
          </Link>
          <Link href="/track-order" className={styles.navLink}>
            Track Order
          </Link>
          <Link href="/about" className={styles.navLink}>
            About Us
          </Link>
        </nav>

        {/* Right Nav */}
        <div className={styles.rightNav}>
          <a href="tel:+919876543210" className={styles.phoneBtn}>
            +91 98765 43210
            <span className={styles.whatsappIcon}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
            </span>
          </a>
          <Link href="/quote" className={styles.quoteBtn}>
            Get a Quote
          </Link>
        </div>

      </div>
    </header>
  );
}
