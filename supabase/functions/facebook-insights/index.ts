import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FacebookInsightsRequest {
  campaign_ids?: string[];
  adset_ids?: string[];
  ad_ids?: string[];
  date_preset?: string;
}

interface FacebookInsight {
  campaign_id: string;
  campaign_name: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  impressions: number;
  clicks: number;
  spend: number;
  cpm: number;
  cpc: number;
  ctr: number;
  date_start: string;
  date_stop: string;
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
      // Sync Facebook data
      const { campaign_ids, adset_ids, ad_ids, date_preset = 'last_30d' }: FacebookInsightsRequest = await req.json();
      
      const ACCESS_TOKEN = Deno.env.get('FACEBOOK_ACCESS_TOKEN');
      const AD_ACCOUNT_ID = Deno.env.get('FACEBOOK_AD_ACCOUNT_ID');

      if (!ACCESS_TOKEN || !AD_ACCOUNT_ID) {
        throw new Error('Facebook credentials not configured');
      }

      console.log('Fetching Facebook insights...');
      
      // Build insights query
      let level = 'campaign';
      let ids = campaign_ids;
      
      if (ad_ids && ad_ids.length > 0) {
        level = 'ad';
        ids = ad_ids;
      } else if (adset_ids && adset_ids.length > 0) {
        level = 'adset';
        ids = adset_ids;
      }

      const fields = [
        'campaign_id',
        'campaign_name',
        'adset_id',
        'adset_name', 
        'ad_id',
        'ad_name',
        'impressions',
        'clicks',
        'spend',
        'cpm',
        'cpc',
        'ctr'
      ].join(',');

      const url = `https://graph.facebook.com/v19.0/act_${AD_ACCOUNT_ID}/insights?` +
        `fields=${fields}&` +
        `level=${level}&` +
        `date_preset=${date_preset}&` +
        `access_token=${ACCESS_TOKEN}`;

      console.log('Facebook API URL:', url.replace(ACCESS_TOKEN, '[REDACTED]'));

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        console.error('Facebook API Error:', data);
        throw new Error(`Facebook API Error: ${data.error?.message || 'Unknown error'}`);
      }

      console.log(`Fetched ${data.data?.length || 0} insights from Facebook`);

      // Transform and save data
      const insights: FacebookInsight[] = (data.data || []).map((item: any) => ({
        campaign_id: item.campaign_id,
        campaign_name: item.campaign_name,
        adset_id: item.adset_id || null,
        adset_name: item.adset_name || null,
        ad_id: item.ad_id || null,
        ad_name: item.ad_name || null,
        impressions: parseInt(item.impressions || '0'),
        clicks: parseInt(item.clicks || '0'),
        spend: parseFloat(item.spend || '0'),
        cpm: parseFloat(item.cpm || '0'),
        cpc: parseFloat(item.cpc || '0'),
        ctr: parseFloat(item.ctr || '0'),
        date_start: item.date_start || new Date().toISOString().split('T')[0],
        date_stop: item.date_stop || new Date().toISOString().split('T')[0],
      }));

      // Save to database
      if (insights.length > 0) {
        const { error: insertError } = await supabase
          .from('facebook_insights')
          .upsert(insights, { 
            onConflict: 'campaign_id,adset_id,ad_id,date_start',
            ignoreDuplicates: false 
          });

        if (insertError) {
          console.error('Database insert error:', insertError);
          throw insertError;
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          insights_count: insights.length,
          message: 'Facebook insights synced successfully' 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );

    } else if (req.method === 'GET') {
      // Get stored insights
      const url = new URL(req.url);
      const campaign_id = url.searchParams.get('campaign_id');
      const adset_id = url.searchParams.get('adset_id');
      const ad_id = url.searchParams.get('ad_id');
      const limit = parseInt(url.searchParams.get('limit') || '100');

      let query = supabase
        .from('facebook_insights')
        .select('*')
        .order('date_start', { ascending: false })
        .limit(limit);

      if (campaign_id) {
        query = query.eq('campaign_id', campaign_id);
      }
      if (adset_id) {
        query = query.eq('adset_id', adset_id);
      }
      if (ad_id) {
        query = query.eq('ad_id', ad_id);
      }

      const { data: insights, error } = await query;

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ insights }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  } catch (error: any) {
    console.error('Error in facebook-insights function:', error);
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