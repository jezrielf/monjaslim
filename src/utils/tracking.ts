
import { UTMParams, TrackingData, FunnelEvent, FunnelEventType } from '@/types/tracking';

// Generate unique session ID
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Parse URL parameters including hash parameters (for SPAs)
const getAllUrlParams = (): URLSearchParams => {
  // First, check if this is a Facebook redirect URL
  const currentUrl = window.location.href;
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check for Facebook's encoded URL parameter
  const encodedUrl = urlParams.get('u');
  if (encodedUrl) {
    try {
      // Decode the Facebook URL
      const decodedUrl = decodeURIComponent(encodedUrl);
      console.log('🔍 Facebook encoded URL detected:', decodedUrl);
      
      // Parse the decoded URL
      const url = new URL(decodedUrl);
      const decodedParams = new URLSearchParams(url.search);
      
      // Extract fbclid from the decoded URL
      const fbclid = decodedParams.get('fbclid');
      if (fbclid) {
        // Add fbclid to current params
        urlParams.set('fbclid', fbclid);
        
        // Also set default Facebook UTMs if not present
        if (!urlParams.get('utm_source')) {
          urlParams.set('utm_source', 'facebook');
          urlParams.set('utm_medium', 'social');
        }
      }
      
      // Merge any other parameters from the decoded URL
      decodedParams.forEach((value, key) => {
        if (!urlParams.has(key) && key !== 'fbclid') {
          urlParams.set(key, value);
        }
      });
    } catch (error) {
      console.error('Error decoding Facebook URL:', error);
    }
  }
  
  // Also check hash parameters (common in SPAs)
  if (window.location.hash.includes('?')) {
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    // Merge hash params into query params
    hashParams.forEach((value, key) => {
      if (!urlParams.has(key)) {
        urlParams.set(key, value);
      }
    });
  }
  
  return urlParams;
};

// Detect traffic source from user agent and referrer
export const detectTrafficSource = (): { source: string; medium: string; isSocial: boolean } => {
  const userAgent = navigator.userAgent.toLowerCase();
  const referrer = document.referrer.toLowerCase();
  const currentUrl = window.location.href.toLowerCase();

  // Check if URL contains Facebook redirect patterns
  if (currentUrl.includes('fbclid') || currentUrl.includes('facebook.com') || currentUrl.includes('fb.com')) {
    return { source: 'facebook', medium: 'paid_social', isSocial: true };
  }

  // Facebook/Instagram detection via user agent
  if (userAgent.includes('fban') || userAgent.includes('fbav') || userAgent.includes('fb_iab')) {
    return { source: 'facebook', medium: 'mobile_app', isSocial: true };
  }
  
  if (userAgent.includes('instagram')) {
    return { source: 'instagram', medium: 'mobile_app', isSocial: true };
  }

  // Facebook/Instagram detection via referrer
  if (referrer.includes('facebook.com') || referrer.includes('m.facebook.com') || referrer.includes('fb.com')) {
    return { source: 'facebook', medium: 'referral', isSocial: true };
  }
  
  if (referrer.includes('instagram.com') || referrer.includes('l.instagram.com')) {
    return { source: 'instagram', medium: 'referral', isSocial: true };
  }

  // Other social platforms
  if (referrer.includes('t.co') || referrer.includes('twitter.com') || referrer.includes('x.com')) {
    return { source: 'twitter', medium: 'referral', isSocial: true };
  }

  if (referrer.includes('linkedin.com')) {
    return { source: 'linkedin', medium: 'referral', isSocial: true };
  }

  if (referrer.includes('youtube.com')) {
    return { source: 'youtube', medium: 'referral', isSocial: true };
  }

  // Official site detection
  if (referrer.includes('monjaslim.site')) {
    return { source: 'site_oficial', medium: 'referral', isSocial: false };
  }

  // Direct or other
  if (!referrer) {
    return { source: 'direct', medium: 'none', isSocial: false };
  }

  return { source: 'referral', medium: 'website', isSocial: false };
};

