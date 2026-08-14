import React from 'react';
import { STOREFRONT_MODE } from '@/common/config/storefront';
import { StandardHomePage } from '@/features/home/StandardHomePage';
import { FestiveHomePage } from '@/features/home/FestiveHomePage';

export function HomePage() {
  if (STOREFRONT_MODE === 'FESTIVE') {
    return <FestiveHomePage />;
  }

  return <StandardHomePage />;
}

export default HomePage;
