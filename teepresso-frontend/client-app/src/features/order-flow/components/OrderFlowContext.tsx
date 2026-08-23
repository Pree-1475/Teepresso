'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductItem } from '@/features/catalog/data/productsData';

export interface CustomerData {
  name: string;
  phone: string;
  email: string;
  organization: string;
}

export interface SizeQtyMap {
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
  XXXL: number;
  '4XL': number;
  '5XL': number;
  '6XL': number;
}

export interface ColorVariant {
  id: string;
  color: string;
  colorHex: string;
  sizes: SizeQtyMap;
}

export interface PlacementArtworkData {
  placementId: string;
  file: File | null;
  previewUrl: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface ArtworkData {
  file: File | null;
  previewUrl: string;
  mode: 'has_design' | 'need_help';
  instructions: string;
  placements: Record<string, PlacementArtworkData>;
}

export interface MockupTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface MockupState {
  activeView: 'front' | 'back';
  activePlacementId: string;
  frontTransform: MockupTransform;
  backTransform: MockupTransform;
  designerAssistance: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  pricePerUnit: number;
  
  requiresSizes: boolean;
  requiresColors: boolean;
  requiresMockup: boolean;
  applyVolumeDiscount: boolean;

  quantity: number;
  colorVariants: ColorVariant[];
  
  artwork: ArtworkData;
  mockup: MockupState;
}

export interface DeliveryData {
  address: string;
  city: string;
  pincode: string;
}

export interface GuidedOrderState {
  currentStep: number;
  customer: CustomerData;
  items: OrderItem[];
  isUrgentOrder: boolean;
  delivery: DeliveryData;
  paymentCompleted: boolean;
  orderId: string;
}

interface OrderFlowContextType {
  state: GuidedOrderState;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  updateCustomer: (data: Partial<CustomerData>) => void;
  
  addOrderItem: (product: ProductItem) => void;
  removeOrderItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  addItemColorVariant: (itemId: string, color: string, colorHex: string) => void;
  removeItemColorVariant: (itemId: string, variantId: string) => void;
  updateItemVariantSizeQty: (itemId: string, variantId: string, size: keyof SizeQtyMap, qty: number) => void;
  updateItemColor: (itemId: string, variantId: string, color: string, colorHex: string) => void;
  
  updateItemArtworkMode: (itemId: string, mode: 'has_design' | 'need_help') => void;
  setItemArtworkFile: (itemId: string, file: File | null, previewUrl: string, placementId?: string) => void;
  updateItemPlacementTransform: (itemId: string, placementId: string, transform: Partial<PlacementArtworkData>) => void;
  removeItemPlacementArtwork: (itemId: string, placementId: string) => void;
  updateItemInstructions: (itemId: string, text: string) => void;
  setItemActiveView: (itemId: string, view: 'front' | 'back') => void;
  setItemActivePlacementId: (itemId: string, id: string) => void;
  setItemDesignerAssistance: (itemId: string, assist: boolean) => void;

  toggleUrgentOrder: () => void;
  updateDelivery: (data: Partial<DeliveryData>) => void;
  completePayment: () => string;
  resetOrder: (initialProduct?: ProductItem) => void;
  
  totalPieces: number;
  subtotal: number;
  urgentFee: number;
  grandTotal: number;
}

const defaultSizes: SizeQtyMap = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, '4XL': 0, '5XL': 0, '6XL': 0 };
const initialSizesForFirst: SizeQtyMap = { XS: 0, S: 10, M: 20, L: 15, XL: 5, XXL: 0, XXXL: 0, '4XL': 0, '5XL': 0, '6XL': 0 };

const defaultArtwork = (): ArtworkData => ({
  file: null,
  previewUrl: '',
  mode: 'has_design',
  instructions: '',
  placements: {},
});

const defaultMockup = (): MockupState => ({
  activeView: 'front',
  activePlacementId: 'front',
  frontTransform: { x: 0, y: 0, scale: 1, rotation: 0 },
  backTransform: { x: 0, y: 0, scale: 1, rotation: 0 },
  designerAssistance: false,
});

const initialOrderState: GuidedOrderState = {
  currentStep: 1,
  customer: { name: '', phone: '', email: '', organization: '' },
  items: [],
  isUrgentOrder: false,
  delivery: { address: '', city: '', pincode: '' },
  paymentCompleted: false,
  orderId: '',
};

const OrderFlowContext = createContext<OrderFlowContextType | undefined>(undefined);

