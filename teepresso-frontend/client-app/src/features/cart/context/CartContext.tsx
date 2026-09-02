'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductItem } from '@/features/catalog/data/productsData';

export type SizeQtyMap = Record<string, number>;

export interface ColorVariant {
  id: string;
  color: string;
  colorHex: string;
  pattern?: string;
  sizes: SizeQtyMap;
  quantity?: number; // Used if requiresSizes is false
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

export interface ArtworkData {
  file: File | null;
  previewUrl: string;
  mode: 'has_design' | 'need_help' | 'none';
  instructions: string;
  placements: Record<string, PlacementArtworkData>;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  pricePerUnit: number;
  
  requiresSizes: boolean;
  requiresColors: boolean;
  requiresMockup: boolean;
  applyVolumeDiscount: boolean;

  colorVariants: ColorVariant[];
  artwork: ArtworkData;
  
  totalItemQuantity: number;
  totalItemPrice: number;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
}

interface CartContextType {
  cart: CartState;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (isOpen: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id' | 'totalItemQuantity' | 'totalItemPrice'>) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
}

const initialCartState: CartState = {
  items: [],
  subtotal: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(initialCartState);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('teepresso_cart_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.items) {
          setCart(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      const serializableItems = cart.items.map(item => ({
        ...item,
        artwork: {
          ...item.artwork,
          file: null // cannot serialize File object
        }
      }));
      localStorage.setItem('teepresso_cart_v1', JSON.stringify({ ...cart, items: serializableItems }));
    } catch {
      // ignore
    }
  }, [cart]);

  // Recalculate totals
  useEffect(() => {
    let newSubtotal = 0;
    
    const updatedItems = cart.items.map(item => {
      let qty = 0;
      item.colorVariants.forEach(variant => {
        if (item.requiresSizes) {
          qty += Object.values(variant.sizes).reduce((sum, val) => sum + (val || 0), 0);
        } else {
          qty += variant.quantity || 0;
        }
      });

      let effectiveUnitPrice = item.pricePerUnit;
      if (item.applyVolumeDiscount) {
        if (qty >= 150) {
          effectiveUnitPrice = Math.round(item.pricePerUnit * 0.8);
        } else if (qty >= 75) {
          effectiveUnitPrice = Math.round(item.pricePerUnit * 0.9);
        }
      }

      const itemTotal = qty * effectiveUnitPrice;
      newSubtotal += itemTotal;

      return {
        ...item,
        totalItemQuantity: qty,
        totalItemPrice: itemTotal,
      };
    });

    // Only update if there's an actual change to prevent infinite loops
    const hasChanges = updatedItems.some((item, index) => 
      item.totalItemQuantity !== cart.items[index].totalItemQuantity ||
      item.totalItemPrice !== cart.items[index].totalItemPrice
    ) || newSubtotal !== cart.subtotal;

    if (hasChanges) {
      setCart(prev => ({
        ...prev,
        items: updatedItems,
        subtotal: newSubtotal
      }));
    }
  }, [cart.items, cart.subtotal]);

  const addToCart = (newItemData: Omit<CartItem, 'id' | 'totalItemQuantity' | 'totalItemPrice'>) => {
    const newItem: CartItem = {
      ...newItemData,
      id: `cart-item-${Date.now()}`,
      totalItemQuantity: 0,
      totalItemPrice: 0,
    };
    
    setCart(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== itemId)
    }));
  };

  const updateCartItem = (itemId: string, updates: Partial<CartItem>) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === itemId ? { ...i, ...updates } : i)
    }));
  };

  const clearCart = () => {
    setCart(initialCartState);
  };

  const value = {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
