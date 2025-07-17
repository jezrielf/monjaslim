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

export const trackConversionEvent = (eventData: TrackingEventData) => {
  try {
    // Check if UTMify is loaded
    if (typeof window !== 'undefined' && window.utmify) {
      const eventProperties = {
        event_category: 'conversion',
        event_label: eventData.treatment_type || 'unknown',
        value: eventData.event_value || 0,
        currency: 'BRL',
        content_name: eventData.treatment_type,
        content_category: 'treatment',
        custom_data: {
          purchase_mode: eventData.purchase_mode,
          treatment_value: eventData.treatment_value,
          lead_id: eventData.lead_id
        }
      };

      // Track Purchase event with R$ 0.00 value for conversion tracking
      window.utmify.track('Purchase', eventProperties);
      
      console.log('UTMify Purchase event tracked:', eventProperties);
    } else {
      console.warn('UTMify not loaded, tracking event skipped');
    }
  } catch (error) {
    console.error('Error tracking conversion event:', error);
  }
};

export const trackLeadEvent = (eventData: TrackingEventData) => {
  try {
    if (typeof window !== 'undefined' && window.utmify) {
      const eventProperties = {
        event_category: 'lead_generation',
        event_label: eventData.treatment_type || 'unknown',
        value: 0,
        currency: 'BRL',
        content_name: eventData.treatment_type,
        content_category: 'treatment',
        custom_data: {
          purchase_mode: eventData.purchase_mode,
          treatment_value: eventData.treatment_value,
          lead_id: eventData.lead_id
        }
      };

      // Track Lead event
      window.utmify.track('Lead', eventProperties);
      
      console.log('UTMify Lead event tracked:', eventProperties);
    } else {
      console.warn('UTMify not loaded, lead tracking event skipped');
    }
  } catch (error) {
    console.error('Error tracking lead event:', error);
  }
};