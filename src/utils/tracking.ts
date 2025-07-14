import { UTMParams, TrackingData, FunnelEvent, FunnelEventType } from '@/types/tracking';

// Generate unique session ID
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Detect traffic source from user agent and referrer
export const detectTrafficSource = (): { source: string; medium: string; isSocial: boolean } => {
  const userAgent = navigator.userAgent.toLowerCase();
  const referrer = document.referrer.toLowerCase();

  // Facebook/Instagram detection via user agent
  if (userAgent.includes('fban') || userAgent.includes('fbav')) {
    return { source: 'facebook', medium: 'mobile_app', isSocial: true };
  }
  
  if (userAgent.includes('instagram')) {
    return { source: 'instagram', medium: 'mobile_app', isSocial: true };
  }

  // Facebook/Instagram detection via referrer
  if (referrer.includes('facebook.com') || referrer.includes('m.facebook.com')) {
    return { source: 'facebook', medium: 'referral', isSocial: true };
  }
  
  if (referrer.includes('instagram.com')) {
    return { source: 'instagram', medium: 'referral', isSocial: true };
  }

  // Other social platforms
  if (referrer.includes('t.co') || referrer.includes('twitter.com')) {
    return { source: 'twitter', medium: 'referral', isSocial: true };
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

// Extract UTM parameters from URL with fallback detection
export const extractUTMParams = (): UTMParams => {
  const urlParams = new URLSearchParams(window.location.search);
  
  let utmParams = {
    utm_source: urlParams.get('utm_source') || '',
    utm_medium: urlParams.get('utm_medium') || '',
    utm_campaign: urlParams.get('utm_campaign') || '',
    utm_content: urlParams.get('utm_content') || '',
    utm_term: urlParams.get('utm_term') || '',
    fbclid: urlParams.get('fbclid') || '',
    fb_source: urlParams.get('fb_source') || '',
  };

  // If no UTMs found, apply fallback detection
  const hasAnyUTM = Object.values(utmParams).some(value => value !== '');
  
  if (!hasAnyUTM) {
    const detected = detectTrafficSource();
    console.log('🔍 Fallback detection applied:', detected);
    
    utmParams = {
      ...utmParams,
      utm_source: detected.source,
      utm_medium: detected.medium,
      fb_source: detected.isSocial ? 'social_fallback' : '',
    };
  }

  // Enhanced debugging for Facebook UTMs
  console.log('🎯 Facebook UTM Extraction:', {
    url: window.location.href,
    searchParams: window.location.search,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    extractedUTMs: utmParams,
    hasFBUTMs: utmParams.utm_source === 'FB' || utmParams.utm_source === 'facebook',
    fbclid: utmParams.fbclid,
    detectedSocial: detectTrafficSource()
  });

  return utmParams;
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