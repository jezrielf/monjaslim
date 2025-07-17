// Tracking utilities for UTMify events
declare global {
  interface Window {
    utmify: {
      track: (eventName: string, properties?: Record<string, any>) => void;
    };
    pixelId: string;
    utmifyLoaded: boolean;
    dataLayer: any[];
  }
}

export interface TrackingEventData {
  treatment_type?: string;
  purchase_mode?: string;
  treatment_value?: string;
  lead_id?: string;
  event_value?: number;
}

// Multiple strategies to ensure UTMify tracking works
const tryMultipleStrategies = async (eventName: string, eventData: TrackingEventData): Promise<boolean> => {
  const strategies = [
    // Strategy 1: Current simplified structure
    () => ({
      value: eventData.event_value || 0,
      currency: 'BRL',
      content_name: eventData.treatment_type || 'unknown',
      custom_parameter_1: eventData.purchase_mode || 'unknown',
      custom_parameter_2: eventData.treatment_value || 'unknown',
      custom_parameter_3: eventData.lead_id || 'unknown'
    }),
    
    // Strategy 2: Facebook Pixel-like structure
    () => ({
      value: eventData.event_value || 0,
      currency: 'BRL',
      content_type: 'product',
      content_category: eventData.treatment_type || 'treatment'
    }),
    
    // Strategy 3: Minimal structure
    () => ({
      value: eventData.event_value || 0
    }),
    
    // Strategy 4: Just event name (no properties)
    () => ({})
  ];

  for (let i = 0; i < strategies.length; i++) {
    try {
      const eventProps = strategies[i]();
      console.log(`🧪 Trying UTMify strategy ${i + 1} for ${eventName}:`, eventProps);
      
      if (window.utmify && typeof window.utmify.track === 'function') {
        window.utmify.track(eventName, eventProps);
        console.log(`✅ Strategy ${i + 1} worked for ${eventName}`);
        return true;
      }
    } catch (error) {
      console.log(`❌ Strategy ${i + 1} failed:`, error);
    }
  }
  
  return false;
};

// Backup to dataLayer if UTMify fails
const backupToDataLayer = (eventName: string, eventData: TrackingEventData) => {
  try {
    if (!window.dataLayer) {
      window.dataLayer = [];
    }
    
    const dlEvent = {
      event: `utmify_${eventName.toLowerCase()}`,
      event_category: 'UTMify Backup',
      treatment_type: eventData.treatment_type,
      purchase_mode: eventData.purchase_mode,
      treatment_value: eventData.treatment_value,
      lead_id: eventData.lead_id,
      value: eventData.event_value || 0
    };
    
    window.dataLayer.push(dlEvent);
    console.log(`💾 Backed up ${eventName} to dataLayer:`, dlEvent);
    return true;
  } catch (error) {
    console.error('❌ Failed to backup to dataLayer:', error);
    return false;
  }
};

// Wait for UTMify with enhanced checking
const waitForUTMify = (timeout = 15000): Promise<boolean> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkUTMify = () => {
      const status = {
        scriptLoaded: window.utmifyLoaded,
        utmifyExists: !!(window as any).utmify,
        trackFunction: !!(window as any).utmify?.track,
        pixelId: window.pixelId,
        timeElapsed: Date.now() - startTime
      };
      
      console.log('🔍 UTMify status check:', status);
      
      if (window.utmify && typeof window.utmify.track === 'function') {
        console.log('✅ UTMify is fully ready!');
        resolve(true);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        console.warn('⏰ UTMify loading timeout after', timeout, 'ms. Final status:', status);
        resolve(false);
        return;
      }
      
      setTimeout(checkUTMify, 200);
    };
    
    checkUTMify();
  });
};

// Robust UTMify event sender with multiple strategies and fallbacks
const sendUTMifyEvent = async (eventName: string, eventData: TrackingEventData): Promise<boolean> => {
  console.log(`🚀 Starting robust ${eventName} tracking...`, eventData);
  
  try {
    // Step 1: Wait for UTMify to load
    const isReady = await waitForUTMify();
    
    if (isReady) {
      // Step 2: Try multiple strategies
      const success = await tryMultipleStrategies(eventName, eventData);
      
      if (success) {
        console.log(`✅ ${eventName} sent successfully to UTMify`);
        return true;
      }
    }
    
    // Step 3: Fallback to dataLayer
    console.log(`🔄 UTMify failed, falling back to dataLayer for ${eventName}`);
    const backupSuccess = backupToDataLayer(eventName, eventData);
    
    if (backupSuccess) {
      console.log(`💾 ${eventName} backed up to dataLayer successfully`);
    }
    
    return false;
    
  } catch (error) {
    console.error(`❌ Error in robust ${eventName} tracking:`, error);
    
    // Final fallback to dataLayer
    backupToDataLayer(eventName, eventData);
    return false;
  }
};

export const trackConversionEvent = async (eventData: TrackingEventData) => {
  console.log('🎯 Starting conversion tracking...', eventData);
  
  // Try Purchase event first
  const purchaseSuccess = await sendUTMifyEvent('Purchase', eventData);
  
  // Also try a simpler "Conversion" event as fallback
  if (!purchaseSuccess) {
    console.log('🔄 Purchase failed, trying Conversion event...');
    await sendUTMifyEvent('Conversion', eventData);
  }
};

export const trackLeadEvent = async (eventData: TrackingEventData) => {
  console.log('🎯 Starting lead tracking...', eventData);
  
  // Try Lead event first
  const leadSuccess = await sendUTMifyEvent('Lead', eventData);
  
  // Also try "CompleteRegistration" as fallback
  if (!leadSuccess) {
    console.log('🔄 Lead failed, trying CompleteRegistration event...');
    await sendUTMifyEvent('CompleteRegistration', eventData);
  }
};