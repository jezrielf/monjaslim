import React, { createContext, useContext, useEffect, useState } from 'react';
import { UTMParams, TrackingData, getCurrentUTMData, getTrackingData } from '@/utils/utm-tracker';

interface UTMContextType {
  utmData: UTMParams;
  trackingData: TrackingData;
  isLoaded: boolean;
  refreshUTMData: () => void;
}

const UTMContext = createContext<UTMContextType | undefined>(undefined);

export const useUTM = () => {
  const context = useContext(UTMContext);
  if (context === undefined) {
    throw new Error('useUTM must be used within a UTMProvider');
  }
  return context;
};

interface UTMProviderProps {
  children: React.ReactNode;
}

export const UTMProvider: React.FC<UTMProviderProps> = ({ children }) => {
  const [utmData, setUtmData] = useState<UTMParams>({});
  const [trackingData, setTrackingData] = useState<TrackingData>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshUTMData = () => {
    const currentUTM = getCurrentUTMData();
    const currentTracking = getTrackingData();
    
    setUtmData(currentUTM);
    setTrackingData(currentTracking);
    setIsLoaded(true);
  };

  useEffect(() => {
    // Initialize UTM tracking on mount
    refreshUTMData();

    // Listen for URL changes (for SPAs)
    const handleLocationChange = () => {
      refreshUTMData();
    };

    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const value: UTMContextType = {
    utmData,
    trackingData,
    isLoaded,
    refreshUTMData,
  };

  return (
    <UTMContext.Provider value={value}>
      {children}
    </UTMContext.Provider>
  );
};