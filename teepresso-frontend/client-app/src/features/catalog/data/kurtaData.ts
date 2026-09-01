export interface KurtaStyle {
  id: string;
  name: string;
  fabric: string;
  fit: string;
  pricePerPiece: number;
  description: string;
  image: string;
}

export interface CustomizationExample {
  id: string;
  title: string;
  placement: string;
  description: string;
  idealFor: string;
}

export const KURTA_STYLES: KurtaStyle[] = [
  {
    id: 'short-cotton-kurta',
    name: 'Short Casual Slub Kurta',
    fabric: '100% Breathable Slub Cotton',
    fit: 'Modern Comfort Fit',
    pricePerPiece: 449,
    description: 'Lightweight and versatile short-length kurta. Features Mandarin collar and roll-up sleeves. Perfect for long festival days and event coordination.',
    image: '/images/products/kurta.png',
  },
  {
    id: 'long-traditional-kurta',
    name: 'Long Traditional Festive Kurta',
    fabric: 'Premium Handloom Cotton Blend',
    fit: 'Classic Straight Fit',
    pricePerPiece: 549,
    description: 'Elegant full-length traditional kurta with side pockets and fine stitching. High impact for festive processions, college groups, and community ceremonies.',
    image: '/images/kurtas/hero.png',
  },
  {
    id: 'pathani-group-kurta',
    name: 'Pathani Style Group Kurta',
    fabric: 'Heavy Cotton Linen',
    fit: 'Bold Structured Fit',
    pricePerPiece: 599,
    description: 'Distinctive shirt-style collar with flap pockets and curved hemline. Brings a strong, unified presence for sports teams and colony groups.',
    image: '/images/products/kurta.png',
  },
  {
    id: 'kurta-nehru-set',
    name: 'Kurta & Nehru Jacket Combo',
    fabric: 'Raw Silk Blend / Cotton',
    fit: 'Tailored Formal Fit',
    pricePerPiece: 899,
    description: 'Matching short or long kurta paired with a printed contrast Nehru waistcoat jacket for college fests and VIP group delegations.',
    image: '/images/kurtas/hero.png',
  },
];

export const CUSTOMIZATION_EXAMPLES: CustomizationExample[] = [
  {
    id: 'chest-colony-logo',
    title: 'Colony & Community Emblems',
    placement: 'Left Chest Embroidery or Screen Print',
    description: 'Clean high-density crest or emblem printing that identifies your housing colony, society, or mandal group.',
    idealFor: 'Colonies, Housing Societies, Mandals',
  },
  {
    id: 'back-group-artwork',
    title: 'Full Back Group Artwork & Name',
    placement: 'Upper Back Screen Print',
    description: 'Vibrant oversized back print displaying group name, batch year, tagline, or custom festive graphic artwork.',
    idealFor: 'College Fests, Batch 2026, Event Committees',
  },
  {
    id: 'sleeve-sponsor-logo',
    title: 'Sleeve Event & Team Branding',
    placement: 'Left / Right Sleeve',
    description: 'Subtle sponsor logos, committee designation (e.g. "Volunteer", "Organizer"), or individual member names.',
    idealFor: 'Event Organizers, Volunteer Crews',
  },
];

export const KURTA_GALLERY = [
  {
    title: 'College Cultural Fest Squad 2026',
    groupType: 'College Group',
    count: '65 Pieces',
    image: '/images/kurtas/hero.png',
  },
  {
    title: 'Greenways Colony Annual Celebration',
    groupType: 'Community Colony',
    count: '120 Pieces',
    image: '/images/products/kurta.png',
  },
  {
    title: 'University Student Council',
    groupType: 'Student Council',
    count: '40 Pieces',
    image: '/images/kurtas/hero.png',
  },
];
