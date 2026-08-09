'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- Types for Guided Order Flow ---
export interface CustomerData {
  name: string;
  phone: string;
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

export interface ArtworkData {
  file: File | null;
  previewUrl: string;
  mode: 'has_design' | 'need_help';
  instructions: string;
}

export interface MockupTransform {
  x: number; // offset % from center
  y: number; // offset % from top
  scale: number; // 0.5 to 2.0
  rotation: number; // -180 to 180 degrees
}

export interface MockupState {
  activeView: 'front' | 'back';
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
  sizes: SizeQtyMap;
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
  updateSizeQty: (size: keyof SizeQtyMap, qty: number) => void;
  updateArtworkMode: (mode: 'has_design' | 'need_help') => void;
  setArtworkFile: (file: File | null, previewUrl: string) => void;
  updateInstructions: (text: string) => void;
  updateMockupTransform: (view: 'front' | 'back', transform: Partial<MockupTransform>) => void;
  setActiveView: (view: 'front' | 'back') => void;
  setDesignerAssistance: (assist: boolean) => void;
  toggleUrgentOrder: () => void;
  updateDelivery: (data: Partial<DeliveryData>) => void;
  completePayment: () => string;
  totalPieces: number;
  subtotal: number;
  urgentFee: number;
  grandTotal: number;
}

const defaultTransform: MockupTransform = { x: 0, y: 0, scale: 1, rotation: 0 };

const initialOrderState: GuidedOrderState = {
  currentStep: 1,
  customer: { name: '', phone: '' },
  product: {
    id: 'tshirt-roundneck',
    name: 'Classic Round Neck T-Shirt',
    category: 'T-Shirts',
    quality: '180 GSM Super Combed Cotton',
    color: 'Warm Brown',
    colorHex: '#8c5b45',
    pricePerUnit: 199,
  },
  sizes: { XS: 0, S: 15, M: 25, L: 20, XL: 10, XXL: 0, XXXL: 0 },
  artwork: {
    file: null,
    previewUrl: '',
    mode: 'has_design',
    instructions: '',
  },
  mockup: {
    activeView: 'front',
    frontTransform: { ...defaultTransform },
    backTransform: { ...defaultTransform },
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

  // Auto-restore state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('teepresso_order_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.product) {
          setState(prev => ({ ...prev, ...parsed, artwork: { ...prev.artwork, mode: parsed.artwork?.mode || 'has_design' } }));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save state updates to localStorage
  useEffect(() => {
    try {
      const { artwork, ...serializableState } = state;
      localStorage.setItem('teepresso_order_state', JSON.stringify(serializableState));
    } catch {
      // Ignore serialization errors
    }
  }, [state]);

  // Total calculation helpers
  const totalPieces = (Object.values(state.sizes) as number[]).reduce((sum, val) => sum + (val || 0), 0);

  // Dynamic volume discount rate per piece
  const getUnitPriceForVolume = (basePrice: number, pieces: number) => {
    if (pieces >= 150) return Math.round(basePrice * 0.8);
    if (pieces >= 75) return Math.round(basePrice * 0.9);
    return basePrice;
  };

  const effectiveUnitPrice = getUnitPriceForVolume(state.product.pricePerUnit, totalPieces);
  const subtotal = effectiveUnitPrice * totalPieces;
  const urgentFee = state.isUrgentOrder ? Math.round(subtotal * 0.2) : 0;
  const grandTotal = subtotal + urgentFee;

  const nextStep = () => setState(prev => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 8) }));
  const prevStep = () => setState(prev => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
  const setStep = (step: number) => setState(prev => ({ ...prev, currentStep: step }));

  const updateCustomer = (data: Partial<CustomerData>) =>
    setState(prev => ({ ...prev, customer: { ...prev.customer, ...data } }));

  const updateProduct = (data: Partial<SelectedProduct>) =>
    setState(prev => ({ ...prev, product: { ...prev.product, ...data } }));

  const updateSizeQty = (size: keyof SizeQtyMap, qty: number) =>
    setState(prev => ({ ...prev, sizes: { ...prev.sizes, [size]: Math.max(0, qty) } }));

  const updateArtworkMode = (mode: 'has_design' | 'need_help') =>
    setState(prev => ({ ...prev, artwork: { ...prev.artwork, mode } }));

  const setArtworkFile = (file: File | null, previewUrl: string) =>
    setState(prev => ({ ...prev, artwork: { ...prev.artwork, file, previewUrl } }));

  const updateInstructions = (instructions: string) =>
    setState(prev => ({ ...prev, artwork: { ...prev.artwork, instructions } }));

  const updateMockupTransform = (view: 'front' | 'back', transform: Partial<MockupTransform>) =>
    setState(prev => ({
      ...prev,
      mockup: {
        ...prev.mockup,
        [view === 'front' ? 'frontTransform' : 'backTransform']: {
          ...prev.mockup[view === 'front' ? 'frontTransform' : 'backTransform'],
          ...transform,
        },
      },
    }));

  const setActiveView = (view: 'front' | 'back') =>
    setState(prev => ({ ...prev, mockup: { ...prev.mockup, activeView: view } }));

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
    updateSizeQty,
    updateArtworkMode,
    setArtworkFile,
    updateInstructions,
    updateMockupTransform,
    setActiveView,
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