// Extract UTM parameters from URL with enhanced fallback detection
export const extractUTMParams = (): UTMParams => {
  const urlParams = getAllUrlParams();
  
  // Define all possible UTM parameter variations
  const paramVariations = {
    utm_source: ['utm_source', 'source', 'ref'],
    utm_medium: ['utm_medium', 'medium'],
    utm_campaign: ['utm_campaign', 'campaign'],
    utm_content: ['utm_content', 'content', 'ad'],
    utm_term: ['utm_term', 'term', 'keyword'],
  };
  
  // Helper function to get parameter value from variations
  const getParamValue = (variations: string[]): string => {
    for (const variant of variations) {
      const value = urlParams.get(variant);
      if (value && value !== 'null' && value !== 'undefined') {
        return value;
      }
    }
    return '';
  };
  
  // Extract UTM parameters with variations
  let utmParams: UTMParams = {
    utm_source: getParamValue(paramVariations.utm_source),
    utm_medium: getParamValue(paramVariations.utm_medium),
    utm_campaign: getParamValue(paramVariations.utm_campaign),
    utm_content: getParamValue(paramVariations.utm_content),
    utm_term: getParamValue(paramVariations.utm_term),
    fbclid: urlParams.get('fbclid') || '',
    fb_source: urlParams.get('fb_source') || '',
  };

  // Check if UTM params exist but are empty (common pattern from Facebook)
  const hasEmptyUTMs = window.location.search.includes('utm_source=&') || 
                       window.location.search.includes('utm_source=');
  
  // Check for stored Facebook redirect data first
  const storedFacebookData = checkStoredFacebookData();
  if (storedFacebookData) {
    console.log('📦 Using stored Facebook redirect data:', storedFacebookData);
    utmParams = { ...utmParams, ...storedFacebookData };
  }
  
  // Check if we have any actual UTM parameters with values
  const hasValidUTM = Boolean(
    (utmParams.utm_source && utmParams.utm_source !== '') || 
    (utmParams.utm_medium && utmParams.utm_medium !== '') || 
    (utmParams.utm_campaign && utmParams.utm_campaign !== '') || 
    (utmParams.utm_content && utmParams.utm_content !== '') || 
    (utmParams.utm_term && utmParams.utm_term !== '') ||
    utmParams.fbclid
  );
  
  console.log('🔍 UTM Check:', { 
    hasValidUTM, 
    hasEmptyUTMs,
    urlParams: Object.fromEntries(urlParams),
    rawQueryString: window.location.search 
  });
  
  // If we have fbclid but no UTMs, it's likely from Facebook
  if (utmParams.fbclid && !hasValidUTM) {
    const detected = detectTrafficSource();
    console.log('🔍 Facebook click detected without UTMs, applying detection:', detected);
    
    utmParams.utm_source = 'facebook';
    utmParams.utm_medium = 'paid_social';
    utmParams.fb_source = 'facebook_ads';
  }
  // If UTMs exist but are empty, or no valid UTMs found, apply fallback
  else if (hasEmptyUTMs || !hasValidUTM) {
    const detected = detectTrafficSource();
    console.log('🔍 Applying fallback detection:', detected);
    
    // Apply fallback values only for empty fields
    utmParams.utm_source = utmParams.utm_source || detected.source;
    utmParams.utm_medium = utmParams.utm_medium || detected.medium;
    utmParams.fb_source = detected.isSocial ? 'social_fallback' : '';
    
    console.log('🎯 Fallback UTMs applied:', utmParams);
  }

  // Try to persist UTMs from session storage if current ones are empty
  const storedUTMs = getStoredUTMs();
  if (storedUTMs && !hasValidUTM) {
    console.log('📦 Using stored UTMs from previous page:', storedUTMs);
    utmParams = { ...storedUTMs };
  } else if (hasValidUTM) {
    // Store valid UTMs for future use
    storeUTMs(utmParams);
  }

  // Enhanced debugging for UTM tracking
  console.log('🎯 UTM Extraction Final Result:', {
    url: window.location.href,
    searchParams: window.location.search,
    hash: window.location.hash,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    hasOriginalUTMs: hasValidUTM,
    hasEmptyUTMs,
    hasEncodedUrl: urlParams.has('u'),
    extractedUTMs: utmParams,
    detectionSource: detectTrafficSource()
  });

  return utmParams;
};

