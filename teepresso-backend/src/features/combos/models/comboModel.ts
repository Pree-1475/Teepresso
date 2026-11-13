export interface ComboItemInput {
  productId: string;
  quantity: number;
  availableSizes?: string[];
}

export interface EnrichedProductData {
  id: string;
  name: string;
  category: string;
  image: string;
  startingPrice: number;
  colors?: string[];
  sizes?: string[];
}

export interface EnrichedComboItem extends ComboItemInput {
  product?: EnrichedProductData;
}

export interface SizePriceOverride {
  comboPrice: number;
  originalPrice?: number;
  savings?: number;
}

export interface Combo {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  isPopular: boolean;
  isActive: boolean;
  items: EnrichedComboItem[];
  originalPrice: number;
  comboPrice: number;
  savings: number;
  sizePricing?: Record<string, SizePriceOverride>;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

