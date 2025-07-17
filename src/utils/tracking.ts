// Tracking utilities for UTMify events
declare global {
  interface Window {
    utmify: {
      track: (eventName: string, properties?: Record<string, any>) => void;
    };
    pixelId: string;
  }
}

export interface TrackingEventData {
  treatment_type?: string;
  purchase_mode?: string;
  treatment_value?: string;
  lead_id?: string;
  event_value?: number;
}

// Wait for UTMify to be available with polling and timeout
const waitForUTMify = (timeout = 10000): Promise<boolean> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkUTMify = () => {
      console.log('🔍 Checking UTMify availability...', {
        utmifyExists: !!(window as any).utmify,
        pixelId: (window as any).pixelId,
        timeElapsed: Date.now() - startTime
      });
      
      if (typeof window !== 'undefined' && (window as any).utmify && typeof (window as any).utmify.track === 'function') {
        console.log('✅ UTMify is ready!');
        resolve(true);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        console.warn('⏰ UTMify loading timeout after', timeout, 'ms');
        resolve(false);
        return;
      }
      
      setTimeout(checkUTMify, 100);
    };
    
    checkUTMify();
  });
};

// Send simplified event to UTMify
const sendUTMifyEvent = async (eventName: string, eventData: TrackingEventData) => {
  try {
    console.log(`🚀 Attempting to send ${eventName} event to UTMify...`);
    
    const isReady = await waitForUTMify();
    
    if (!isReady) {
      console.error('❌ UTMify not available, cannot send event');
      return false;
    }

    // Simplified event structure more likely to work
    const simpleEvent = {
      value: eventData.event_value || 0,
      currency: 'BRL',
      content_name: eventData.treatment_type || 'unknown',
      custom_parameter_1: eventData.purchase_mode || 'unknown',
      custom_parameter_2: eventData.treatment_value || 'unknown',
      custom_parameter_3: eventData.lead_id || 'unknown'
    };

    console.log(`📤 Sending ${eventName} to UTMify:`, simpleEvent);
    
    (window as any).utmify.track(eventName, simpleEvent);
    
    console.log(`✅ ${eventName} event sent successfully to UTMify`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error sending ${eventName} to UTMify:`, error);
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