
import React, { createContext, useContext, useEffect } from 'react';
import { initializeGA4, trackPageViewWithUTM } from '@/utils/ga4-tracker';
import { useLocation } from 'react-router-dom';
import { useUTM } from '@/contexts/UTMContext';

interface GA4ContextType {
  initialized: boolean;
}

const GA4Context = createContext<GA4ContextType | undefined>(undefined);

export const useGA4 = () => {
  const context = useContext(GA4Context);
  if (context === undefined) {
    throw new Error('useGA4 must be used within a GA4Provider');
  }
  return context;
};

interface GA4ProviderProps {
  children: React.ReactNode;
}

export const GA4Provider: React.FC<GA4ProviderProps> = ({ children }) => {
  const location = useLocation();
  const { trackingData, isLoaded } = useUTM();

  useEffect(() => {
    // Initialize GA4 on app start
    initializeGA4();
    console.log('🔍 GA4: Initialized');
  }, []);

  useEffect(() => {
    // Only track page views when UTM data is loaded
    if (isLoaded) {
      trackPageViewWithUTM(location.pathname + location.search, trackingData);
      console.log('🔍 GA4: Page view tracked with UTMs', {
        path: location.pathname,
        utms: {
          source: trackingData.utm_source,
          medium: trackingData.utm_medium,
          campaign: trackingData.utm_campaign
        }
      });
    }
  }, [location, trackingData, isLoaded]);

  const value: GA4ContextType = {
    initialized: true,
  };

  return (
    <GA4Context.Provider value={value}>
      {children}
    </GA4Context.Provider>
  );
};
