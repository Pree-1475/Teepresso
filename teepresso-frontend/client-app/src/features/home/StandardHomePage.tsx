import React from 'react';
import { HeroSection } from '@/features/home/components/HeroSection';
import { TrustBar } from '@/features/home/components/TrustBar';
import { IndustriesSection } from '@/features/home/components/IndustriesSection';
import { HowItWorksSection } from '@/features/home/components/HowItWorksSection';
import { SeasonalKurtaSection } from '@/features/home/components/SeasonalKurtaSection';
import { FeaturedProducts } from '@/features/home/components/FeaturedProducts';
import { WhyChooseUsSection } from '@/features/home/components/WhyChooseUsSection';
import { TestimonialsSection } from '@/features/home/components/TestimonialsSection';
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
      <WhyChooseUsSection />
      <div className="doubleStitchDivider" />
      <TestimonialsSection />
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
