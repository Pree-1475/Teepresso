export interface ProductItem {
  id: string;
  name: string;
  category: 'T-Shirts' | 'Oversized' | 'Polos' | 'Hoodies' | 'Sweatshirts' | 'Jerseys' | 'Kurtas';
  shortDesc: string;
  startingPrice: number;
  priceRange: string;
  colors: string[];
  image: string;
  isSeasonalKurta?: boolean;
  popularFor: string;
}

export const CATEGORIES = [
  'All',
  'T-Shirts',
  'Oversized',
  'Polos',
  'Hoodies',
  'Sweatshirts',
  'Jerseys',
  'Kurtas',
] as const;

export const PRODUCTS_CATALOG: ProductItem[] = [
  {
    id: 'tshirt-roundneck',
    name: 'Classic Round Neck T-Shirt',
    category: 'T-Shirts',
    shortDesc: '100% Super Combed Cotton. Premium print finish for events, college fests, and brand merchandise.',
    startingPrice: 199,
    priceRange: '₹199 – ₹299 / pc',
    colors: ['#8c5b45', '#1f1d1c', '#ffffff', '#2c3e50', '#c0392b'],
    image: '/images/products/tshirt.png',
    popularFor: 'College Fests & Events',
  },
  {
    id: 'tshirt-oversized',
    name: 'Heavyweight Oversized Tee',
    category: 'Oversized',
    shortDesc: '240 GSM French Terry Cotton. Modern dropped-shoulder fit tailored for streetwear and creator groups.',
    startingPrice: 349,
    priceRange: '₹349 – ₹499 / pc',
    colors: ['#d2c4b4', '#1f1d1c', '#4a2c1f', '#7f8c8d'],
    image: '/images/products/oversized.png',
    popularFor: 'Clubs, Creators & Youth Groups',
  },
  {
    id: 'polo-corporate',
    name: 'Executive Pique Polo',
    category: 'Polos',
    shortDesc: '220 GSM Honeycomb Pique Cotton. Elegant ribbed collar and cuffs, ideal for corporate branding & teams.',
    startingPrice: 399,
    priceRange: '₹399 – ₹549 / pc',
    colors: ['#331d14', '#ffffff', '#0D9488', '#2c3e50'],
    image: '/images/products/polo.png',
    popularFor: 'Corporate & Executive Teams',
  },
  {
    id: 'hoodie-heavyweight',
    name: 'Premium Pullover Hoodie',
    category: 'Hoodies',
    shortDesc: '350 GSM Fleece Interior. Double-lined hood, kangaroo pocket, and durable embroidery or screen print.',
    startingPrice: 699,
    priceRange: '₹699 – ₹899 / pc',
    colors: ['#8c5b45', '#1f1d1c', '#d2c4b4', '#34495e'],
    image: '/images/products/hoodie.png',
    popularFor: 'Batch Hoodies & Winter Events',
  },
  {
    id: 'sweatshirt-crewneck',
    name: 'Classic Crewneck Sweatshirt',
    category: 'Sweatshirts',
    shortDesc: '300 GSM Soft Brushed Fleece. Timeless silhouette for university merch and alumni meets.',
    startingPrice: 599,
    priceRange: '₹599 – ₹799 / pc',
    colors: ['#f4f0ec', '#1f1d1c', '#623a2a', '#16a085'],
    image: '/images/products/hoodie.png',
    popularFor: 'Alumni Meets & College Merch',
  },
  {
    id: 'jersey-athletic',
    name: 'Performance Dri-Fit Jersey',
    category: 'Jerseys',
    shortDesc: '160 GSM Moisture-Wicking Polyester. Sublimation ready for sports tournaments and athletic teams.',
    startingPrice: 299,
    priceRange: '₹299 – ₹449 / pc',
    colors: ['#0D9488', '#c0392b', '#2980b9', '#f39c12'],
    image: '/images/products/tshirt.png',
    popularFor: 'Sports Leagues & Marathons',
  },
  {
    id: 'custom-kurta-seasonal',
    name: 'Custom Group Kurta (Seasonal)',
    category: 'Kurtas',
    shortDesc: 'Premium Slub Cotton Festive Kurtas with custom chest logo, colony emblem, or back print for groups.',
    startingPrice: 499,
    priceRange: '₹499 – ₹699 / pc',
    colors: ['#8c5b45', '#d2c4b4', '#d35400', '#27ae60', '#8e44ad'],
    image: '/images/kurtas/hero.png',
    isSeasonalKurta: true,
    popularFor: 'Colonies, Fests & Festive Groups',
  },
];
