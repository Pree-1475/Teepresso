'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        <div className={styles.grid}>
          {/* Company Info */}
          <div className={styles.companyInfo}>
            <Link href="/" className={styles.logo}>
              teepresso.
            </Link>
            <p className={styles.description}>
              The trusted bulk custom apparel printing partner for colleges, colonies, businesses, and event groups.
            </p>
            <div className={styles.socials}>
              <a href="#" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>

          {/* Catalog & Products */}
          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Products & Services</h4>
            <ul className={styles.linkList}>
              <li><Link href="/products">Products Catalogue</Link></li>
              <li><Link href="/custom-kurtas">✨ Custom Kurtas</Link></li>
              <li><Link href="/bulk-orders">Bulk Order Configurator</Link></li>
              <li><Link href="/products">T-Shirts & Oversized Tees</Link></li>
              <li><Link href="/products">Polos & Corporate Merch</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Quick Navigation</h4>
            <ul className={styles.linkList}>
              <li><Link href="/fabric-guide">Fabric & Printing Guide</Link></li>
              <li><Link href="/how-it-works">How It Works</Link></li>
              <li><Link href="/faq">FAQ & Assistance</Link></li>
              <li><Link href="/track-order">Track Order</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className={styles.newsletter}>
            <h4 className={styles.linkTitle}>Stay Updated</h4>
            <p className={styles.newsletterDesc}>
              Subscribe to get group discounts and festive printing updates.
            </p>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className={styles.input} 
                required
              />
              <button type="submit" className={styles.button}>Subscribe</button>
            </form>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {currentYear} Teepresso. All rights reserved.
          </p>
          <div className={styles.legalLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
