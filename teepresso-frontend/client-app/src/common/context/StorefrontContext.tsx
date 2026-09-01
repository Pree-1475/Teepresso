import React, { createContext, useContext, useState, useEffect } from 'react';
import { STOREFRONT_MODE as DEFAULT_MODE } from '@/common/config/storefront';
import { API_BASE_URL } from '@/common/config/api';

interface StorefrontContextType {
  storefrontMode: 'STANDARD' | 'FESTIVE';
  upiVpa: string;
  payeeName: string;
  contactPhone: string;
  refreshSettings: () => Promise<void>;
}

const getInitialMode = (): 'STANDARD' | 'FESTIVE' => {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('teepresso_storefront_mode');
    if (cached === 'STANDARD' || cached === 'FESTIVE') {
      return cached;
    }
  }
  return DEFAULT_MODE;
};

const getInitialPhone = (): string => {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('teepresso_contact_phone');
    if (cached) return cached;
  }
  return '919390771123';
};

const StorefrontContext = createContext<StorefrontContextType>({
  storefrontMode: getInitialMode(),
  upiVpa: '9390771123@axl',
  payeeName: 'Teepresso Enterprise',
  contactPhone: getInitialPhone(),
  refreshSettings: async () => {}
});

export const StorefrontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storefrontMode, setStorefrontMode] = useState<'STANDARD' | 'FESTIVE'>(getInitialMode);
  const [upiVpa, setUpiVpa] = useState('9390771123@axl');
  const [payeeName, setPayeeName] = useState('Teepresso Enterprise');
  const [contactPhone, setContactPhone] = useState(getInitialPhone);

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
        if (data.settings.contactPhone) {
          setContactPhone(data.settings.contactPhone);
          localStorage.setItem('teepresso_contact_phone', data.settings.contactPhone);
        }
      }
    } catch (err) {
      console.error('Failed to load live storefront settings from backend:', err);
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'teepresso_storefront_mode' && (e.newValue === 'STANDARD' || e.newValue === 'FESTIVE')) {
        setStorefrontMode(e.newValue);
      }
      if (e.key === 'teepresso_contact_phone' && e.newValue) {
        setContactPhone(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <StorefrontContext.Provider value={{ storefrontMode, upiVpa, payeeName, contactPhone, refreshSettings: fetchSettings }}>
      {children}
    </StorefrontContext.Provider>
  );
};

export const useStorefront = () => useContext(StorefrontContext);
