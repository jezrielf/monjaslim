import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { PurchaseMethodStep } from './steps/PurchaseMethodStep';
import { PersonalDataStep } from './steps/PersonalDataStep';
import { TreatmentStep } from './steps/TreatmentStep';
import { SchedulingStep } from './steps/SchedulingStep';
import { ReviewStep } from './ReviewStep';
import { SuccessMessage } from './SuccessMessage';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseSubmission } from '@/hooks/useSupabaseSubmission';
import { useGA4Tracking } from '@/hooks/useGA4Tracking';
import { supabase } from '@/integrations/supabase/client';

export interface FormData {
  // Modalidade de compra
  modalidadeCompra: string;
  
  // Dados pessoais
  nome: string;
  telefone: string;
  email: string;
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
  numero: string;
  complemento: string;
  
  // Tratamento
  tipoTratamento: string;
  precoTratamento: string;
  
  // Agendamento
  diaAgenda: string;
  horarioAgenda: string;
  
  // Aceite
  aceiteFinal: boolean;
}

const initialFormData: FormData = {
  modalidadeCompra: '',
  nome: '',
  telefone: '',
  email: '',
  cep: '',
  rua: '',
  bairro: '',
  cidade: '',
  numero: '',
  complemento: '',
  tipoTratamento: '',
  precoTratamento: '',
  diaAgenda: '',
  horarioAgenda: '',
  aceiteFinal: false,
};

const allSteps = [
  { id: 1, title: 'Modalidade', description: 'Como comprar' },
  { id: 2, title: 'Dados Pessoais', description: 'Informações básicas' },
  { id: 3, title: 'Tratamento', description: 'Escolha seu plano' },
  { id: 4, title: 'Agendamento', description: 'Defina horário' },
  { id: 5, title: 'Revisão', description: 'Confirme os dados' },
];

