import React, { createContext, useContext, useState, useEffect } from 'react';
import { STOREFRONT_MODE as DEFAULT_MODE } from '@/common/config/storefront';

interface StorefrontContextType {
  storefrontMode: 'STANDARD' | 'FESTIVE';
  upiVpa: string;
  payeeName: string;
  refreshSettings: () => Promise<void>;
}

const StorefrontContext = createContext<StorefrontContextType>({
  storefrontMode: DEFAULT_MODE,
  upiVpa: '9390771123@axl',
  payeeName: 'Teepresso Enterprise',
  refreshSettings: async () => {}
});

export const StorefrontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storefrontMode, setStorefrontMode] = useState<'STANDARD' | 'FESTIVE'>(DEFAULT_MODE);
  const [upiVpa, setUpiVpa] = useState('9390771123@axl');
  const [payeeName, setPayeeName] = useState('Teepresso Enterprise');

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        if (data.settings.storefrontMode) setStorefrontMode(data.settings.storefrontMode);
        if (data.settings.upiVpa) setUpiVpa(data.settings.upiVpa);
        if (data.settings.payeeName) setPayeeName(data.settings.payeeName);
      }
    } catch (err) {
      console.error('Failed to load live storefront settings from backend:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
    // Poll settings every 3 seconds so dashboard changes reflect live without full reload!
    const interval = setInterval(fetchSettings, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <StorefrontContext.Provider value={{ storefrontMode, upiVpa, payeeName, refreshSettings: fetchSettings }}>
      {children}
    </StorefrontContext.Provider>
  );
};

export const useStorefront = () => useContext(StorefrontContext);