// Store UTMs in session storage for persistence across page navigation
const storeUTMs = (utms: UTMParams): void => {
  sessionStorage.setItem('stored_utm_params', JSON.stringify(utms));
};

// Get stored UTMs from session storage
const getStoredUTMs = (): UTMParams | null => {
  const stored = sessionStorage.getItem('stored_utm_params');
  return stored ? JSON.parse(stored) : null;
};

// Create initial tracking data
export const createTrackingData = (): TrackingData => {
  const utmParams = extractUTMParams();
  
  return {
    ...utmParams,
    timestamp_acesso: new Date().toISOString(),
    user_agent: navigator.userAgent,
    referrer: document.referrer,
    page_url: window.location.href,
    session_id: generateSessionId(),
  };
};

// Local storage keys
const STORAGE_KEYS = {
  TRACKING_DATA: 'fb_tracking_data',
  FUNNEL_EVENTS: 'fb_funnel_events',
  STEP_START_TIME: 'fb_step_start_time',
  SESSION_START: 'fb_session_start',
} as const;

// Save tracking data to localStorage
export const saveTrackingData = (data: TrackingData): void => {
  localStorage.setItem(STORAGE_KEYS.TRACKING_DATA, JSON.stringify(data));
};

// Get tracking data from localStorage
export const getTrackingData = (): TrackingData | null => {
  const data = localStorage.getItem(STORAGE_KEYS.TRACKING_DATA);
  return data ? JSON.parse(data) : null;
};

// Save funnel events to localStorage
export const saveFunnelEvents = (events: FunnelEvent[]): void => {
  localStorage.setItem(STORAGE_KEYS.FUNNEL_EVENTS, JSON.stringify(events));
};

// Get funnel events from localStorage
export const getFunnelEvents = (): FunnelEvent[] => {
  const events = localStorage.getItem(STORAGE_KEYS.FUNNEL_EVENTS);
  return events ? JSON.parse(events) : [];
};

// Track a new funnel event
export const trackFunnelEvent = (
  eventType: FunnelEventType,
  step: number,
  formData?: any
): void => {
  const trackingData = getTrackingData();
  if (!trackingData) return;

  const currentTime = Date.now();
  const stepStartTime = localStorage.getItem(STORAGE_KEYS.STEP_START_TIME);
  const timeOnStep = stepStartTime ? currentTime - parseInt(stepStartTime) : 0;

  const event: FunnelEvent = {
    event: eventType,
    timestamp: new Date().toISOString(),
    step,
    utm_data: {
      utm_source: trackingData.utm_source,
      utm_medium: trackingData.utm_medium,
      utm_campaign: trackingData.utm_campaign,
      utm_content: trackingData.utm_content,
      utm_term: trackingData.utm_term,
      fbclid: trackingData.fbclid,
      fb_source: trackingData.fb_source,
    },
    form_data: formData,
    time_on_step: timeOnStep,
  };

  const existingEvents = getFunnelEvents();
  const updatedEvents = [...existingEvents, event];
  saveFunnelEvents(updatedEvents);

  // Update step start time for next tracking
  localStorage.setItem(STORAGE_KEYS.STEP_START_TIME, currentTime.toString());

  // Debug log
  console.log(`🎯 Facebook Tracking - ${eventType}:`, event);
};

// Start step timing
export const startStepTiming = (): void => {
  localStorage.setItem(STORAGE_KEYS.STEP_START_TIME, Date.now().toString());
};

