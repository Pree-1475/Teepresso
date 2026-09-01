import { registerDatabase } from '../../../config/jsonDb.js';

export interface Category {
  id: string; // e.g. "t-shirts"
  name: string; // e.g. "T-Shirts"
}

export const categoriesDatabase: Category[] = [
  { id: 'kurtas', name: 'Kurtas' },
  { id: 'festive', name: 'Festive' },
  { id: 't-shirts', name: 'T-Shirts' },
  { id: 'oversized', name: 'Oversized' },
  { id: 'polos', name: 'Polos' },
  { id: 'hoodies', name: 'Hoodies' },
  { id: 'sweatshirts', name: 'Sweatshirts' },
  { id: 'jerseys', name: 'Jerseys' },
];

registerDatabase('categories', categoriesDatabase);
