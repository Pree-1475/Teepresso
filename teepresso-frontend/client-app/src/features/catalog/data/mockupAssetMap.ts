export interface PlacementConfig {
  id: string;
  name: string;
  view: 'front' | 'back';
  xPercent: number;
  yPercent: number;
  maxWidthPercent: number;
  maxHeightPercent: number;
}

export interface MockupConfig {
  productId: string;
  name: string;
  frontImage: string;
  backImage: string;
  availablePlacements: PlacementConfig[];
}

const DEFAULT_PLACEMENTS: PlacementConfig[] = [
  { id: 'front', name: 'Front Chest', view: 'front', xPercent: 30, yPercent: 25, maxWidthPercent: 40, maxHeightPercent: 50 },
  { id: 'back', name: 'Back Full', view: 'back', xPercent: 25, yPercent: 20, maxWidthPercent: 50, maxHeightPercent: 60 }
];

export function getMockupConfig(productId: string): MockupConfig {
  return {
    productId,
    name: 'Product Mockup',
    frontImage: '/images/mockups/tshirt-front-base.png',
    backImage: '/images/mockups/tshirt-back-base.png',
    availablePlacements: DEFAULT_PLACEMENTS
  };
}
