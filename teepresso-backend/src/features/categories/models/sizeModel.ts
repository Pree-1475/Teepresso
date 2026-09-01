import { registerDatabase } from '../../../config/jsonDb.js';

export interface SizeSnippet {
  id: string; // e.g. "s"
  name: string; // e.g. "S"
  category: 'Kids Sizes' | 'Adult Standard' | 'Adult Plus (Special)';
}

export const sizesDatabase: SizeSnippet[] = [
  // Kids Sizes
  { id: '2y', name: '2Y', category: 'Kids Sizes' },
  { id: '4y', name: '4Y', category: 'Kids Sizes' },
  { id: '6y', name: '6Y', category: 'Kids Sizes' },
  { id: '8y', name: '8Y', category: 'Kids Sizes' },
  { id: '10y', name: '10Y', category: 'Kids Sizes' },
  { id: '12y', name: '12Y', category: 'Kids Sizes' },

  // Adult Standard
  { id: 'xs', name: 'XS', category: 'Adult Standard' },
  { id: 's', name: 'S', category: 'Adult Standard' },
  { id: 'm', name: 'M', category: 'Adult Standard' },
  { id: 'l', name: 'L', category: 'Adult Standard' },
  { id: 'xl', name: 'XL', category: 'Adult Standard' },
  { id: 'xxl', name: 'XXL', category: 'Adult Standard' },

  // Adult Plus (Special)
  { id: '3xl', name: '3XL', category: 'Adult Plus (Special)' },
  { id: '4xl', name: '4XL', category: 'Adult Plus (Special)' },
  { id: '5xl', name: '5XL', category: 'Adult Plus (Special)' }
];

registerDatabase('sizes', sizesDatabase);
