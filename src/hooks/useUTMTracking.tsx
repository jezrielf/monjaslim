import { useEffect, useRef } from 'react';
import { 
  createTrackingData, 
  saveTrackingData, 
  getTrackingData, 
  trackFunnelEvent, 
  initializeSessionTiming,
  startStepTiming 
} from '@/utils/tracking';

export const useUTMTracking = () => {
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize once per session
    if (initialized.current) return;
    initialized.current = true;

    // Check if we already have tracking data for this session
    let trackingData = getTrackingData();
    
    if (!trackingData) {
      // First visit - capture UTM parameters and create tracking data
      trackingData = createTrackingData();
      saveTrackingData(trackingData);
      initializeSessionTiming();
      
      // Track initial page view
      trackFunnelEvent('page_view', 0);
      startStepTiming();
      
      // Log captured UTM data for debugging
      console.log('🎯 Facebook UTM Tracking Initialized:', {
        utm_source: trackingData.utm_source,
        utm_campaign: trackingData.utm_campaign,
        utm_content: trackingData.utm_content,
        utm_term: trackingData.utm_term,
        fbclid: trackingData.fbclid,
        session_id: trackingData.session_id,
      });
    } else {
      // Returning user in same session
      console.log('🎯 Facebook Tracking - Session continued:', trackingData.session_id);
    }
  }, []);

  return {
    trackingData: getTrackingData(),
    isInitialized: initialized.current,
  };
};

// Hook for tracking step changes
export const useStepTracking = (currentStep: number, formData?: any) => {
  const previousStep = useRef<number>(0);

  useEffect(() => {
    if (currentStep !== previousStep.current && currentStep > 0) {
      const eventMap: Record<number, string> = {
        1: 'step_1_modalidade',
        2: 'step_2_dados_pessoais', 
        3: 'step_3_tratamento',
        4: 'step_4_agendamento',
        5: 'step_5_revisao',
      };

      const eventType = eventMap[currentStep];
      if (eventType) {
        // Delays inteligentes baseados no step
        const getDelay = (step: number) => {
          if (step === 3) return 300; // Step tratamento - aguardar seleção
          if (step === 4) return 200; // Step agendamento - aguardar dados
          if (step === 5) return 250; // Step revisão - aguardar validação
          return 100; // Outros steps
        };

        const delay = getDelay(currentStep);
        
        console.log(`⏱️ Tracking step ${currentStep} com delay de ${delay}ms`);
        
        setTimeout(() => {
          // Retry logic para steps críticos
          const attemptTracking = (attempt = 1) => {
            console.log(`📊 Tentativa ${attempt} de tracking para step ${currentStep}:`, {
              eventType,
              formData: {
                tipoTratamento: formData?.tipoTratamento,
                precoTratamento: formData?.precoTratamento,
                modalidadeCompra: formData?.modalidadeCompra
              }
            });
            
            trackFunnelEvent(eventType as any, currentStep, formData);
            
            // Para step 3, verificar se dados foram capturados
            if (currentStep === 3 && attempt === 1 && (!formData?.tipoTratamento || !formData?.precoTratamento)) {
              console.log('⚠️ Dados incompletos no step 3, tentando novamente...');
              setTimeout(() => attemptTracking(2), 200);
            }
          };
          
          attemptTracking();
        }, delay);
      }

      previousStep.current = currentStep;
    }
  }, [currentStep, formData]);
};

// Hook for tracking form submission
export const useSubmissionTracking = () => {
  const trackSubmission = (formData: any, redirectUrl?: string) => {
    trackFunnelEvent('form_submit', 5, formData);
    
    if (redirectUrl) {
      trackFunnelEvent('redirect_to_site', 5, { redirect_url: redirectUrl });
    }
  };

  return { trackSubmission };
};

// Hook for tracking step navigation (back/edit)
export const useNavigationTracking = () => {
  const trackStepBack = (fromStep: number, toStep: number) => {
    trackFunnelEvent('step_back', fromStep, { from_step: fromStep, to_step: toStep });
  };

  const trackStepEdit = (fromStep: number, toStep: number) => {
    trackFunnelEvent('step_edit', fromStep, { from_step: fromStep, to_step: toStep });
  };

  return { trackStepBack, trackStepEdit };
};