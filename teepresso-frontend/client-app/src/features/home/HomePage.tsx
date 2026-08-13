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

export function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <HeroSection />
      <TrustBar />
      <IndustriesSection />
      <HowItWorksSection />
      <SeasonalKurtaSection />
      <FeaturedProducts />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <GallerySection />
      <FAQSection />
      <CTASection />
    </div>
  );
}

export default HomePage;