export function OrderFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GuidedOrderState>(initialOrderState);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('teepresso_order_state_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.items) {
          setState(prev => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  useEffect(() => {
    try {
      // Serialize without files
      const serializableItems = state.items.map(item => {
        const { artwork, ...rest } = item;
        const serializedPlacements = Object.fromEntries(
          Object.entries(artwork.placements).map(([k, v]) => [k, { ...v, file: null }])
        );
        return {
          ...rest,
          artwork: {
            ...artwork,
            file: null,
            placements: serializedPlacements,
          }
        };
      });
      const serializableState = { ...state, items: serializableItems };
      localStorage.setItem('teepresso_order_state_v3', JSON.stringify(serializableState));
    } catch {
      // Ignore localStorage write errors
    }
  }, [state]);

  let totalPieces = 0;
  let subtotal = 0;

  state.items.forEach(item => {
    let itemPieces = 0;
    if (item.requiresSizes || item.requiresColors) {
      itemPieces = item.colorVariants.reduce((total, variant) => {
        return total + (Object.values(variant.sizes) as number[]).reduce((sum, qty) => sum + (qty || 0), 0);
      }, 0);
    } else {
      itemPieces = item.quantity || 0;
    }
    
    totalPieces += itemPieces;
    
    let effectiveUnitPrice = item.pricePerUnit;
    if (item.applyVolumeDiscount) {
      if (itemPieces >= 150) {
        effectiveUnitPrice = Math.round(item.pricePerUnit * 0.8);
      } else if (itemPieces >= 75) {
        effectiveUnitPrice = Math.round(item.pricePerUnit * 0.9);
      }
    }
    
    subtotal += (effectiveUnitPrice * itemPieces);
  });

  const urgentFee = state.isUrgentOrder ? Math.round(subtotal * 0.2) : 0;
  const grandTotal = subtotal + urgentFee;

  const nextStep = () => setState(prev => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 4) }));
  const prevStep = () => setState(prev => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
  const setStep = (step: number) => setState(prev => ({ ...prev, currentStep: step }));

  const updateCustomer = (data: Partial<CustomerData>) =>
    setState(prev => ({ ...prev, customer: { ...prev.customer, ...data } }));

  const addOrderItem = (product: ProductItem) => {
    setState(prev => {
      const newItem: OrderItem = {
        id: `item-${Date.now()}`,
        productId: product.id,
        name: product.name,
        category: product.category,
        pricePerUnit: product.startingPrice,
        requiresSizes: product.requiresSizes,
        requiresColors: product.requiresColors,
        requiresMockup: product.requiresMockup,
        applyVolumeDiscount: product.applyVolumeDiscount,
        quantity: product.requiresSizes ? 0 : 100, // default quantity if no sizes
        colorVariants: product.requiresColors ? [
          {
            id: `var-${Date.now()}`,
            color: product.colors[0] || 'Black',
            colorHex: '#000000', // You might want to map from product.colors later
            sizes: { ...defaultSizes },
          }
        ] : [],
        artwork: defaultArtwork(),
        mockup: defaultMockup(),
      };
      return { ...prev, items: [...prev.items, newItem] };
    });
  };

  const removeOrderItem = (itemId: string) => {
    setState(prev => ({ ...prev, items: prev.items.filter(i => i.id !== itemId) }));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item)
    }));
  };

  const addItemColorVariant = (itemId: string, color: string, colorHex: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          colorVariants: [
            ...item.colorVariants,
            { id: `var-${Date.now()}`, color, colorHex, sizes: { ...defaultSizes } }
          ]
        };
      })
    }));
  };

  const removeItemColorVariant = (itemId: string, variantId: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          colorVariants: item.colorVariants.length > 1 ? item.colorVariants.filter(v => v.id !== variantId) : item.colorVariants
        };
      })
    }));
  };

  const updateItemVariantSizeQty = (itemId: string, variantId: string, size: keyof SizeQtyMap, qty: number) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          colorVariants: item.colorVariants.map(variant => {
            if (variant.id !== variantId) return variant;
            return { ...variant, sizes: { ...variant.sizes, [size]: Math.max(0, qty) } };
          })
        };
      })
    }));
  };

  const updateItemColor = (itemId: string, variantId: string, color: string, colorHex: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          colorVariants: item.colorVariants.map(variant => {
            if (variant.id !== variantId) return variant;
            return { ...variant, color, colorHex };
          })
        };
      })
    }));
  };

  const updateItemArtworkMode = (itemId: string, mode: 'has_design' | 'need_help') => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === itemId ? { ...item, artwork: { ...item.artwork, mode } } : item)
    }));
  };

  const setItemArtworkFile = (itemId: string, file: File | null, previewUrl: string, placementId = 'front') => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          artwork: {
            ...item.artwork,
            file,
            previewUrl,
            placements: {
              ...item.artwork.placements,
              [placementId]: {
                placementId, file, previewUrl, x: 0, y: 0, scale: 1, rotation: 0,
              }
            }
          }
        };
      })
    }));
  };

  const updateItemPlacementTransform = (itemId: string, placementId: string, transform: Partial<PlacementArtworkData>) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== itemId) return item;
        const currentPlacement = item.artwork.placements[placementId] || {
          placementId, file: null, previewUrl: '', x: 0, y: 0, scale: 1, rotation: 0,
        };
        return {
          ...item,
          artwork: {
            ...item.artwork,
            placements: {
              ...item.artwork.placements,
              [placementId]: { ...currentPlacement, ...transform }
            }
          }
        };
      })
    }));
  };

  const removeItemPlacementArtwork = (itemId: string, placementId: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== itemId) return item;
        const newPlacements = { ...item.artwork.placements };
        delete newPlacements[placementId];
        return { ...item, artwork: { ...item.artwork, placements: newPlacements } };
      })
    }));
  };

  const updateItemInstructions = (itemId: string, instructions: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === itemId ? { ...item, artwork: { ...item.artwork, instructions } } : item)
    }));
  };

  const setItemActiveView = (itemId: string, view: 'front' | 'back') => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === itemId ? { ...item, mockup: { ...item.mockup, activeView: view } } : item)
    }));
  };

  const setItemActivePlacementId = (itemId: string, activePlacementId: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === itemId ? { ...item, mockup: { ...item.mockup, activePlacementId } } : item)
    }));
  };

  const setItemDesignerAssistance = (itemId: string, designerAssistance: boolean) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === itemId ? { ...item, mockup: { ...item.mockup, designerAssistance } } : item)
    }));
  };

  const toggleUrgentOrder = () =>
    setState(prev => ({ ...prev, isUrgentOrder: !prev.isUrgentOrder }));

  const updateDelivery = (data: Partial<DeliveryData>) =>
    setState(prev => ({ ...prev, delivery: { ...prev.delivery, ...data } }));

  const completePayment = () => {
    const generatedId = `TP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setState(prev => ({ ...prev, paymentCompleted: true, orderId: generatedId }));
    return generatedId;
  };

  const resetOrder = (initialProduct?: ProductItem) => {
    setState(prev => {
      const hasDetails = prev.customer && prev.customer.name.trim() && prev.customer.phone.trim();
      return {
        ...prev,
        currentStep: hasDetails ? 2 : 1,
        items: initialProduct ? [
          {
            id: `item-${Date.now()}`,
            productId: initialProduct.id,
            name: initialProduct.name,
            category: initialProduct.category,
            pricePerUnit: initialProduct.startingPrice,
            requiresSizes: initialProduct.requiresSizes,
            requiresColors: initialProduct.requiresColors,
            requiresMockup: initialProduct.requiresMockup,
            applyVolumeDiscount: initialProduct.applyVolumeDiscount,
            quantity: initialProduct.requiresSizes ? 0 : 100,
            colorVariants: initialProduct.requiresColors ? [
              {
                id: `var-${Date.now()}`,
                color: initialProduct.colors[0] || 'Black',
                colorHex: '#000000',
                sizes: { ...defaultSizes },
              }
            ] : [],
            artwork: defaultArtwork(),
            mockup: defaultMockup(),
          }
        ] : [],
        isUrgentOrder: false,
        delivery: { address: '', city: '', pincode: '' },
        paymentCompleted: false,
        orderId: '',
      };
    });
  };

  const value = {
    state,
    nextStep,
    prevStep,
    setStep,
    updateCustomer,
    addOrderItem,
    removeOrderItem,
    updateItemQuantity,
    addItemColorVariant,
    removeItemColorVariant,
    updateItemVariantSizeQty,
    updateItemColor,
    updateItemArtworkMode,
    setItemArtworkFile,
    updateItemPlacementTransform,
    removeItemPlacementArtwork,
    updateItemInstructions,
    setItemActiveView,
    setItemActivePlacementId,
    setItemDesignerAssistance,
    toggleUrgentOrder,
    updateDelivery,
    completePayment,
    resetOrder,
    totalPieces,
    subtotal,
    urgentFee,
    grandTotal,
  };

  return <OrderFlowContext.Provider value={value}>{children}</OrderFlowContext.Provider>;
}

export function useOrderFlow() {
  const context = useContext(OrderFlowContext);
  if (context === undefined) {
    throw new Error('useOrderFlow must be used within an OrderFlowProvider');
  }
  return context;
}

