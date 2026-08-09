import React from 'react';
import { HeroSection } from '@/components/sections/home/HeroSection';
import { TrustBar } from '@/components/sections/home/TrustBar';
import { IndustriesSection } from '@/components/sections/home/IndustriesSection';
import { HowItWorksSection } from '@/components/sections/home/HowItWorksSection';
import { SeasonalKurtaSection } from '@/components/sections/home/SeasonalKurtaSection';
import { FeaturedProducts } from '@/components/sections/home/FeaturedProducts';
import { WhyChooseUsSection } from '@/components/sections/home/WhyChooseUsSection';
import { TestimonialsSection } from '@/components/sections/home/TestimonialsSection';
import { GallerySection } from '@/components/sections/home/GallerySection';
import { FAQSection } from '@/components/sections/home/FAQSection';
import { CTASection } from '@/components/sections/home/CTASection';

export default function Home() {
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
