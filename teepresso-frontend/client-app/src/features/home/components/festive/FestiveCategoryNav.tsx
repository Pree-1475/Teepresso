import React from 'react';
import Link from 'next/link';
import { Shirt, Box, Package } from 'lucide-react';
import styles from './FestiveCategoryNav.module.css';

const navItems = [
  { id: 'Kurtas', title: 'Kurtas', subtitle: '3 Types', icon: Shirt, href: '#kurtas' },
  { id: 'Pagdis', title: 'Pagdis', subtitle: 'View All', icon: Box, href: '#essentials' },
  { id: 'Panchas', title: 'Panchas', subtitle: 'View All', icon: Box, href: '#essentials' },
  { id: 'Khanduvas', title: 'Khanduvas', subtitle: 'View All', icon: Box, href: '#essentials' },
  { id: 'Zari Khanduvas', title: 'Zari Khanduvas', subtitle: 'View All', icon: Box, href: '#essentials' },
  { id: 'Other', title: 'Other Essentials', subtitle: 'View All', icon: Package, href: '#essentials' },
];

export const FestiveCategoryNav = () => {
  return (
    <div className={styles.navContainer}>
      <div className="container">
        <div className={styles.navInner}>
          {navItems.map((item) => (
            <Link 
              key={item.id} 
              href={item.href}
              className={styles.navItem}
            >
              <div className={styles.iconWrapper}>
                <item.icon size={20} color="#8C5940" strokeWidth={1.5} />
              </div>
              <div className={styles.textGroup}>
                <span className={styles.title} style={{ color: "#1A1A1A" }}>{item.title}</span>
                <span className={styles.subtitle}>{item.subtitle}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
