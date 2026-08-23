import React from 'react';
import { HeroSection } from '@/features/home/components/HeroSection';
import { TrustBar } from '@/features/home/components/TrustBar';
import { IndustriesSection } from '@/features/home/components/IndustriesSection';
import { HowItWorksSection } from '@/features/home/components/HowItWorksSection';
import { SeasonalKurtaSection } from '@/features/home/components/SeasonalKurtaSection';
import { FeaturedProducts } from '@/features/home/components/FeaturedProducts';
import { InstantQuoteSection } from '@/features/home/components/InstantQuoteSection';
import { TrustAndReviewsSection } from '@/features/home/components/TrustAndReviewsSection';
import { GallerySection } from '@/features/home/components/GallerySection';
import { FAQSection } from '@/features/home/components/FAQSection';
import { CTASection } from '@/features/home/components/CTASection';

export function StandardHomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <HeroSection />
      <TrustBar />
      <div className="doubleStitchDivider" />
      <IndustriesSection />
      <div className="doubleStitchDivider" />
      <HowItWorksSection />
      <div className="doubleStitchDivider" />
      <SeasonalKurtaSection />
      <div className="doubleStitchDivider" />
      <FeaturedProducts />
      <div className="doubleStitchDivider" />
      <InstantQuoteSection />
      <div className="doubleStitchDivider" />
      <TrustAndReviewsSection />
      <div className="doubleStitchDivider" />
      <GallerySection />
      <div className="doubleStitchDivider" />
      <FAQSection />
      <div className="doubleStitchDivider" />
      <CTASection />
    </div>
  );
}

export default StandardHomePage;
