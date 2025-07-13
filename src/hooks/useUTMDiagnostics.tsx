import { useEffect, useState } from 'react';
import { getTrackingData, extractUTMParams } from '@/utils/tracking';
import { supabase } from '@/integrations/supabase/client';

interface UTMDiagnostics {
  hasCurrentUTMs: boolean;
  utmCount: number;
  isFacebookTraffic: boolean;
  missingParameters: string[];
  sessionHasTracking: boolean;
  databaseConnection: boolean;
  recentLeadsWithoutUTMs: number;
}

export const useUTMDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<UTMDiagnostics>({
    hasCurrentUTMs: false,
    utmCount: 0,
    isFacebookTraffic: false,
    missingParameters: [],
    sessionHasTracking: false,
    databaseConnection: false,
    recentLeadsWithoutUTMs: 0
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        // Current URL UTMs
        const currentUTMs = extractUTMParams();
        const utmValues = Object.values(currentUTMs).filter(v => v);
        const hasUTMs = utmValues.length > 0;
        const isFacebook = currentUTMs.utm_source === 'facebook';

        // Missing Facebook parameters
        const expectedFacebookParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
        const missingParams = expectedFacebookParams.filter(param => !currentUTMs[param as keyof typeof currentUTMs]);

        // Session tracking
        const trackingData = getTrackingData();
        const hasTracking = !!trackingData;

        // Database check - recent leads without UTMs
        const { data: recentLeads, error } = await supabase
          .from('leads')
          .select('utm_source, utm_campaign, created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        const leadsWithoutUTMs = recentLeads?.filter(lead => 
          !lead.utm_source || !lead.utm_campaign
        ).length || 0;

        setDiagnostics({
          hasCurrentUTMs: hasUTMs,
          utmCount: utmValues.length,
          isFacebookTraffic: isFacebook,
          missingParameters: missingParams,
          sessionHasTracking: hasTracking,
          databaseConnection: !error,
          recentLeadsWithoutUTMs: leadsWithoutUTMs
        });

        // Detailed logging for debugging
        console.log('🔍 UTM Diagnostics:', {
          url: window.location.href,
          currentUTMs,
          hasUTMs,
          isFacebook,
          missingParams,
          trackingData,
          recentLeadsCount: recentLeads?.length,
          leadsWithoutUTMs
        });

      } catch (error) {
        console.error('Error running UTM diagnostics:', error);
      }
    };

    runDiagnostics();
  }, []);

  return diagnostics;
};