export interface Product {
  id: string;
  name: string;
  category: string;
  startingPrice: number;
}

export const productsDatabase: Product[] = [
  { id: 'custom-kurta-seasonal', name: 'Festive & Group Custom Kurta', category: 'Kurtas', startingPrice: 399 },
  { id: 'tee-oversized-heavy', name: 'Heavyweight Oversized Streetwear Tee', category: 'T-Shirts', startingPrice: 349 },
  { id: 'polo-corporate-pique', name: 'Classic Pique Corporate Polo Shirt', category: 'Polos', startingPrice: 429 },
  { id: 'hoodie-fleece-pullover', name: 'Premium Heavyweight Pullover Hoodie', category: 'Hoodies & Jackets', startingPrice: 799 },
];