// Calculate total session time
export const getTotalSessionTime = (): string => {
  const sessionStart = localStorage.getItem(STORAGE_KEYS.SESSION_START);
  if (!sessionStart) return '0s';

  const totalMs = Date.now() - parseInt(sessionStart);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);

  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

// Initialize session timing
export const initializeSessionTiming = (): void => {
  if (!localStorage.getItem(STORAGE_KEYS.SESSION_START)) {
    localStorage.setItem(STORAGE_KEYS.SESSION_START, Date.now().toString());
  }
};

// Clear all tracking data (for new session)
export const clearTrackingData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  sessionStorage.removeItem('stored_utm_params');
};

// Form data backup functions
export const saveFormDataBackup = (formData: any): void => {
  localStorage.setItem('form_data_backup', JSON.stringify(formData));
};

export const getFormDataBackup = (): any => {
  const data = localStorage.getItem('form_data_backup');
  return data ? JSON.parse(data) : null;
};

export const clearFormDataBackup = (): void => {
  localStorage.removeItem('form_data_backup');
};

// Debug: Get all tracking data
export const getFullTrackingData = () => {
  return {
    tracking_data: getTrackingData(),
    funnel_events: getFunnelEvents(),
    total_session_time: getTotalSessionTime(),
    stored_utms: getStoredUTMs(),
    current_url: window.location.href,
    referrer: document.referrer,
  };
};

// Format tracking data for submission
export const formatTrackingForSubmission = (leadData: any, finalAction: 'redirect_to_site' | 'success_page' = 'success_page') => {
  const trackingData = getTrackingData();
  const funnelEvents = getFunnelEvents();
  
  if (!trackingData) return null;

  return {
    lead_data: leadData,
    tracking_data: trackingData,
    funnel_events: funnelEvents,
    conversion_data: {
      total_time: getTotalSessionTime(),
      completed_steps: funnelEvents.filter(e => e.event.startsWith('step_')).length,
      final_action: finalAction,
      conversion_value: leadData.precoTratamento || '',
    },
  };
};

// Manual UTM override function (useful for testing)
export const overrideUTMParams = (params: Partial<UTMParams>): void => {
  const currentData = getTrackingData();
  if (currentData) {
    const updatedData = {
      ...currentData,
      ...params,
    };
    saveTrackingData(updatedData);
    storeUTMs(updatedData);
    console.log('🔧 UTM params manually overridden:', params);
  }
};

// Function to handle Facebook redirect URLs
export const processFacebookRedirect = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  const encodedUrl = urlParams.get('u');
  
  if (encodedUrl) {
    try {
      // Decode and redirect to the actual URL
      const decodedUrl = decodeURIComponent(encodedUrl);
      console.log('🔄 Processing Facebook redirect to:', decodedUrl);
      
      // Extract parameters before redirect
      const url = new URL(decodedUrl);
      const fbclid = url.searchParams.get('fbclid');
      
      // Store Facebook tracking info before redirect
      if (fbclid) {
        const fbTrackingData = {
          utm_source: 'facebook',
          utm_medium: 'paid_social',
          utm_campaign: urlParams.get('utm_campaign') || 'facebook_ads',
          fbclid: fbclid,
          fb_source: 'facebook_redirect',
        };
        
        // Store in session storage to persist after redirect
        sessionStorage.setItem('fb_redirect_tracking', JSON.stringify(fbTrackingData));
      }
      
      // Redirect to the decoded URL
      window.location.href = decodedUrl;
      return true;
    } catch (error) {
      console.error('Error processing Facebook redirect:', error);
    }
  }
  
  return false;
};

// Check for stored Facebook redirect data
const checkStoredFacebookData = (): Partial<UTMParams> | null => {
  const stored = sessionStorage.getItem('fb_redirect_tracking');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      // Clear after reading
      sessionStorage.removeItem('fb_redirect_tracking');
      return data;
    } catch (error) {
      console.error('Error parsing stored Facebook data:', error);
    }
  }
  return null;
};
