'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- Types ---
export interface ContactInfo {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gst?: string;
  deliveryLocation: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sizes: Record<string, number>; // e.g., { XS: 10, S: 20 }
  colors: { primary: string; secondary?: string; specialRequest?: string };
}

export interface Artwork {
  id: string;
  name: string;
  size: number;
  previewUrl?: string;
}

export interface PrintingPreferences {
  placements: string[]; // 'Front', 'Back', etc.
  method: string; // 'Screen Printing', 'Embroidery', etc.
  finishing: string;
}

export interface OrderState {
  currentStep: number;
  contactInfo: ContactInfo;
  products: Product[];
  artwork: Artwork[];
  needsDesignAssistance: boolean;
  printingPreferences: PrintingPreferences;
  additionalNotes: string;
}

// --- Context ---
interface OrderFlowContextType {
  state: OrderState;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  updateContactInfo: (info: Partial<ContactInfo>) => void;
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  updateProductSizes: (productId: string, sizes: Record<string, number>) => void;
  updateProductColors: (productId: string, colors: Partial<Product['colors']>) => void;
  addArtwork: (artwork: Artwork) => void;
  removeArtwork: (artworkId: string) => void;
  setNeedsDesignAssistance: (needs: boolean) => void;
  updatePrintingPreferences: (prefs: Partial<PrintingPreferences>) => void;
  updateAdditionalNotes: (notes: string) => void;
  totalQuantity: number;
}

const initialState: OrderState = {
  currentStep: 1,
  contactInfo: {
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    gst: '',
    deliveryLocation: ''
  },
  products: [],
  artwork: [],
  needsDesignAssistance: false,
  printingPreferences: {
    placements: [],
    method: '',
    finishing: ''
  },
  additionalNotes: ''
};

const OrderFlowContext = createContext<OrderFlowContextType | undefined>(undefined);

export function OrderFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OrderState>(initialState);

  const totalQuantity = state.products.reduce((acc, product) => {
    const productTotal = Object.values(product.sizes).reduce((sum, qty) => sum + (qty || 0), 0);
    return acc + productTotal;
  }, 0);

  const nextStep = () => setState(prev => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 9) }));
  const prevStep = () => setState(prev => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
  const setStep = (step: number) => setState(prev => ({ ...prev, currentStep: step }));

  const updateContactInfo = (info: Partial<ContactInfo>) => 
    setState(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, ...info } }));

  const addProduct = (product: Product) => 
    setState(prev => ({ ...prev, products: [...prev.products, product] }));

  const removeProduct = (productId: string) => 
    setState(prev => ({ ...prev, products: prev.products.filter(p => p.id !== productId) }));

  const updateProductSizes = (productId: string, sizes: Record<string, number>) => 
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === productId ? { ...p, sizes } : p)
    }));

  const updateProductColors = (productId: string, colors: Partial<Product['colors']>) => 
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === productId ? { ...p, colors: { ...p.colors, ...colors } } : p)
    }));

  const addArtwork = (artwork: Artwork) => 
    setState(prev => ({ ...prev, artwork: [...prev.artwork, artwork] }));

  const removeArtwork = (artworkId: string) => 
    setState(prev => ({ ...prev, artwork: prev.artwork.filter(a => a.id !== artworkId) }));

  const setNeedsDesignAssistance = (needs: boolean) => 
    setState(prev => ({ ...prev, needsDesignAssistance: needs }));

  const updatePrintingPreferences = (prefs: Partial<PrintingPreferences>) => 
    setState(prev => ({ ...prev, printingPreferences: { ...prev.printingPreferences, ...prefs } }));

  const updateAdditionalNotes = (notes: string) => 
    setState(prev => ({ ...prev, additionalNotes: notes }));

  const value = {
    state,
    nextStep,
    prevStep,
    setStep,
    updateContactInfo,
    addProduct,
    removeProduct,
    updateProductSizes,
    updateProductColors,
    addArtwork,
    removeArtwork,
    setNeedsDesignAssistance,
    updatePrintingPreferences,
    updateAdditionalNotes,
    totalQuantity
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
