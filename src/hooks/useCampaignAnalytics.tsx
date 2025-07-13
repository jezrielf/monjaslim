import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CampaignData {
  utm_source: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  total_leads: number;
  conversions: number;
  conversion_rate: number;
  avg_time_seconds: number;
}

export interface KPIData {
  total_leads: number;
  total_conversions: number;
  overall_conversion_rate: number;
  avg_funnel_time: number;
  site_oficial_count: number;
  pagar_entrega_count: number;
}

export interface TimeSeriesData {
  date: string;
  leads: number;
  conversions: number;
}

export const useCampaignAnalytics = (dateRange: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ["campaign-analytics", dateRange],
    queryFn: async () => {
      const fromDate = dateRange.from.toISOString();
      const toDate = dateRange.to.toISOString();

      // Campaign performance query
      const { data: campaignData, error: campaignError } = await supabase
        .from("leads")
        .select("utm_source, utm_campaign, utm_medium, utm_content, utm_term, aceite_final, total_time_seconds")
        .gte("created_at", fromDate)
        .lte("created_at", toDate);

      if (campaignError) throw campaignError;

      // KPI aggregation query
      const { data: kpiData, error: kpiError } = await supabase
        .from("leads")
        .select("aceite_final, total_time_seconds, modalidade_compra")
        .gte("created_at", fromDate)
        .lte("created_at", toDate);

      if (kpiError) throw kpiError;

      // Time series query
      const { data: timeSeriesData, error: timeSeriesError } = await supabase
        .from("leads")
        .select("created_at, aceite_final")
        .gte("created_at", fromDate)
        .lte("created_at", toDate)
        .order("created_at");

      if (timeSeriesError) throw timeSeriesError;

      // Process campaign data with Facebook-specific handling
      const campaignMap = new Map<string, any>();
      const facebookCampaigns = new Map<string, any>();
      
      campaignData?.forEach((lead) => {
        // Check if this is Facebook traffic (novo formato: utm_source=FB)
        const isFacebookLead = lead.utm_source === 'FB' || lead.utm_source === 'facebook';
        
        if (isFacebookLead) {
          // Handle Facebook campaigns separately for better grouping (novo formato com nome|id)
          const campaignName = lead.utm_campaign?.split('|')[0] || 'Sem_Campanha';
          const adsetName = lead.utm_medium?.split('|')[0] || 'Sem_Adset';
          const adName = lead.utm_content?.split('|')[0] || 'Sem_Anuncio';
          const placement = lead.utm_term || 'Sem_Placement';
          
          const fbKey = `${campaignName}-${adsetName}-${adName}-${placement}`;
          if (!facebookCampaigns.has(fbKey)) {
            facebookCampaigns.set(fbKey, {
              utm_source: 'Facebook',
              utm_campaign: campaignName,
              utm_medium: adsetName, // Novo: agora mostra o adset
              utm_content: adName,
              utm_term: placement,
              campaign_id: lead.utm_campaign?.split('|')[1] || null,
              adset_id: lead.utm_medium?.split('|')[1] || null,
              ad_id: lead.utm_content?.split('|')[1] || null,
              total_leads: 0,
              conversions: 0,
              total_time: 0,
            });
          }
          const fbCampaign = facebookCampaigns.get(fbKey);
          fbCampaign.total_leads++;
          if (lead.aceite_final) fbCampaign.conversions++;
          if (lead.total_time_seconds) fbCampaign.total_time += lead.total_time_seconds;
        } else {
          // Handle other sources
          const key = `${lead.utm_source || 'Direto'}-${lead.utm_campaign || 'Sem_Campanha'}-${lead.utm_content || 'Sem_Conteudo'}-${lead.utm_term || 'Sem_Termo'}`;
          if (!campaignMap.has(key)) {
            campaignMap.set(key, {
              utm_source: lead.utm_source || 'Direto',
              utm_campaign: lead.utm_campaign || 'Sem Campanha',
              utm_content: lead.utm_content || 'Sem Conteúdo',
              utm_term: lead.utm_term || 'Sem Termo',
              total_leads: 0,
              conversions: 0,
              total_time: 0,
            });
          }
          const campaign = campaignMap.get(key);
          campaign.total_leads++;
          if (lead.aceite_final) campaign.conversions++;
          if (lead.total_time_seconds) campaign.total_time += lead.total_time_seconds;
        }
      });

      // Combine Facebook and other campaigns
      const allCampaigns = [...Array.from(campaignMap.values()), ...Array.from(facebookCampaigns.values())];
      
      const processedCampaigns: CampaignData[] = allCampaigns.map(campaign => ({
        ...campaign,
        conversion_rate: campaign.total_leads > 0 ? (campaign.conversions / campaign.total_leads) * 100 : 0,
        avg_time_seconds: campaign.total_leads > 0 ? campaign.total_time / campaign.total_leads : 0,
      })).sort((a, b) => {
        // Sort Facebook campaigns first, then by total leads
        if (a.utm_source === 'Facebook' && b.utm_source !== 'Facebook') return -1;
        if (b.utm_source === 'Facebook' && a.utm_source !== 'Facebook') return 1;
        return b.total_leads - a.total_leads;
      });

      // Process KPIs
      const kpis: KPIData = {
        total_leads: kpiData?.length || 0,
        total_conversions: kpiData?.filter(lead => lead.aceite_final).length || 0,
        overall_conversion_rate: kpiData?.length > 0 
          ? ((kpiData.filter(lead => lead.aceite_final).length / kpiData.length) * 100) 
          : 0,
        avg_funnel_time: kpiData?.length > 0 
          ? (kpiData.reduce((sum, lead) => sum + (lead.total_time_seconds || 0), 0) / kpiData.length)
          : 0,
        site_oficial_count: kpiData?.filter(lead => lead.modalidade_compra === 'site-sedex').length || 0,
        pagar_entrega_count: kpiData?.filter(lead => lead.modalidade_compra === 'pagar-entrega').length || 0,
      };

      // Process time series
      const timeSeriesMap = new Map<string, { leads: number; conversions: number }>();
      timeSeriesData?.forEach((lead) => {
        const date = new Date(lead.created_at).toISOString().split('T')[0];
        if (!timeSeriesMap.has(date)) {
          timeSeriesMap.set(date, { leads: 0, conversions: 0 });
        }
        const day = timeSeriesMap.get(date)!;
        day.leads++;
        if (lead.aceite_final) day.conversions++;
      });

      const timeSeries: TimeSeriesData[] = Array.from(timeSeriesMap.entries()).map(([date, data]) => ({
        date,
        ...data,
      })).sort((a, b) => a.date.localeCompare(b.date));

      return {
        campaigns: processedCampaigns,
        kpis,
        timeSeries,
      };
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });
};