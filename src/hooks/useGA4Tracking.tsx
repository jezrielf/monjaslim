
import { useEffect, useRef } from 'react';
import { useUTM } from '@/contexts/UTMContext';
import { trackFunnelStep, trackLeadGenerated, trackConversion, trackTiming } from '@/utils/ga4-tracker';

interface FormData {
  modalidadeCompra: string;
  nome: string;
  telefone: string;
  email: string;
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
  numero: string;
  complemento: string;
  tipoTratamento: string;
  precoTratamento: string;
  diaAgenda: string;
  horarioAgenda: string;
  aceiteFinal: boolean;
}

export const useGA4Tracking = () => {
  const { trackingData } = useUTM();
  const stepStartTime = useRef<number>(Date.now());

  const trackStep = (stepName: string, stepNumber: number, formData: Partial<FormData>) => {
    console.log('🔍 GA4: Tracking step', stepName, stepNumber);
    
    // Track the funnel step
    trackFunnelStep(stepName, stepNumber, formData, trackingData);
    
    // Track timing for previous step
    if (stepStartTime.current) {
      const timeSpent = Math.round((Date.now() - stepStartTime.current) / 1000);
      trackTiming('funnel', `step_${stepNumber - 1}_duration`, timeSpent, `previous_step_time`);
    }
    
    // Reset timer for current step
    stepStartTime.current = Date.now();
  };

  const trackLead = (leadData: FormData) => {
    console.log('🎯 GA4: Tracking lead generation');
    trackLeadGenerated(leadData, trackingData);
  };

  const trackFinalConversion = (leadData: FormData) => {
    console.log('💰 GA4: Tracking conversion');
    trackConversion(leadData, trackingData);
    
    // Track final step timing
    if (stepStartTime.current) {
      const timeSpent = Math.round((Date.now() - stepStartTime.current) / 1000);
      trackTiming('funnel', 'final_step_duration', timeSpent, 'conversion_time');
    }
  };

  return {
    trackStep,
    trackLead,
    trackFinalConversion,
  };
};
