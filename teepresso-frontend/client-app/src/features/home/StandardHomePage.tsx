import React from 'react';
import { HeroSection } from '@/features/home/components/HeroSection';
import { TrustBar } from '@/features/home/components/TrustBar';
import { IndustriesSection } from '@/features/home/components/IndustriesSection';
import { CombosSection } from '@/features/home/components/CombosSection';
import { ExtendedSizesSection } from '@/features/home/components/ExtendedSizesSection';
import { FeaturedProducts } from '@/features/home/components/FeaturedProducts';
import { HowItWorksSection } from '@/features/home/components/HowItWorksSection';
import { TrustAndReviewsSection } from '@/features/home/components/TrustAndReviewsSection';
import { GallerySection } from '@/features/home/components/GallerySection';
import { FAQSection } from '@/features/home/components/FAQSection';
import { CTASection } from '@/features/home/components/CTASection';

export function StandardHomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <HeroSection />
      <div className="doubleStitchDivider" />
      <IndustriesSection />
      <div className="doubleStitchDivider" />
      <CombosSection />
      <ExtendedSizesSection />
      <TrustBar />
      <FeaturedProducts />
      <HowItWorksSection />
      <div className="doubleStitchDivider" />
      <TrustAndReviewsSection />
      <GallerySection />
      <div className="doubleStitchDivider" />
      <FAQSection />
      <CTASection />
    </div>
  );
}

export default StandardHomePage;
