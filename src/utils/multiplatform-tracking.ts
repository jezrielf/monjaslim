// Multi-platform tracking for UTMify, Facebook Pixel, Google Analytics, and GTM
declare global {
  interface Window {
    utmify: {
      track: (eventName: string, properties?: Record<string, any>) => void;
    };
    fbq: (action: string, event: string, properties?: Record<string, any>) => void;
    gtag: (action: string, event: string, properties?: Record<string, any>) => void;
    dataLayer: any[];
    pixelId: string;
    utmifyLoaded: boolean;
  }
}

export interface ConversionData {
  value: number;
  currency: string;
  treatment_type: string;
  purchase_mode: string;
  treatment_value: string;
  lead_id: string;
}

// Universal Purchase Conversion Tracking
export const trackPurchaseConversion = (data: ConversionData) => {
  console.log('🎯 Starting multi-platform Purchase conversion tracking...', data);

  const conversionData = {
    value: data.value,
    currency: data.currency,
    content_name: `MonjaSlim - ${data.treatment_type}`,
    content_category: 'Tratamento',
    content_type: 'product'
  };

  // 1. Facebook Pixel
  try {
    if (typeof window.fbq !== 'undefined') {
      window.fbq('track', 'Purchase', {
        value: conversionData.value,
        currency: conversionData.currency,
        content_name: conversionData.content_name,
        content_category: conversionData.content_category,
        content_type: conversionData.content_type
      });
      console.log('✅ Facebook Pixel Purchase event sent');
    } else {
      console.log('ℹ️ Facebook Pixel not available');
    }
  } catch (error) {
    console.error('❌ Facebook Pixel error:', error);
  }

  // 2. UTMify
  try {
    if (typeof window.utmify !== 'undefined' && typeof window.utmify.track === 'function') {
      window.utmify.track('purchase', {
        value: conversionData.value,
        currency: conversionData.currency,
        product_name: conversionData.content_name,
        category: conversionData.content_category,
        treatment_type: data.treatment_type,
        purchase_mode: data.purchase_mode
      });
      console.log('✅ UTMify Purchase event sent');
    } else {
      console.log('ℹ️ UTMify not available');
    }
  } catch (error) {
    console.error('❌ UTMify error:', error);
  }

  // 3. Google Analytics
  try {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'purchase', {
        value: conversionData.value,
        currency: conversionData.currency,
        items: [{
          item_name: conversionData.content_name,
          item_category: conversionData.content_category,
          price: conversionData.value,
          quantity: 1
        }]
      });
      console.log('✅ Google Analytics Purchase event sent');
    } else {
      console.log('ℹ️ Google Analytics not available');
    }
  } catch (error) {
    console.error('❌ Google Analytics error:', error);
  }

  // 4. Google Tag Manager
  try {
    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push({
        'event': 'purchase',
        'ecommerce': {
          'value': conversionData.value,
          'currency': conversionData.currency,
          'items': [{
            'item_name': conversionData.content_name,
            'item_category': conversionData.content_category,
            'price': conversionData.value,
            'quantity': 1
          }]
        },
        'custom_data': {
          'treatment_type': data.treatment_type,
          'purchase_mode': data.purchase_mode,
          'treatment_value': data.treatment_value,
          'lead_id': data.lead_id
        }
      });
      console.log('✅ GTM Purchase event sent');
    } else {
      console.log('ℹ️ GTM dataLayer not available');
    }
  } catch (error) {
    console.error('❌ GTM error:', error);
  }

  console.log('🎉 Multi-platform Purchase tracking completed');
};