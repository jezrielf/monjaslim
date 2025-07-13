import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { PurchaseMethodStep } from './steps/PurchaseMethodStep';
import { PersonalDataStep } from './steps/PersonalDataStep';
import { TreatmentStep } from './steps/TreatmentStep';
import { SchedulingStep } from './steps/SchedulingStep';
import { ReviewStep } from './steps/ReviewStep';
import { SuccessMessage } from './SuccessMessage';
import { useToast } from '@/hooks/use-toast';
import { useUTMTracking, useStepTracking, useSubmissionTracking, useNavigationTracking } from '@/hooks/useUTMTracking';
import { formatTrackingForSubmission } from '@/utils/tracking';

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

const steps = [
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

  // Initialize Facebook tracking
  const { trackingData } = useUTMTracking();
  useStepTracking(currentStep, formData);
  const { trackSubmission } = useSubmissionTracking();
  const { trackStepBack, trackStepEdit } = useNavigationTracking();

  const updateFormData = (newData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      trackStepBack(currentStep, currentStep - 1);
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    trackStepEdit(currentStep, step);
    setCurrentStep(step);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Prepare full tracking data for submission
      const fullTrackingData = formatTrackingForSubmission(formData, 
        formData.modalidadeCompra === 'site-sedux' ? 'redirect_to_site' : 'success_page'
      );
      
      console.log('🎯 Dados finais com tracking:', fullTrackingData);
      
      // Track form submission
      trackSubmission(formData);
      
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirecionamento para site oficial se modalidade for 'site-sedex'
      if (formData.modalidadeCompra === 'site-sedex') {
        const treatmentUrls = {
          'prime': 'https://www.monjaslim.com.br/produtos/reprogramacao-corporal-definitiva-pote-90-dias/',
          'power': 'https://www.monjaslim.com.br/produtos/reprogramacao-corporal-total-pote-150-dias/',
          'plus': 'https://www.monjaslim.com.br/produtos/bloqueio-do-efeito-sanfona-pote-60-dias/',
          'teste': 'https://www.monjaslim.com.br/produtos/acao-de-choque-metabolica-pote-30-dias/'
        };
        
        const redirectUrl = treatmentUrls[formData.tipoTratamento as keyof typeof treatmentUrls];
        if (redirectUrl) {
          // Track redirect before leaving page
          trackSubmission(formData, redirectUrl);
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
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / steps.length) * 100;

  if (isSuccess) {
    return <SuccessMessage onNewForm={handleNewForm} />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header com steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(208_100%_24%)] to-[hsl(208_85%_30%)] bg-clip-text text-transparent">
              Cadastro de Lead
            </h1>
            <div className="text-sm text-muted-foreground">
              Etapa {currentStep} de {steps.length}
            </div>
          </div>
          
          <Progress value={progress} className="mb-6" />
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`text-center p-2 md:p-3 rounded-lg border transition-all ${
                  step.id < currentStep
                    ? 'bg-success border-success text-success-foreground'
                    : step.id === currentStep
                    ? 'bg-accent border-accent text-accent-foreground shadow-teal'
                    : 'bg-muted border-border text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-center mb-1 md:mb-2">
                  {step.id < currentStep ? (
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <span className="text-sm md:text-lg font-bold">{step.id}</span>
                  )}
                </div>
                <div className="text-xs md:text-sm font-medium">{step.title}</div>
                <div className="text-xs opacity-75 hidden md:block">{step.description}</div>
              </div>
            ))}
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