import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export const useFacebookInsights = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const syncFacebookData = async (options?: {
    campaign_ids?: string[];
    adset_ids?: string[];
    ad_ids?: string[];
    date_preset?: string;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('facebook-insights', {
        body: {
          campaign_ids: options?.campaign_ids,
          adset_ids: options?.adset_ids,
          ad_ids: options?.ad_ids,
          date_preset: options?.date_preset || 'last_30d'
        }
      });

      if (error) throw error;

      toast({
        title: "Dados do Facebook sincronizados!",
        description: `${data.insights_count} métricas atualizadas com sucesso.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error syncing Facebook data:', error);
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível sincronizar os dados do Facebook.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getFacebookInsights = async (filters?: {
    campaign_id?: string;
    adset_id?: string;
    ad_id?: string;
    limit?: number;
  }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.campaign_id) params.append('campaign_id', filters.campaign_id);
      if (filters?.adset_id) params.append('adset_id', filters.adset_id);
      if (filters?.ad_id) params.append('ad_id', filters.ad_id);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const { data, error } = await supabase.functions.invoke('facebook-insights', {
        method: 'GET',
        body: null
      });

      if (error) throw error;

      return data.insights as FacebookInsight[];
    } catch (error: any) {
      console.error('Error fetching Facebook insights:', error);
      toast({
        title: "Erro ao buscar insights",
        description: error.message || "Não foi possível buscar os dados do Facebook.",
        variant: "destructive",
      });
      return [];
    }
  };

  // Get Facebook data for specific leads based on their UTM data
  const getLeadInsights = async (leads: any[]) => {
    const facebookLeads = leads.filter(lead => 
      lead.utm_source === 'facebook' || 
      lead.fb_campaign_id || 
      lead.fb_adset_id || 
      lead.fb_ad_id
    );

    const campaignIds = [...new Set(facebookLeads
      .map(lead => lead.fb_campaign_id)
      .filter(Boolean)
    )];

    const adsetIds = [...new Set(facebookLeads
      .map(lead => lead.fb_adset_id)
      .filter(Boolean)
    )];

    const adIds = [...new Set(facebookLeads
      .map(lead => lead.fb_ad_id)
      .filter(Boolean)
    )];

    // Sync data for relevant campaigns/adsets/ads
    if (campaignIds.length > 0 || adsetIds.length > 0 || adIds.length > 0) {
      await syncFacebookData({
        campaign_ids: campaignIds,
        adset_ids: adsetIds,
        ad_ids: adIds
      });
    }

    // Get insights data
    const insights = await getFacebookInsights();
    
    // Match insights with leads
    return facebookLeads.map(lead => {
      const matchingInsight = insights.find(insight => 
        (lead.fb_campaign_id && insight.campaign_id === lead.fb_campaign_id) ||
        (lead.fb_adset_id && insight.adset_id === lead.fb_adset_id) ||
        (lead.fb_ad_id && insight.ad_id === lead.fb_ad_id)
      );

      return {
        ...lead,
        facebook_insight: matchingInsight
      };
    });
  };

  return {
    syncFacebookData,
    getFacebookInsights,
    getLeadInsights,
    loading
  };
};