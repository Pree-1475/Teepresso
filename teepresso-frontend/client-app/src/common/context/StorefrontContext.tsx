import React, { createContext, useContext, useState, useEffect } from 'react';
import { STOREFRONT_MODE as DEFAULT_MODE } from '@/common/config/storefront';
import { API_BASE_URL } from '@/common/config/api';

interface StorefrontContextType {
  storefrontMode: 'STANDARD' | 'FESTIVE';
  upiVpa: string;
  payeeName: string;
  refreshSettings: () => Promise<void>;
}

// Synchronously read cached mode from localStorage to prevent Flash of Unstyled Content (FOUC)
const getInitialMode = (): 'STANDARD' | 'FESTIVE' => {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('teepresso_storefront_mode');
    if (cached === 'STANDARD' || cached === 'FESTIVE') {
      return cached;
    }
  }
  return DEFAULT_MODE;
};

const StorefrontContext = createContext<StorefrontContextType>({
  storefrontMode: getInitialMode(),
  upiVpa: '9390771123@axl',
  payeeName: 'Teepresso Enterprise',
  refreshSettings: async () => {}
});

export const StorefrontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storefrontMode, setStorefrontMode] = useState<'STANDARD' | 'FESTIVE'>(getInitialMode);
  const [upiVpa, setUpiVpa] = useState('9390771123@axl');
  const [payeeName, setPayeeName] = useState('Teepresso Enterprise');

  // Fetch settings ONCE on mount (0 polling, 0 recurring server load)
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      const data = await res.json();
      if (data.success && data.settings) {
        if (data.settings.storefrontMode) {
          const newMode = data.settings.storefrontMode;
          setStorefrontMode(newMode);
          localStorage.setItem('teepresso_storefront_mode', newMode);
        }
        if (data.settings.upiVpa) setUpiVpa(data.settings.upiVpa);
        if (data.settings.payeeName) setPayeeName(data.settings.payeeName);
      }
    } catch (err) {
      console.error('Failed to load live storefront settings from backend:', err);
    }
  };

  useEffect(() => {
    // 1. Single lightweight fetch on page visit
    fetchSettings();

    // 2. Cross-Tab Sync: Listen to localStorage changes across browser tabs (0 server requests)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'teepresso_storefront_mode' && (e.newValue === 'STANDARD' || e.newValue === 'FESTIVE')) {
        setStorefrontMode(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <StorefrontContext.Provider value={{ storefrontMode, upiVpa, payeeName, refreshSettings: fetchSettings }}>
      {children}
    </StorefrontContext.Provider>
  );
};

export const useStorefront = () => useContext(StorefrontContext);
