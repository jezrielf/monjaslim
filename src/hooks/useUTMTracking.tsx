
import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  createTrackingData, 
  saveTrackingData, 
  getTrackingData, 
  trackFunnelEvent, 
  initializeSessionTiming,
  startStepTiming,
  getFullTrackingData,
  overrideUTMParams,
  extractUTMParams
} from '@/utils/tracking';
import { TrackingData, FunnelEventType } from '@/types/tracking';

// Hook principal para inicialização e gerenciamento de UTM tracking
export const useUTMTracking = () => {
  const initialized = useRef(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only initialize once per session
    if (initialized.current) return;
    initialized.current = true;

    // Check if we already have tracking data for this session
    let existingData = getTrackingData();
    
    if (!existingData) {
      // First visit - capture UTM parameters and create tracking data
      existingData = createTrackingData();
      saveTrackingData(existingData);
      initializeSessionTiming();
      
      // Track initial page view
      trackFunnelEvent('page_view', 0);
      startStepTiming();
      
      // Log captured UTM data for debugging
      console.log('🎯 Facebook UTM Tracking Initialized:', {
        utm_source: existingData.utm_source,
        utm_medium: existingData.utm_medium,
        utm_campaign: existingData.utm_campaign,
        utm_content: existingData.utm_content,
        utm_term: existingData.utm_term,
        fbclid: existingData.fbclid,
        fb_source: existingData.fb_source,
        session_id: existingData.session_id,
        referrer: existingData.referrer,
        timestamp: existingData.timestamp_acesso,
      });

      // Se detectamos que é do Facebook mas não tem UTMs, notificar
      if (existingData.fbclid && !existingData.utm_source) {
        console.warn('⚠️ Facebook click detected without UTM parameters!');
      }
    } else {
      // Returning user in same session
      console.log('🎯 Facebook Tracking - Session continued:', existingData.session_id);
      
      // Verificar se houve mudança na URL (navegação SPA)
      const currentUTMs = extractUTMParams();
      if (currentUTMs.utm_source && currentUTMs.utm_source !== existingData.utm_source) {
        console.log('🔄 New UTM parameters detected, updating tracking data');
        const updatedData = { ...existingData, ...currentUTMs };
        saveTrackingData(updatedData);
        existingData = updatedData;
      }
    }

    setTrackingData(existingData);
    setIsReady(true);
  }, []);

  // Função para atualizar UTMs manualmente
  const updateUTMs = useCallback((params: Partial<TrackingData>) => {
    overrideUTMParams(params);
    const updatedData = getTrackingData();
    setTrackingData(updatedData);
    console.log('🔧 UTMs updated manually:', params);
  }, []);

  // Função para obter dados completos de debug
  const getDebugData = useCallback(() => {
    return getFullTrackingData();
  }, []);

  return {
    trackingData,
    isInitialized: initialized.current,
    isReady,
    updateUTMs,
    getDebugData,
  };
};

// Hook aprimorado para tracking de steps com validação
export const useStepTracking = (currentStep: number, formData?: any) => {
  const previousStep = useRef<number>(0);
  const attemptCount = useRef<number>(0);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (currentStep !== previousStep.current && currentStep > 0) {
      const eventMap: Record<number, FunnelEventType> = {
        1: 'step_1_modalidade',
        2: 'step_2_dados_pessoais', 
        3: 'step_3_tratamento',
        4: 'step_4_agendamento',
        5: 'step_5_revisao',
      };

      const eventType = eventMap[currentStep];
      if (eventType) {
        setIsTracking(true);
        
        // Delays inteligentes baseados no step
        const getDelay = (step: number) => {
          if (step === 3) return 300; // Step tratamento - aguardar seleção
          if (step === 4) return 200; // Step agendamento - aguardar dados
          if (step === 5) return 250; // Step revisão - aguardar validação
          return 100; // Outros steps
        };

        const delay = getDelay(currentStep);
        
        console.log(`⏱️ Tracking step ${currentStep} com delay de ${delay}ms`);
        
        const timeoutId = setTimeout(() => {
          // Retry logic para steps críticos
          const attemptTracking = (attempt = 1) => {
            // Validar dados antes de enviar
            const validatedData = validateFormData(currentStep, formData);
            
            console.log(`📊 Tentativa ${attempt} de tracking para step ${currentStep}:`, {
              eventType,
              formData: validatedData,
              hasValidData: isValidData(currentStep, validatedData)
            });
            
            // Só fazer tracking se temos dados válidos ou não são necessários
            if (isValidData(currentStep, validatedData) || attempt > 2) {
              trackFunnelEvent(eventType, currentStep, validatedData);
              attemptCount.current = 0;
              setIsTracking(false);
            } else {
              // Retry para steps críticos
              if (currentStep === 3 && attempt <= 2) {
                console.log('⚠️ Dados incompletos no step 3, tentando novamente...');
                setTimeout(() => attemptTracking(attempt + 1), 200);
              } else {
                // Enviar mesmo com dados incompletos após tentativas
                trackFunnelEvent(eventType, currentStep, validatedData);
                setIsTracking(false);
              }
            }
          };
          
          attemptTracking();
        }, delay);

        // Cleanup
        return () => {
          clearTimeout(timeoutId);
          setIsTracking(false);
        };
      }

      previousStep.current = currentStep;
    }
  }, [currentStep, formData]);

  return { isTracking };
};

