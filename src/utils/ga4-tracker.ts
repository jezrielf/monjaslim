
import ReactGA from 'react-ga4';

// GA4 Configuration
export const GA4_MEASUREMENT_ID = 'G-J64W8RNLD6';

// Initialize GA4
export const initializeGA4 = () => {
  ReactGA.initialize(GA4_MEASUREMENT_ID, {
    testMode: process.env.NODE_ENV === 'development',
  });
};

// Custom events for our funnel
export const trackFunnelStep = (stepName: string, stepNumber: number, formData: any, utmData: any) => {
  ReactGA.event({
    action: 'funnel_step_completed',
    category: 'lead_generation',
    label: stepName,
    value: stepNumber,
  });

  // Send additional parameters via gtag
  ReactGA.gtag('event', 'funnel_step_completed', {
    event_category: 'lead_generation',
    event_label: stepName,
    value: stepNumber,
    step_name: stepName,
    step_number: stepNumber,
    purchase_method: formData.modalidadeCompra || '',
    treatment_type: formData.tipoTratamento || '',
    treatment_price: formData.precoTratamento || '',
    utm_source: utmData.utm_source || '',
    utm_medium: utmData.utm_medium || '',
    utm_campaign: utmData.utm_campaign || '',
    utm_content: utmData.utm_content || '',
    utm_term: utmData.utm_term || '',
    session_id: utmData.session_id || '',
  });
};

// Track lead generation
export const trackLeadGenerated = (leadData: any, utmData: any) => {
  ReactGA.event({
    action: 'generate_lead',
    category: 'lead_generation',
    label: 'form_completed',
    value: 1,
  });

  // Send additional parameters via gtag
  ReactGA.gtag('event', 'generate_lead', {
    event_category: 'lead_generation',
    event_label: 'form_completed',
    value: 1,
    lead_name: leadData.nome || '',
    lead_email: leadData.email || '',
    lead_city: leadData.cidade || '',
    purchase_method: leadData.modalidadeCompra || '',
    treatment_type: leadData.tipoTratamento || '',
    treatment_price: leadData.precoTratamento || '',
    utm_source: utmData.utm_source || '',
    utm_medium: utmData.utm_medium || '',
    utm_campaign: utmData.utm_campaign || '',
    utm_content: utmData.utm_content || '',
    utm_term: utmData.utm_term || '',
  });
};

// Track conversion (aceite final)
export const trackConversion = (leadData: any, utmData: any) => {
  const conversionValue = getConversionValue(leadData.precoTratamento);
  
  ReactGA.event({
    action: 'purchase',
    category: 'ecommerce',
    label: leadData.tipoTratamento,
    value: conversionValue,
  });

  // Enhanced Ecommerce Purchase Event
  ReactGA.gtag('event', 'purchase', {
    transaction_id: `lead_${Date.now()}`,
    value: conversionValue,
    currency: 'BRL',
    items: [{
      item_id: leadData.tipoTratamento,
      item_name: leadData.tipoTratamento,
      category: 'treatment',
      quantity: 1,
      price: conversionValue,
    }]
  });
};

// Helper to convert treatment price to numeric value
const getConversionValue = (priceString: string): number => {
  const priceMap: Record<string, number> = {
    '1-pote': 197,
    '2-potes': 347,
    '3-potes': 447,
    '5-potes': 647,
  };
  
  return priceMap[priceString] || 0;
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  ReactGA.send({ 
    hitType: 'pageview', 
    page: path,
    title: title || document.title 
  });
};

// Track timing events (time spent on steps)
export const trackTiming = (category: string, variable: string, value: number, label?: string) => {
  ReactGA.gtag('event', 'timing_complete', {
    name: variable,
    value: value,
    event_category: category,
    event_label: label,
  });
};
