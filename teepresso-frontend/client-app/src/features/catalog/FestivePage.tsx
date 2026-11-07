import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useStorefront } from '@/common/context/StorefrontContext';
import { FestiveHeroNew } from '@/features/home/components/festive/FestiveHeroNew';
import { FestiveKurtaCollection } from '@/features/home/components/festive/FestiveKurtaCollection';
import { FestiveEssentialsCollection } from '@/features/home/components/festive/FestiveEssentialsCollection';
import { FestiveFeaturesBar } from '@/features/home/components/festive/FestiveFeaturesBar';
import styles from './festive.module.css';

export function FestivePage() {
  const { storefrontMode } = useStorefront();

  if (storefrontMode !== 'FESTIVE') {
    return <Navigate to="/products" replace />;
  }

  return (
    <div className={styles.pageContainer} style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative Mandala Top Right */}
      <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{position: 'absolute', top: '-100px', right: '-100px', opacity: 0.05, pointerEvents: 'none', zIndex: 0}}>
        <circle cx="200" cy="200" r="190" stroke="#8C5940" strokeWidth="2" strokeDasharray="10 10"/>
        <circle cx="200" cy="200" r="150" stroke="#8C5940" strokeWidth="1"/>
        <path d="M200 50 C 230 150, 350 170, 350 200 C 350 230, 230 250, 200 350 C 170 250, 50 230, 50 200 C 50 170, 170 150, 200 50 Z" fill="none" stroke="#E67E22" strokeWidth="2"/>
        <circle cx="200" cy="200" r="80" stroke="#8C5940" strokeWidth="2" strokeDasharray="5 5"/>
        <path d="M200 120 L 256.5 256.5 L 120 200 L 256.5 143.5 Z" fill="none" stroke="#E67E22" strokeWidth="1"/>
        <path d="M200 280 L 143.5 143.5 L 280 200 L 143.5 256.5 Z" fill="none" stroke="#E67E22" strokeWidth="1"/>
      </svg>

      {/* Decorative Thread Bottom Left */}
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{position: 'absolute', bottom: '20%', left: '-50px', opacity: 0.1, pointerEvents: 'none', zIndex: 0}}>
        <path d="M -50 350 C 50 250, 150 280, 180 180 C 210 80, 100 0, 200 -50" stroke="#8C5940" strokeWidth="4" strokeDasharray="8 8" />
      </svg>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <FestiveHeroNew />
        <FestiveKurtaCollection />
        <FestiveEssentialsCollection />
        <FestiveFeaturesBar />
      </div>
    </div>
  );
}

export default FestivePage;
