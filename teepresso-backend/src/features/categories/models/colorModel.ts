import { registerDatabase } from '../../../config/jsonDb.js';

export interface ColorSnippet {
  id: string; // e.g. "royal-blue"
  name: string; // e.g. "Royal Blue"
  hex: string; // e.g. "#1e3a8a"
}

export const colorsDatabase: ColorSnippet[] = [
  { id: 'black', name: 'Black', hex: '#1f1d1c' },
  { id: 'white', name: 'White', hex: '#ffffff' },
  { id: 'charcoal', name: 'Charcoal', hex: '#5c5957' },
  { id: 'royal-blue', name: 'Royal Blue', hex: '#1a73e8' },
  { id: 'navy', name: 'Navy', hex: '#2c3e50' },
  { id: 'teal', name: 'Teal', hex: '#0D9488' },
  { id: 'red', name: 'Red', hex: '#c0392b' },
  { id: 'brown', name: 'Brown', hex: '#8c5b45' },
  { id: 'beige', name: 'Beige', hex: '#d2c4b4' }
];

registerDatabase('colors', colorsDatabase);
