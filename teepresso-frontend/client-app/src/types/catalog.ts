export interface ProductItem {
  id: string;
  name: string;
  category: 'T-Shirts' | 'Oversized' | 'Polos' | 'Hoodies' | 'Sweatshirts' | 'Jerseys' | 'Kurtas' | 'Festive';
  shortDesc: string;
  startingPrice: number;
  priceRange: string;
  colors: string[];
  image: string;
  isSeasonalKurta?: boolean;
  popularFor: string;
  // New configuration flags
  requiresSizes: boolean;
  requiresColors: boolean;
  requiresPatterns?: boolean;
  requiresMockup: boolean;
  applyVolumeDiscount: boolean;
  stock?: number;
  sizesStock?: Record<string, number>;
  sizes?: string[];
  patterns?: string[];
  gallery?: string[];
  tiers?: { minQty: number; price: number }[];
}

export const CATEGORIES = [
  'All',
  'Festive',
  'Kurtas',
  'T-Shirts',
  'Oversized',
  'Polos',
  'Hoodies',
  'Sweatshirts',
  'Jerseys',
] as const;
