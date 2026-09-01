import React, { useState, useEffect } from 'react';
import { StandardHomePage } from '@/features/home/StandardHomePage';
import { FestiveHomePage } from '@/features/home/FestiveHomePage';
import { API_BASE_URL } from '@/common/config/api';

const getInitialMode = (): 'STANDARD' | 'FESTIVE' => {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('teepresso_storefront_mode');
    if (cached === 'FESTIVE' || cached === 'STANDARD') {
      return cached;
    }
  }
  return 'STANDARD';
};

export function HomePage() {
  const [mode, setMode] = useState<'STANDARD' | 'FESTIVE'>(getInitialMode);

  useEffect(() => {
    const fetchSettings = () => {
      fetch(`${API_BASE_URL}/settings`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.settings && data.settings.storefrontMode) {
            const newMode = data.settings.storefrontMode as 'STANDARD' | 'FESTIVE';
            setMode(newMode);
            localStorage.setItem('teepresso_storefront_mode', newMode);
          }
        })
        .catch(() => {});
    };

    fetchSettings();
    const interval = setInterval(fetchSettings, 3000);
    return () => clearInterval(interval);
  }, []);

  if (mode === 'FESTIVE') {
    return <FestiveHomePage />;
  }

  return <StandardHomePage />;
}

export default HomePage;
