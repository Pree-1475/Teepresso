'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CustomerData {
  name: string;
  phone: string;
  email: string;
  organization: string;
}

export interface SelectedProduct {
  id: string;
  name: string;
  category: string;
  quality: string;
  color: string;
  colorHex: string;
  pricePerUnit: number;
}

export interface SizeQtyMap {
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
  XXXL: number;
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
  x: number; // offset %
  y: number; // offset %
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

export interface DeliveryData {
  address: string;
  city: string;
  pincode: string;
}

export interface GuidedOrderState {
  currentStep: number;
  customer: CustomerData;
  product: SelectedProduct;
  colorVariants: ColorVariant[];
  artwork: ArtworkData;
  mockup: MockupState;
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
  updateProduct: (data: Partial<SelectedProduct>) => void;
  addColorVariant: (color: string, colorHex: string) => void;
  removeColorVariant: (id: string) => void;
  updateVariantSizeQty: (variantId: string, size: keyof SizeQtyMap, qty: number) => void;
  updateArtworkMode: (mode: 'has_design' | 'need_help') => void;
  setArtworkFile: (file: File | null, previewUrl: string, placementId?: string) => void;
  updatePlacementTransform: (placementId: string, transform: Partial<PlacementArtworkData>) => void;
  removePlacementArtwork: (placementId: string) => void;
  updateInstructions: (text: string) => void;
  setActiveView: (view: 'front' | 'back') => void;
  setActivePlacementId: (id: string) => void;
  setDesignerAssistance: (assist: boolean) => void;
  toggleUrgentOrder: () => void;
  updateDelivery: (data: Partial<DeliveryData>) => void;
  completePayment: () => string;
  totalPieces: number;
  subtotal: number;
  urgentFee: number;
  grandTotal: number;
}

const defaultSizes: SizeQtyMap = { XS: 0, S: 10, M: 20, L: 15, XL: 5, XXL: 0, XXXL: 0 };

const initialOrderState: GuidedOrderState = {
  currentStep: 1,
  customer: { name: '', phone: '', email: '', organization: '' },
  product: {
    id: 'tshirt-roundneck',
    name: 'Classic Round Neck T-Shirt',
    category: 'T-Shirts',
    quality: '180 GSM Super Combed Cotton',
    color: 'Warm Brown',
    colorHex: '#8c5b45',
    pricePerUnit: 199,
  },
  colorVariants: [
    {
      id: 'var-1',
      color: 'Warm Brown',
      colorHex: '#8c5b45',
      sizes: { ...defaultSizes },
    },
  ],
  artwork: {
    file: null,
    previewUrl: '',
    mode: 'has_design',
    instructions: '',
    placements: {},
  },
  mockup: {
    activeView: 'front',
    activePlacementId: 'front',
    frontTransform: { x: 0, y: 0, scale: 1, rotation: 0 },
    backTransform: { x: 0, y: 0, scale: 1, rotation: 0 },
    designerAssistance: false,
  },
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
      const saved = localStorage.getItem('teepresso_order_state_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.product) {
          setState(prev => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  useEffect(() => {
    try {
      const { artwork, ...serializableState } = state;
      localStorage.setItem('teepresso_order_state_v2', JSON.stringify(serializableState));
    } catch {
      // Ignore localStorage write errors
    }
  }, [state]);

  // Compute total pieces across all color variants
  const totalPieces = state.colorVariants.reduce((total, variant) => {
    const variantPieces = (Object.values(variant.sizes) as number[]).reduce((sum, qty) => sum + (qty || 0), 0);
    return total + variantPieces;
  }, 0);

  const getUnitPriceForVolume = (basePrice: number, pieces: number) => {
    if (pieces >= 150) return Math.round(basePrice * 0.8);
    if (pieces >= 75) return Math.round(basePrice * 0.9);
    return basePrice;
  };

  const effectiveUnitPrice = getUnitPriceForVolume(state.product.pricePerUnit, totalPieces);
  const subtotal = effectiveUnitPrice * totalPieces;
  const urgentFee = state.isUrgentOrder ? Math.round(subtotal * 0.2) : 0;
  const grandTotal = subtotal + urgentFee;

  const nextStep = () => setState(prev => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 4) }));
  const prevStep = () => setState(prev => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
  const setStep = (step: number) => setState(prev => ({ ...prev, currentStep: step }));

  const updateCustomer = (data: Partial<CustomerData>) =>
    setState(prev => ({ ...prev, customer: { ...prev.customer, ...data } }));

  const updateProduct = (data: Partial<SelectedProduct>) =>
    setState(prev => ({
      ...prev,
      product: { ...prev.product, ...data },
      // Update default color variant
      colorVariants: prev.colorVariants.map((v, i) =>
        i === 0 && data.color && data.colorHex ? { ...v, color: data.color, colorHex: data.colorHex } : v
      ),
    }));

  const addColorVariant = (color: string, colorHex: string) => {
    const newVariant: ColorVariant = {
      id: `var-${Date.now()}`,
      color,
      colorHex,
      sizes: { XS: 0, S: 0, M: 10, L: 10, XL: 0, XXL: 0, XXXL: 0 },
    };
    setState(prev => ({ ...prev, colorVariants: [...prev.colorVariants, newVariant] }));
  };

  const removeColorVariant = (id: string) => {
    setState(prev => ({
      ...prev,
      colorVariants: prev.colorVariants.length > 1 ? prev.colorVariants.filter(v => v.id !== id) : prev.colorVariants,
    }));
  };

  const updateVariantSizeQty = (variantId: string, size: keyof SizeQtyMap, qty: number) => {
    setState(prev => ({
      ...prev,
      colorVariants: prev.colorVariants.map(variant => {
        if (variant.id !== variantId) return variant;
        return {
          ...variant,
          sizes: {
            ...variant.sizes,
            [size]: Math.max(0, qty),
          },
        };
      }),
    }));
  };

  const updateArtworkMode = (mode: 'has_design' | 'need_help') =>
    setState(prev => ({ ...prev, artwork: { ...prev.artwork, mode } }));

  const setArtworkFile = (file: File | null, previewUrl: string, placementId = 'front') =>
    setState(prev => ({
      ...prev,
      artwork: {
        ...prev.artwork,
        file,
        previewUrl,
        placements: {
          ...prev.artwork.placements,
          [placementId]: {
            placementId,
            file,
            previewUrl,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
          },
        },
      },
    }));

  const updatePlacementTransform = (placementId: string, transform: Partial<PlacementArtworkData>) =>
    setState(prev => {
      const currentPlacement = prev.artwork.placements[placementId] || {
        placementId,
        file: null,
        previewUrl: '',
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
      };
      return {
        ...prev,
        artwork: {
          ...prev.artwork,
          placements: {
            ...prev.artwork.placements,
            [placementId]: {
              ...currentPlacement,
              ...transform,
            },
          },
        },
      };
    });

  const removePlacementArtwork = (placementId: string) =>
    setState(prev => {
      const newPlacements = { ...prev.artwork.placements };
      delete newPlacements[placementId];
      return {
        ...prev,
        artwork: {
          ...prev.artwork,
          placements: newPlacements,
        },
      };
    });

  const updateInstructions = (instructions: string) =>
    setState(prev => ({ ...prev, artwork: { ...prev.artwork, instructions } }));

  const setActiveView = (view: 'front' | 'back') =>
    setState(prev => ({ ...prev, mockup: { ...prev.mockup, activeView: view } }));

  const setActivePlacementId = (activePlacementId: string) =>
    setState(prev => ({ ...prev, mockup: { ...prev.mockup, activePlacementId } }));

  const setDesignerAssistance = (designerAssistance: boolean) =>
    setState(prev => ({ ...prev, mockup: { ...prev.mockup, designerAssistance } }));

  const toggleUrgentOrder = () =>
    setState(prev => ({ ...prev, isUrgentOrder: !prev.isUrgentOrder }));

  const updateDelivery = (data: Partial<DeliveryData>) =>
    setState(prev => ({ ...prev, delivery: { ...prev.delivery, ...data } }));

  const completePayment = () => {
    const generatedId = `TP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setState(prev => ({ ...prev, paymentCompleted: true, orderId: generatedId }));
    return generatedId;
  };

  const value = {
    state,
    nextStep,
    prevStep,
    setStep,
    updateCustomer,
    updateProduct,
    addColorVariant,
    removeColorVariant,
    updateVariantSizeQty,
    updateArtworkMode,
    setArtworkFile,
    updatePlacementTransform,
    removePlacementArtwork,
    updateInstructions,
    setActiveView,
    setActivePlacementId,
    setDesignerAssistance,
    toggleUrgentOrder,
    updateDelivery,
    completePayment,
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
