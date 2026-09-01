export interface PlacementConfig {
  id: string;
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

const defaultPlacements: PlacementConfig[] = [
  { id: 'front', view: 'front', xPercent: 50, yPercent: 55, maxWidthPercent: 45, maxHeightPercent: 50 },
  { id: 'left_chest', view: 'front', xPercent: 64, yPercent: 30, maxWidthPercent: 15, maxHeightPercent: 15 },
  { id: 'right_chest', view: 'front', xPercent: 36, yPercent: 30, maxWidthPercent: 15, maxHeightPercent: 15 },
  { id: 'left_sleeve', view: 'front', xPercent: 86.5, yPercent: 30, maxWidthPercent: 12, maxHeightPercent: 15 },
  { id: 'right_sleeve', view: 'front', xPercent: 13.5, yPercent: 30, maxWidthPercent: 12, maxHeightPercent: 15 },
  { id: 'back', view: 'back', xPercent: 50, yPercent: 55, maxWidthPercent: 45, maxHeightPercent: 50 }
];

export const getMockupConfig = (productId: string): MockupConfig => {
  return {
    productId,
    name: 'Generic Mockup',
    frontImage: '/images/mockups/tshirt-blank.svg',
    backImage: '/images/mockups/tshirt-blank-back.svg',
    availablePlacements: defaultPlacements
  };
};