export const FormWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  // GA4 Tracking
  const { trackStep, trackLead, trackFinalConversion } = useGA4Tracking();

  // Dynamic steps based on purchase method
  const getActiveSteps = () => {
    if (formData.modalidadeCompra === 'site-sedex') {
      // Site oficial: Modalidade -> Tratamento -> Revisão
      return [
        { id: 1, title: 'Modalidade', description: 'Como comprar' },
        { id: 3, title: 'Tratamento', description: 'Escolha seu plano' },
        { id: 5, title: 'Revisão', description: 'Confirme os dados' },
      ];
    }
    // Pagar na entrega: todas as etapas
    return allSteps;
  };

  const steps = getActiveSteps();

  
  // Initialize Supabase submission
  const { submitFormData, isSubmitting: isSupabaseSubmitting } = useSupabaseSubmission();

  const updateFormData = (newData: Partial<FormData>, callback?: () => void) => {
    setFormData(prev => {
      const updated = { ...prev, ...newData };
      console.log('📝 FormData atualizado:', updated);
      
      // Executar callback após update
      if (callback) {
        setTimeout(callback, 50);
      }
      
      return updated;
    });
  };

  const nextStep = (targetStep?: number) => {
    const stepNames = ['Modalidade', 'Dados Pessoais', 'Tratamento', 'Agendamento', 'Revisão'];
    
    if (targetStep) {
      setCurrentStep(targetStep);
      // Track GA4 step
      trackStep(stepNames[targetStep - 1], targetStep, formData);
      return;
    }

    if (formData.modalidadeCompra === 'site-sedex') {
      // Conditional navigation for site oficial
      if (currentStep === 1) {
        setCurrentStep(3); // Modalidade -> Tratamento
        trackStep('Tratamento', 3, formData);
      } else if (currentStep === 3) {
        setCurrentStep(5); // Tratamento -> Revisão
        trackStep('Revisão', 5, formData);
      }
    } else {
      // Normal navigation for pagar na entrega
      if (currentStep < 5) {
        const nextStepNum = currentStep + 1;
        setCurrentStep(nextStepNum);
        trackStep(stepNames[nextStepNum - 1], nextStepNum, formData);
      }
    }
  };

  const prevStep = () => {
    if (formData.modalidadeCompra === 'site-sedex') {
      // Conditional navigation for site oficial
      if (currentStep === 5) {
        
        setCurrentStep(3); // Revisão -> Tratamento
      } else if (currentStep === 3) {
        
        setCurrentStep(1); // Tratamento -> Modalidade
      }
    } else {
      // Normal navigation for pagar na entrega
      if (currentStep > 1) {
        
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    // Validação antes da submissão
    if (!formData.tipoTratamento || !formData.precoTratamento) {
      toast({
        title: "Erro",
        description: "Dados do tratamento ausentes. Por favor, selecione um tratamento.",
        variant: "destructive",
      });
      
      // Redirecionar para step do tratamento
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      // Track lead generation in GA4
      trackLead(formData);

      // Prepare data for Supabase
      const formattedFormData = {
        purchaseMethod: formData.modalidadeCompra,
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        cep: formData.cep,
        rua: formData.rua,
        bairro: formData.bairro,
        cidade: formData.cidade,
        numero: formData.numero,
        complemento: formData.complemento,
        treatmentType: formData.tipoTratamento,
        treatmentPrice: formData.precoTratamento,
        selectedDay: formData.diaAgenda,
        selectedTime: formData.horarioAgenda,
        acceptance: formData.aceiteFinal,
      };

      // Submit to Supabase
      const result = await submitFormData(formattedFormData);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Track conversion in GA4 if user accepted
      if (formData.aceiteFinal) {
        trackFinalConversion(formData);
      }

      // Enviar e-mail de notificação
      try {
        console.log('Enviando e-mail com dados do tratamento:', { 
          tipo_tratamento: formData.tipoTratamento, 
          preco_tratamento: formData.precoTratamento 
        });
        await supabase.functions.invoke('send-notification-email', {
          body: {
            leadData: {
              nome: formData.nome || 'Não informado',
              telefone: formData.telefone || 'Não informado',
              email: formData.email || 'Não informado',
              rua: formData.rua || 'Não informado',
              numero: formData.numero || 'Não informado',
              bairro: formData.bairro || 'Não informado',
              cidade: formData.cidade || 'Não informado',
              cep: formData.cep || 'Não informado',
              complemento: formData.complemento || '',
              modalidade_compra: formData.modalidadeCompra,
              tipo_tratamento: formData.tipoTratamento,
              preco_tratamento: formData.precoTratamento,
              dia_agenda: formData.diaAgenda || '',
              horario_agenda: formData.horarioAgenda || '',
            },
            timestamp: new Date().toLocaleString('pt-BR'),
          },
        });
        console.log('E-mail de notificação enviado com sucesso');
      } catch (emailError) {
        console.error('Erro ao enviar e-mail de notificação:', emailError);
        // Não interrompe o fluxo se o e-mail falhar
      }
      
      // Redirecionamento para site oficial se modalidade for 'site-sedx'
      if (formData.modalidadeCompra === 'site-sedex') {
        const treatmentUrls = {
          '1-pote': 'https://app.monetizze.com.br/checkout/DMZ349679',
          '2-potes': 'https://app.monetizze.com.br/checkout/DDN349680',
          '3-potes': 'https://app.monetizze.com.br/checkout/DUC351541',
          '5-potes': 'https://app.monetizze.com.br/checkout/DXM349681'
        };
        
        const redirectUrl = treatmentUrls[formData.tipoTratamento as keyof typeof treatmentUrls];
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }
      }
      
      setIsSuccess(true);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Houve um problema ao enviar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewForm = () => {
    setIsSuccess(false);
    setFormData(initialFormData);
    setCurrentStep(1);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PurchaseMethodStep
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <PersonalDataStep
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <TreatmentStep
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <SchedulingStep
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <ReviewStep
            data={formData}
            updateData={updateFormData}
            onSubmit={handleSubmit}
            onPrev={prevStep}
            onEdit={goToStep}
            isSubmitting={isSubmitting || isSupabaseSubmitting}
          />
        );
      default:
        return null;
    }
  };

  // Calculate progress based on current flow
  const getStepIndex = () => {
    if (formData.modalidadeCompra === 'site-sedex') {
      const siteSteps = [1, 3, 5];
      return siteSteps.indexOf(currentStep) + 1;
    }
    return currentStep;
  };
  
  const progress = (getStepIndex() / steps.length) * 100;

  if (isSuccess) {
    return <SuccessMessage onNewForm={handleNewForm} />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header com steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <img 
              src="/lovable-uploads/5c3e1c9b-d497-47ae-a5d6-d7257be8a9dd.png"
              alt="MonjaSlim"
              className="h-12 md:h-16 object-contain"
            />
            <div className="text-sm text-muted-foreground">
              Etapa {getStepIndex()} de {steps.length}
            </div>
          </div>
          
          <Progress value={progress} className="mb-6" />
          
          <div className={`grid gap-2 md:gap-4 ${formData.modalidadeCompra === 'site-sedex' ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-5'}`}>
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = formData.modalidadeCompra === 'site-sedex' 
                ? (currentStep === 5 && step.id < 5) || (currentStep === 3 && step.id === 1)
                : step.id < currentStep;
              const isCurrent = step.id === currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`text-center p-2 md:p-3 rounded-lg border transition-all ${
                    isCompleted
                      ? 'bg-success border-success text-success-foreground'
                      : isCurrent
                      ? 'bg-accent border-accent text-accent-foreground shadow-teal'
                      : 'bg-muted border-border text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1 md:mb-2">
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                      <span className="text-sm md:text-lg font-bold">{stepNumber}</span>
                    )}
                  </div>
                  <div className="text-xs md:text-sm font-medium">{step.title}</div>
                  <div className="text-xs opacity-75 hidden md:block">{step.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conteúdo da etapa atual */}
        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">
              {steps[currentStep - 1]?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderCurrentStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
