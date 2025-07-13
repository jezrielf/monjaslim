import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RealtimeActivity {
  step_number: number;
  event_type: string;
  active_users: number;
  modalidade_compra: string;
  avg_time_current: number;
  timestamp: string;
}

interface OnlineUser {
  lead_id: string;
  step_number: number;
  event_type: string;
  modalidade_compra: string;
  timestamp: string;
}

interface RealtimeData {
  totalOnline: number;
  usersByStep: Map<number, number>;
  usersByModality: Map<string, number>;
  recentActivity: OnlineUser[];
  stepActivity: RealtimeActivity[];
  lastActivity: string | null;
  isUsingFallback: boolean;
}

export const useRealtimeTracking = () => {
  const [realtimeData, setRealtimeData] = useState<RealtimeData>({
    totalOnline: 0,
    usersByStep: new Map(),
    usersByModality: new Map(),
    recentActivity: [],
    stepActivity: [],
    lastActivity: null,
    isUsingFallback: false
  });
  const [isConnected, setIsConnected] = useState(false);

  const fetchCurrentActivity = async () => {
    try {
      // Buscar usuários ativos nos últimos 30 minutos
      const { data: activeUsers, error } = await supabase
        .from('funnel_events')
        .select(`
          lead_id,
          step_number,
          event_type,
          timestamp,
          leads!inner(modalidade_compra)
        `)
        .gte('timestamp', new Date(Date.now() - 30 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      // Se não há atividade recente, buscar dos últimos 24h como fallback
      let fallbackData = null;
      if (!activeUsers || activeUsers.length === 0) {
        const { data: fallback } = await supabase
          .from('funnel_events')
          .select(`
            lead_id,
            step_number,
            event_type,
            timestamp,
            leads!inner(modalidade_compra)
          `)
          .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('timestamp', { ascending: false })
          .limit(20);
        
        fallbackData = fallback;
      }

      if (error) throw error;

      // Usar dados ativos ou fallback
      const dataToProcess = activeUsers && activeUsers.length > 0 ? activeUsers : fallbackData;
      const isUsingFallback = !activeUsers || activeUsers.length === 0;

      // Processar dados para obter métricas em tempo real
      const usersByStep = new Map<number, number>();
      const usersByModality = new Map<string, number>();
      const uniqueUsers = new Set<string>();
      let lastActivityTimestamp: string | null = null;

      // Agrupar por usuário único (último evento de cada lead)
      const latestEventsByLead = new Map<string, any>();
      
      dataToProcess?.forEach(event => {
        const leadId = event.lead_id;
        if (leadId && (!latestEventsByLead.has(leadId) || 
            new Date(event.timestamp) > new Date(latestEventsByLead.get(leadId).timestamp))) {
          latestEventsByLead.set(leadId, event);
        }
        
        // Atualizar último timestamp de atividade
        if (!lastActivityTimestamp || new Date(event.timestamp) > new Date(lastActivityTimestamp)) {
          lastActivityTimestamp = event.timestamp;
        }
      });

      // Calcular métricas baseadas nos eventos mais recentes
      latestEventsByLead.forEach(event => {
        uniqueUsers.add(event.lead_id);
        
        if (event.step_number) {
          usersByStep.set(event.step_number, (usersByStep.get(event.step_number) || 0) + 1);
        }
        
        const modality = event.leads?.modalidade_compra || 'unknown';
        usersByModality.set(modality, (usersByModality.get(modality) || 0) + 1);
      });

      // Atividade recente (últimos 10 eventos únicos)
      const recentActivity = Array.from(latestEventsByLead.values())
        .slice(0, 10)
        .map(event => ({
          lead_id: event.lead_id,
          step_number: event.step_number,
          event_type: event.event_type,
          modalidade_compra: event.leads?.modalidade_compra || 'unknown',
          timestamp: event.timestamp
        }));

      setRealtimeData({
        totalOnline: isUsingFallback ? 0 : uniqueUsers.size,
        usersByStep,
        usersByModality,
        recentActivity,
        stepActivity: [],
        lastActivity: lastActivityTimestamp,
        isUsingFallback
      });

    } catch (error) {
      console.error('Error fetching realtime activity:', error);
    }
  };

  useEffect(() => {
    // Fetch inicial
    fetchCurrentActivity();
    
    // Configurar subscription de tempo real
    const channel = supabase
      .channel('funnel-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'funnel_events'
        },
        () => {
          // Refetch data quando houver novos eventos
          fetchCurrentActivity();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Polling fallback a cada 10 segundos
    const pollingInterval = setInterval(fetchCurrentActivity, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollingInterval);
    };
  }, []);

  return { realtimeData, isConnected };
};