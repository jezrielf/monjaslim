
import React, { createContext, useContext, useEffect } from 'react';
import { initializeGA4, trackPageView } from '@/utils/ga4-tracker';
import { useLocation } from 'react-router-dom';

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

  useEffect(() => {
    // Initialize GA4 on app start
    initializeGA4();
    console.log('🔍 GA4: Initialized');
  }, []);

  useEffect(() => {
    // Track page views on route changes
    trackPageView(location.pathname + location.search);
    console.log('🔍 GA4: Page view tracked', location.pathname);
  }, [location]);

  const value: GA4ContextType = {
    initialized: true,
  };

  return (
    <GA4Context.Provider value={value}>
      {children}
    </GA4Context.Provider>
  );
};
