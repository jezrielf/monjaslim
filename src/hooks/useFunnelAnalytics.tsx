import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FunnelStepData {
  step: string;
  step_number: number;
  total_entries: number;
  completions: number;
  completion_rate: number;
  avg_time_seconds: number;
  drop_off_rate: number;
}

export interface ModalityFunnelData {
  modalidade: string;
  total_leads: number;
  conversions: number;
  conversion_rate: number;
  avg_funnel_time: number;
  steps: FunnelStepData[];
}

export const useFunnelAnalytics = (dateRange: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ["funnel-analytics", dateRange],
    queryFn: async () => {
      const fromDate = dateRange.from.toISOString();
      const toDate = dateRange.to.toISOString();

      // Funnel events query
      const { data: funnelEvents, error: funnelError } = await supabase
        .from("funnel_events")
        .select(`
          event_type,
          step_number,
          time_on_step_seconds,
          timestamp,
          leads!inner(modalidade_compra, aceite_final, created_at)
        `)
        .gte("timestamp", fromDate)
        .lte("timestamp", toDate);

      if (funnelError) throw funnelError;

      // Leads by modality
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("modalidade_compra, aceite_final, total_time_seconds, completed_steps")
        .gte("created_at", fromDate)
        .lte("created_at", toDate);

      if (leadsError) throw leadsError;

      // Process funnel steps
      const stepMap = new Map<string, any>();
      const stepNames = [
        "Seleção de Modalidade",
        "Dados Pessoais", 
        "Seleção de Tratamento",
        "Agendamento",
        "Revisão Final"
      ];

      // Initialize steps
      for (let i = 1; i <= 5; i++) {
        stepMap.set(i.toString(), {
          step: stepNames[i - 1],
          step_number: i,
          total_entries: 0,
          completions: 0,
          total_time: 0,
          entry_count: 0,
        });
      }

      // Process funnel events
      funnelEvents?.forEach((event: any) => {
        if (event.step_number && event.step_number <= 5) {
          const step = stepMap.get(event.step_number.toString());
          if (step) {
            step.total_entries++;
            if (event.time_on_step_seconds) {
              step.total_time += event.time_on_step_seconds;
              step.entry_count++;
            }
          }
        }
      });

      // Calculate completion rates from leads data
      const totalLeads = leadsData?.length || 0;
      let previousStepCount = totalLeads;

      const processedSteps: FunnelStepData[] = Array.from(stepMap.values()).map((step, index) => {
        const completedAtStep = leadsData?.filter(lead => (lead.completed_steps || 0) >= step.step_number).length || 0;
        const completionRate = previousStepCount > 0 ? (completedAtStep / previousStepCount) * 100 : 0;
        const dropOffRate = previousStepCount > 0 ? ((previousStepCount - completedAtStep) / previousStepCount) * 100 : 0;
        
        const result = {
          ...step,
          completions: completedAtStep,
          completion_rate: completionRate,
          avg_time_seconds: step.entry_count > 0 ? step.total_time / step.entry_count : 0,
          drop_off_rate: dropOffRate,
        };
        
        previousStepCount = completedAtStep;
        return result;
      });

      // Process by modality
      const modalityMap = new Map<string, any>();
      const modalities = ['site-oficial', 'pagar-entrega'];

      modalities.forEach(mod => {
        modalityMap.set(mod, {
          modalidade: mod === 'site-oficial' ? 'Site Oficial' : 'Pagar na Entrega',
          total_leads: 0,
          conversions: 0,
          total_time: 0,
          steps: stepNames.map((name, index) => ({
            step: name,
            step_number: index + 1,
            total_entries: 0,
            completions: 0,
            completion_rate: 0,
            avg_time_seconds: 0,
            drop_off_rate: 0,
          })),
        });
      });

      leadsData?.forEach((lead) => {
        const modality = lead.modalidade_compra || 'unknown';
        if (modalityMap.has(modality)) {
          const modalityData = modalityMap.get(modality);
          modalityData.total_leads++;
          if (lead.aceite_final) modalityData.conversions++;
          if (lead.total_time_seconds) modalityData.total_time += lead.total_time_seconds;
          
          // Update step data for this modality
          const completedSteps = lead.completed_steps || 0;
          modalityData.steps.forEach((step: any, index: number) => {
            if (completedSteps >= index + 1) {
              step.completions++;
            }
            step.total_entries = modalityData.total_leads;
            step.completion_rate = step.total_entries > 0 ? (step.completions / step.total_entries) * 100 : 0;
          });
        }
      });

      const modalityFunnels: ModalityFunnelData[] = Array.from(modalityMap.values()).map(modality => ({
        ...modality,
        conversion_rate: modality.total_leads > 0 ? (modality.conversions / modality.total_leads) * 100 : 0,
        avg_funnel_time: modality.total_leads > 0 ? modality.total_time / modality.total_leads : 0,
      }));

      return {
        overallFunnel: processedSteps,
        modalityFunnels,
      };
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });
};