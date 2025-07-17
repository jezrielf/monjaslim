import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FacebookConversionRequest {
  lead_id: string;
  fbclid?: string;
  fb_campaign_id?: string;
  fb_adset_id?: string;
  fb_ad_id?: string;
  event_name: 'Lead' | 'Purchase' | 'CompleteRegistration';
  value?: number;
  currency?: string;
  user_data: {
    email?: string;
    phone?: string;
    first_name?: string;
    city?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const conversionData: FacebookConversionRequest = await req.json();
      
      const ACCESS_TOKEN = Deno.env.get('FACEBOOK_ACCESS_TOKEN');
      const PIXEL_ID = Deno.env.get('FACEBOOK_PIXEL_ID');

      if (!ACCESS_TOKEN || !PIXEL_ID) {
        throw new Error('Facebook Conversions API credentials not configured');
      }

      console.log('Sending conversion to Facebook:', conversionData.event_name);

      // Build conversion payload for Facebook Conversions API
      const eventTime = Math.floor(Date.now() / 1000);
      const eventId = `${conversionData.lead_id}_${eventTime}`;
      
      const payload = {
        data: [{
          event_name: conversionData.event_name,
          event_time: eventTime,
          event_id: eventId,
          action_source: 'website',
          event_source_url: conversionData.fbclid ? 
            `https://app.exemplo.com?fbclid=${conversionData.fbclid}` : 
            'https://app.exemplo.com',
          user_data: {
            em: conversionData.user_data.email ? 
              await crypto.subtle.digest('SHA-256', new TextEncoder().encode(conversionData.user_data.email.toLowerCase())) : 
              undefined,
            ph: conversionData.user_data.phone ? 
              await crypto.subtle.digest('SHA-256', new TextEncoder().encode(conversionData.user_data.phone.replace(/\D/g, ''))) : 
              undefined,
            fn: conversionData.user_data.first_name ? 
              await crypto.subtle.digest('SHA-256', new TextEncoder().encode(conversionData.user_data.first_name.toLowerCase())) : 
              undefined,
            ct: conversionData.user_data.city ? 
              await crypto.subtle.digest('SHA-256', new TextEncoder().encode(conversionData.user_data.city.toLowerCase())) : 
              undefined,
            fbp: conversionData.fbclid,
            fbc: conversionData.fbclid ? `fb.1.${eventTime}.${conversionData.fbclid}` : undefined
          },
          custom_data: {
            value: conversionData.value,
            currency: conversionData.currency || 'BRL',
            content_name: conversionData.event_name,
            campaign_id: conversionData.fb_campaign_id,
            adset_id: conversionData.fb_adset_id,
            ad_id: conversionData.fb_ad_id
          }
        }],
        access_token: ACCESS_TOKEN
      };

      // Remove undefined values
      payload.data[0].user_data = Object.fromEntries(
        Object.entries(payload.data[0].user_data).filter(([_, v]) => v !== undefined)
      );
      payload.data[0].custom_data = Object.fromEntries(
        Object.entries(payload.data[0].custom_data).filter(([_, v]) => v !== undefined)
      );

      const url = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;

      console.log('Facebook Conversions API URL:', url);
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Facebook Conversions API Error:', data);
        throw new Error(`Facebook Conversions API Error: ${data.error?.message || 'Unknown error'}`);
      }

      console.log('Conversion sent successfully:', data);

      // Save conversion log to database
      const { error: insertError } = await supabase
        .from('facebook_conversions')
        .insert({
          lead_id: conversionData.lead_id,
          event_name: conversionData.event_name,
          event_id: eventId,
          facebook_response: data,
          sent_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          event_id: eventId,
          facebook_response: data,
          message: 'Conversion sent to Facebook successfully' 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  } catch (error: any) {
    console.error('Error in facebook-conversions function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);