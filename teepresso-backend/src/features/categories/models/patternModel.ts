import { registerDatabase } from '../../../config/jsonDb.js';

export interface PatternSnippet {
  id: string;
  name: string;
  image: string;
}

export const patternsDatabase: PatternSnippet[] = [
  { id: 'bandhani', name: 'Bandhani Print', image: 'https://images.unsplash.com/photo-1610996843657-3f82fc464c17?auto=format&fit=crop&q=80&w=300' },
  { id: 'ikat', name: 'Ikat Weave', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=300' },
  { id: 'floral-brocade', name: 'Floral Brocade', image: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&q=80&w=300' },
  { id: 'geometric', name: 'Geometric Ethnic', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=300' },
  { id: 'solid', name: 'Solid Plain', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=300' }
];

registerDatabase('patterns', patternsDatabase);
