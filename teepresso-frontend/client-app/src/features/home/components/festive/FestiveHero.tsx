import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, Shirt, Palette, Clock } from 'lucide-react';
import { useScrollReveal } from '@/common/hooks/useScrollReveal';
import styles from './FestiveHero.module.css';

export const FestiveHero = () => {
  const { ref: revealRef, isVisible } = useScrollReveal({ threshold: 0.1 });
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Both videos are set to autoPlay in JSX, this is a fallback for Safari/mobile policies
    const desktopVideo = desktopVideoRef.current;
    if (desktopVideo) {
      desktopVideo.play().catch(e => console.log("Desktop auto-play prevented", e));
    }
    const mobileVideo = mobileVideoRef.current;
    if (mobileVideo) {
      mobileVideo.play().catch(e => console.log("Mobile auto-play prevented", e));
    }
  }, []);

  return (
    <section className={styles.heroSection} ref={revealRef}>
      
      {/* Mobile Background Video */}
      <video 
        ref={mobileVideoRef}
        src="/images/festive/mobile-hero.mp4" 
        className={styles.mobileVideoBackground}
        autoPlay
        muted 
        loop
        playsInline
      />

      {/* Desktop Background Video */}
      <video 
        ref={desktopVideoRef}
        src="/images/festive/hero-laptop.mp4" 
        className={styles.desktopVideoBackground}
        autoPlay
        muted 
        loop
        playsInline
      />
      
      {/* Gradient Overlay to ensure text readability */}
      <div className={styles.gradientOverlay}></div>
      <div className={`container ${styles.container}`}>
        <div className={styles.grid}>
          {/* Text Content */}
          <div className={`${styles.textContent} ${isVisible ? 'fade-in' : ''}`}>
            <div className={styles.modeLabel}>
              <span className={styles.modeIcon}>✦</span> FESTIVE MODE
            </div>
            
            <h1 className={styles.title}>
              YOUR GROUP.<br/>
              YOUR IDENTITY.<br/>
              <span className={styles.highlight}>YOUR KURTAS.</span>
            </h1>

            <div className={styles.decorativeLine}>
              <span className={styles.star}>✦</span>
              <div className={styles.line}></div>
            </div>

            <p className={styles.description}>
              Custom printed kurtas<br/>
              for communities, associations<br/>
              and events.
            </p>
            <div className={styles.actions}>
              <Link href="/product/custom-kurta-seasonal" className={styles.primaryBtn}>
                Start Your Kurta Order <ArrowRight size={18} />
              </Link>
            </div>
            

          </div>

          {/* Right Image Stage (Empty space for background image) */}
          <div className={styles.imageStage}>
             {/* Image is now handled by the background in CSS */}
          </div>
        </div>
      </div>
      

      {/* Decorative Apparel Thread Curl */}
      <svg className={styles.threadCurl} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M -20 220 C 40 180, 80 190, 90 150 C 100 110, 60 70, 110 50 C 160 30, 180 80, 220 20" 
          stroke="#B56C4A" 
          strokeWidth="1.5" 
          strokeDasharray="4 4" 
        />
        <path 
          d="M -40 200 C 20 160, 60 170, 70 130 C 80 90, 40 50, 90 30 C 140 10, 160 60, 200 0" 
          stroke="#2D1A13" 
          strokeWidth="1" 
          strokeDasharray="2 4" 
          opacity="0.5"
        />
      </svg>
    </section>
  );
};
