export interface ProductMockupAssets {
  productId: string;
  name: string;
  frontImage: string;
  backImage: string;
  availablePlacements: Array<{
    id: 'front' | 'back' | 'left_chest' | 'right_chest' | 'left_sleeve' | 'right_sleeve';
    label: string;
    view: 'front' | 'back';
    xPercent: number; // center x %
    yPercent: number; // center y %
    maxWidthPercent: number;
    maxHeightPercent: number;
  }>;
}

export const MOCKUP_ASSET_REGISTRY: Record<string, ProductMockupAssets> = {
  'tshirt-roundneck': {
    productId: 'tshirt-roundneck',
    name: 'Round Neck T-Shirt',
    frontImage: '/images/mockups/round-neck-front.png',
    backImage: '/images/mockups/round-neck-back.png',
    availablePlacements: [
      { id: 'left_chest', label: 'Left Chest', view: 'front', xPercent: 35, yPercent: 26, maxWidthPercent: 22, maxHeightPercent: 20 },
      { id: 'right_chest', label: 'Right Chest', view: 'front', xPercent: 65, yPercent: 26, maxWidthPercent: 22, maxHeightPercent: 20 },
      { id: 'front', label: 'Center Front', view: 'front', xPercent: 50, yPercent: 42, maxWidthPercent: 45, maxHeightPercent: 50 },
      { id: 'back', label: 'Center Back', view: 'back', xPercent: 50, yPercent: 40, maxWidthPercent: 50, maxHeightPercent: 50 },
      { id: 'left_sleeve', label: 'Left Sleeve', view: 'front', xPercent: 18, yPercent: 32, maxWidthPercent: 18, maxHeightPercent: 20 },
      { id: 'right_sleeve', label: 'Right Sleeve', view: 'front', xPercent: 82, yPercent: 32, maxWidthPercent: 18, maxHeightPercent: 20 },
    ],
  },
  'tshirt-polo': {
    productId: 'tshirt-polo',
    name: 'Polo T-Shirt',
    frontImage: '/images/mockups/polo-front.svg',
    backImage: '/images/mockups/polo-back.svg',
    availablePlacements: [
      { id: 'left_chest', label: 'Left Chest', view: 'front', xPercent: 34, yPercent: 32, maxWidthPercent: 20, maxHeightPercent: 18 },
      { id: 'right_chest', label: 'Right Chest', view: 'front', xPercent: 66, yPercent: 32, maxWidthPercent: 20, maxHeightPercent: 18 },
      { id: 'front', label: 'Front Stomach', view: 'front', xPercent: 50, yPercent: 55, maxWidthPercent: 40, maxHeightPercent: 40 },
      { id: 'back', label: 'Center Back', view: 'back', xPercent: 50, yPercent: 42, maxWidthPercent: 48, maxHeightPercent: 48 },
      { id: 'left_sleeve', label: 'Left Sleeve', view: 'front', xPercent: 18, yPercent: 34, maxWidthPercent: 18, maxHeightPercent: 20 },
      { id: 'right_sleeve', label: 'Right Sleeve', view: 'front', xPercent: 82, yPercent: 34, maxWidthPercent: 18, maxHeightPercent: 20 },
    ],
  },
  'custom-kurta': {
    productId: 'custom-kurta',
    name: 'Ethnic Kurta',
    frontImage: '/images/mockups/kurta-front.svg',
    backImage: '/images/mockups/kurta-back.svg',
    availablePlacements: [
      { id: 'left_chest', label: 'Left Pocket / Chest', view: 'front', xPercent: 33, yPercent: 28, maxWidthPercent: 22, maxHeightPercent: 20 },
      { id: 'right_chest', label: 'Right Chest', view: 'front', xPercent: 67, yPercent: 28, maxWidthPercent: 22, maxHeightPercent: 20 },
      { id: 'front', label: 'Lower Front', view: 'front', xPercent: 50, yPercent: 60, maxWidthPercent: 42, maxHeightPercent: 40 },
      { id: 'back', label: 'Center Back', view: 'back', xPercent: 50, yPercent: 40, maxWidthPercent: 48, maxHeightPercent: 50 },
    ],
  },
};

export function getMockupConfig(productId: string): ProductMockupAssets {
  return MOCKUP_ASSET_REGISTRY[productId] || MOCKUP_ASSET_REGISTRY['tshirt-roundneck'];
}