// Hook melhorado para tracking de submissão
export const useSubmissionTracking = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trackSubmission = useCallback(async (formData: any, redirectUrl?: string) => {
    setIsSubmitting(true);
    
    try {
      // Adicionar dados de tracking atuais ao formulário
      const trackingData = getTrackingData();
      const enrichedFormData = {
        ...formData,
        utm_tracking: {
          utm_source: trackingData?.utm_source || '',
          utm_medium: trackingData?.utm_medium || '',
          utm_campaign: trackingData?.utm_campaign || '',
          utm_content: trackingData?.utm_content || '',
          utm_term: trackingData?.utm_term || '',
          fbclid: trackingData?.fbclid || '',
          fb_source: trackingData?.fb_source || '',
        }
      };

      // Track form submission
      trackFunnelEvent('form_submit', 5, enrichedFormData);
      
      // Track redirect if applicable
      if (redirectUrl) {
        trackFunnelEvent('redirect_to_site', 5, { 
          redirect_url: redirectUrl,
          final_data: enrichedFormData 
        });
      }

      // Log final tracking summary
      console.log('📈 Submission tracked successfully:', {
        formData: enrichedFormData,
        redirectUrl,
        fullTrackingData: getFullTrackingData()
      });

      return true;
    } catch (error) {
      console.error('❌ Error tracking submission:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { trackSubmission, isSubmitting };
};

// Hook para tracking de navegação com context
export const useNavigationTracking = () => {
  const trackStepBack = useCallback((fromStep: number, toStep: number, reason?: string) => {
    const navigationData = {
      from_step: fromStep,
      to_step: toStep,
      reason: reason || 'user_back_navigation',
      timestamp: new Date().toISOString()
    };
    
    trackFunnelEvent('step_back', fromStep, navigationData);
    console.log('⬅️ Step back tracked:', navigationData);
  }, []);

  const trackStepEdit = useCallback((fromStep: number, toStep: number, fieldEdited?: string) => {
    const editData = {
      from_step: fromStep,
      to_step: toStep,
      field_edited: fieldEdited || 'unknown',
      timestamp: new Date().toISOString()
    };
    
    trackFunnelEvent('step_edit', fromStep, editData);
    console.log('✏️ Step edit tracked:', editData);
  }, []);

  return { trackStepBack, trackStepEdit };
};

// Hook para monitoramento em tempo real (debug)
export const useTrackingMonitor = () => {
  const [trackingState, setTrackingState] = useState<any>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const startMonitoring = useCallback((intervalMs = 5000) => {
    if (intervalRef.current) return;

    const updateState = () => {
      const fullData = getFullTrackingData();
      setTrackingState(fullData);
      console.log('🔍 Tracking Monitor Update:', fullData);
    };

    updateState(); // Initial update
    intervalRef.current = setInterval(updateState, intervalMs);
  }, []);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    return () => stopMonitoring();
  }, [stopMonitoring]);

  return {
    trackingState,
    startMonitoring,
    stopMonitoring,
  };
};

// Funções auxiliares
const validateFormData = (step: number, formData: any): any => {
  if (!formData) return {};

  // Validação específica por step
  switch (step) {
    case 1:
      return {
        modalidadeCompra: formData.modalidadeCompra || '',
      };
    case 2:
      return {
        nome: formData.nome || '',
        email: formData.email || '',
        telefone: formData.telefone || '',
      };
    case 3:
      return {
        tipoTratamento: formData.tipoTratamento || '',
        precoTratamento: formData.precoTratamento || '',
        modalidadeCompra: formData.modalidadeCompra || '',
      };
    case 4:
      return {
        dataAgendamento: formData.dataAgendamento || '',
        horarioAgendamento: formData.horarioAgendamento || '',
      };
    case 5:
      return formData; // Retornar todos os dados no step final
    default:
      return formData;
  }
};

const isValidData = (step: number, data: any): boolean => {
  if (!data) return false;

  switch (step) {
    case 1:
      return !!data.modalidadeCompra;
    case 2:
      return !!(data.nome && data.email);
    case 3:
      return !!(data.tipoTratamento && data.precoTratamento);
    case 4:
      return !!(data.dataAgendamento || data.horarioAgendamento);
    default:
      return true;
  }
};

// Hook composto para usar todos os recursos
export const useCompleteTracking = (currentStep: number, formData?: any) => {
  const utmTracking = useUTMTracking();
  const stepTracking = useStepTracking(currentStep, formData);
  const submissionTracking = useSubmissionTracking();
  const navigationTracking = useNavigationTracking();

  return {
    ...utmTracking,
    ...stepTracking,
    ...submissionTracking,
    ...navigationTracking,
  };
};
