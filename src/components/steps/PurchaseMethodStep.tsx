import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Truck, CreditCard, MapPin, AlertCircle, ExternalLink } from 'lucide-react';
import { FormData } from '../FormWizard';
import { CEPValidationModal } from '../CEPValidationModal';
import { trackFunnelEvent } from '@/utils/tracking';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PurchaseMethodStepProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
  onNext: (targetStep?: number) => void;
}

export const PurchaseMethodStep: React.FC<PurchaseMethodStepProps> = ({
  data,
  updateData,
  onNext,
}) => {
  const [showCEPModal, setShowCEPModal] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [cepValidated, setCepValidated] = useState(false);
  const [isValidForDelivery, setIsValidForDelivery] = useState(false);

  const isValidDivinopolisCEP = (cep: string): boolean => {
    const cleanCEP = cep.replace(/\D/g, '');
    const cepNumber = parseInt(cleanCEP);
    
    // Divinópolis: 35500000 a 35507999
    return cepNumber >= 35500000 && cepNumber <= 35507999;
  };

  const handleSelectMethod = (method: string) => {
    if (method === 'site-sedex') {
      updateData({ modalidadeCompra: method });
      // Pular direto para tratamento (step 3)
      onNext(3);
      return;
    }

    // Para "pagar na entrega", validar CEP primeiro
    if (method === 'pagar-entrega') {
      const currentCEP = data.cep || '';
      
      if (currentCEP && currentCEP.replace(/\D/g, '').length === 8) {
        // CEP já preenchido - validar diretamente
        const isValid = isValidDivinopolisCEP(currentCEP);
        
        if (isValid) {
          updateData({ modalidadeCompra: method });
          onNext(2);
        } else {
          trackFunnelEvent('delivery_blocked_invalid_cep', 1, { 
            cep: currentCEP.replace(/\D/g, ''),
            context: 'existing_cep'
          });
          setShowRedirectModal(true);
        }
      } else {
        // CEP não preenchido - abrir modal para validação
        setShowCEPModal(true);
      }
    }
  };

  const handleCEPValidated = (cep: string, isValid: boolean) => {
    setCepValidated(true);
    setIsValidForDelivery(isValid);
    
    if (isValid) {
      updateData({ 
        modalidadeCompra: 'pagar-entrega',
        cep: cep 
      });
      setShowCEPModal(false);
      onNext(2);
    } else {
      setShowCEPModal(false);
      setShowRedirectModal(true);
    }
  };

  const handleRedirectToSite = () => {
    trackFunnelEvent('redirected_to_official_site', 1, { 
      source: 'purchase_method_redirect_modal'
    });
    
    window.open('https://monjaslim.com.br', '_blank');
    setShowRedirectModal(false);
  };

  const getCurrentCEPStatus = () => {
    const currentCEP = data.cep || '';
    if (currentCEP && currentCEP.replace(/\D/g, '').length === 8) {
      const isValid = isValidDivinopolisCEP(currentCEP);
      return {
        hasValidCEP: isValid,
        cep: currentCEP
      };
    }
    return { hasValidCEP: false, cep: '' };
  };

  const cepStatus = getCurrentCEPStatus();

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          Como você gostaria de adquirir?
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Escolha a modalidade de compra que melhor atende suas necessidades
        </p>
      </div>

      <div className="grid gap-3 md:gap-4">
        <Card 
          className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-primary/50"
          onClick={() => handleSelectMethod('site-sedex')}
        >
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="bg-primary/10 p-2 md:p-3 rounded-full">
                <Truck className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">
                  Quero comprar pelo site oficial e receber via Sedex
                </h3>
                <p className="text-sm text-muted-foreground">
                  Compra online com entrega rápida e segura via Sedex
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-xs md:text-sm text-green-600 font-medium">
                    Pagamento seguro online
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-primary/50"
          onClick={() => handleSelectMethod('pagar-entrega')}
        >
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="bg-primary/10 p-2 md:p-3 rounded-full">
                <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">
                  Quero pagar na entrega
                </h3>
                <p className="text-sm text-muted-foreground">
                  Receba em casa e pague apenas no momento da entrega
                </p>
                
                {cepStatus.hasValidCEP ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-xs md:text-sm text-green-600 font-medium">
                      ✅ Divinópolis - Entrega Disponível
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="h-4 w-4 text-amber-600" />
                      <span className="text-xs md:text-sm text-amber-600 font-medium">
                        Verificaremos sua área de entrega
                      </span>
                    </div>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs">
                        Apenas Divinópolis-MG
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Validação de CEP */}
      <CEPValidationModal
        isOpen={showCEPModal}
        onClose={() => setShowCEPModal(false)}
        onCEPValidated={handleCEPValidated}
        initialCEP={data.cep}
      />

      {/* Modal de Redirecionamento */}
      <Dialog open={showRedirectModal} onOpenChange={setShowRedirectModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Ops! Não atendemos sua região ainda 😔
            </DialogTitle>
            <DialogDescription>
              Infelizmente o pagamento na entrega só está disponível para Divinópolis-MG
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-800 mb-1">
                    Boa notícia! 🎉
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Você pode comprar pelo nosso site oficial com entrega via Sedex para todo o Brasil!
                    Pagamento seguro online e entrega rápida.
                  </p>
                  <Button
                    onClick={handleRedirectToSite}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    size="sm"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Comprar pelo Site Oficial
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowCEPModal(true)}
                variant="outline"
                size="sm"
              >
                Tentar Outro CEP
              </Button>
              <Button
                onClick={() => setShowRedirectModal(false)}
                variant="outline"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};