import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TrackingData, FunnelEvent, ConversionData } from '@/types/tracking';

interface FormData {
  purchaseMethod: string;
  nome: string;
  telefone: string;
  email: string;
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
  numero: string;
  complemento: string;
  treatmentType: string;
  treatmentPrice: string;
  selectedDay: string;
  selectedTime: string;
  acceptance: boolean;
}

export const useSupabaseSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const saveFunnelEvent = async (
    leadId: string | null,
    eventType: string,
    stepNumber: number,
    formData?: any,
    timeOnStep?: number,
    utmData?: any
  ) => {
    try {
      const { error } = await supabase
        .from('funnel_events')
        .insert({
          lead_id: leadId,
          event_type: eventType,
          step_number: stepNumber,
          time_on_step_seconds: timeOnStep,
          form_data_snapshot: formData,
          utm_data: utmData
        });

      if (error) {
        console.error('Error saving funnel event:', error);
      }
    } catch (error) {
      console.error('Error saving funnel event:', error);
    }
  };

  const submitFormData = async (
    formData: FormData,
    trackingData: TrackingData,
    funnelEvents: FunnelEvent[],
    conversionData: ConversionData
  ) => {
    setIsSubmitting(true);
    
    try {
      // Insert lead data
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert({
          // Personal data
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email,
          cep: formData.cep,
          rua: formData.rua,
          bairro: formData.bairro,
          cidade: formData.cidade,
          numero: formData.numero,
          complemento: formData.complemento,
          
          // Form data
          modalidade_compra: formData.purchaseMethod,
          tipo_tratamento: formData.treatmentType,
          preco_tratamento: formData.treatmentPrice,
          dia_agenda: formData.selectedDay,
          horario_agenda: formData.selectedTime,
          aceite_final: formData.acceptance,
          data_preenchimento: new Date().toISOString(),
          
          // Tracking data
          utm_source: trackingData.utm_source,
          utm_medium: trackingData.utm_medium,
          utm_campaign: trackingData.utm_campaign,
          utm_content: trackingData.utm_content,
          utm_term: trackingData.utm_term,
          fbclid: trackingData.fbclid,
          fb_source: trackingData.fb_source,
          session_id: trackingData.session_id,
          user_agent: trackingData.user_agent,
          referrer: trackingData.referrer,
          page_url: trackingData.page_url,
          
          // Conversion data
          total_time_seconds: parseInt(conversionData.total_time) || 0,
          completed_steps: conversionData.completed_steps,
          final_action: conversionData.final_action,
          conversion_value: conversionData.conversion_value
        })
        .select('id')
        .single();

      if (leadError) {
        throw leadError;
      }

      const leadId = leadData?.id;

      // Insert funnel events with lead_id
      if (leadId && funnelEvents.length > 0) {
        const eventsToInsert = funnelEvents.map(event => ({
          lead_id: leadId,
          event_type: event.event,
          timestamp: event.timestamp,
          step_number: event.step,
          time_on_step_seconds: event.time_on_step || 0,
          form_data_snapshot: event.form_data as any || null,
          utm_data: event.utm_data as any || null
        }));

        const { error: eventsError } = await supabase
          .from('funnel_events')
          .insert(eventsToInsert);

        if (eventsError) {
          console.error('Error saving funnel events:', eventsError);
        }
      }

      toast({
        title: "Dados salvos com sucesso!",
        description: "Suas informações foram registradas no sistema.",
      });

      return { success: true, leadId };

    } catch (error: any) {
      console.error('Error submitting form data:', error);
      
      toast({
        title: "Erro ao salvar dados",
        description: "Houve um problema ao salvar suas informações. Tente novamente.",
        variant: "destructive",
      });

      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitFormData,
    saveFunnelEvent,
    isSubmitting
  };
};