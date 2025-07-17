// UTM Parameter tracking utility
export interface UTMParams {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  fbclid?: string | null;
  fb_campaign_id?: string | null;
  fb_ad_id?: string | null;
  fb_adset_id?: string | null;
}

export interface TrackingData extends UTMParams {
  referrer?: string;
  page_url?: string;
  user_agent?: string;
  session_id?: string;
  timestamp?: string;
}

// Generate unique session ID
const generateSessionId = (): string => {
  return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Extract Facebook IDs from UTM parameters
const extractFacebookIDs = (utmData: UTMParams) => {
  const extractIdFromString = (str: string | null, idPattern: RegExp): string | null => {
    if (!str) return null;
    const match = str.match(idPattern);
    return match ? match[1] : null;
  };

  // Extract IDs from utm_campaign, utm_content, utm_term if they follow the pattern: name_id
  const fb_campaign_id = extractIdFromString(utmData.utm_campaign, /_(\d+)$/) || utmData.fb_campaign_id;
  const fb_adset_id = extractIdFromString(utmData.utm_content, /_(\d+)$/) || utmData.fb_adset_id;
  const fb_ad_id = extractIdFromString(utmData.utm_term, /_(\d+)$/) || utmData.fb_ad_id;

  return {
    fb_campaign_id,
    fb_adset_id,
    fb_ad_id,
  };
};

// Extract UTM parameters from URL with enhanced Facebook tracking
export const extractUTMFromURL = (search: string = window.location.search): UTMParams => {
  const params = new URLSearchParams(search);
  
  const basicUTMs = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
    fbclid: params.get('fbclid'),
    fb_campaign_id: params.get('fb_campaign_id'),
    fb_ad_id: params.get('fb_ad_id'),
    fb_adset_id: params.get('fb_adset_id'),
  };

  // Extract Facebook IDs from UTM strings if not directly provided
  const facebookIDs = extractFacebookIDs(basicUTMs);

  return {
    ...basicUTMs,
    ...facebookIDs,
  };
};

// Get comprehensive tracking data
export const getTrackingData = (): TrackingData => {
  const utm = extractUTMFromURL();
  
  return {
    ...utm,
    referrer: document.referrer || null,
    page_url: window.location.href,
    user_agent: navigator.userAgent,
    session_id: getOrCreateSessionId(),
    timestamp: new Date().toISOString(),
  };
};

// Session management
export const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem('tracking_session_id');
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('tracking_session_id', sessionId);
  }
  
  return sessionId;
};

// Store UTM data in localStorage
export const storeUTMData = (utmData: UTMParams): void => {
  localStorage.setItem('utm_data', JSON.stringify(utmData));
  localStorage.setItem('utm_captured_at', new Date().toISOString());
};

// Retrieve stored UTM data
export const getStoredUTMData = (): UTMParams | null => {
  const stored = localStorage.getItem('utm_data');
  return stored ? JSON.parse(stored) : null;
};

// Check if UTM data exists in current URL or storage
export const hasUTMData = (): boolean => {
  const urlUTM = extractUTMFromURL();
  const storedUTM = getStoredUTMData();
  
  const hasUrlUTM = Object.values(urlUTM).some(value => value !== null);
  const hasStoredUTM = storedUTM && Object.values(storedUTM).some(value => value !== null);
  
  return hasUrlUTM || hasStoredUTM;
};

// Get current UTM data (prioritize URL over stored)
export const getCurrentUTMData = (): UTMParams => {
  const urlUTM = extractUTMFromURL();
  const hasUrlUTM = Object.values(urlUTM).some(value => value !== null);
  
  if (hasUrlUTM) {
    storeUTMData(urlUTM);
    return urlUTM;
  }
  
  return getStoredUTMData() || {};
};

// Clear stored UTM data
export const clearUTMData = (): void => {
  localStorage.removeItem('utm_data');
  localStorage.removeItem('utm_captured_at');
};