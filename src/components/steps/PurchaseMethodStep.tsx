import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Truck, DollarSign, MapPin, AlertCircle, ExternalLink } from 'lucide-react';
import { FormData } from '../FormWizard';
import { CEPValidationModal } from '../CEPValidationModal';

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
          setShowRedirectModal(true);
        }
      } else {
        // CEP não preenchido - abrir modal para validação
        setShowCEPModal(true);
      }
    }
  };

  const handleCEPValidated = (cep: string, isValid: boolean) => {
    // Se vier com valor especial "site-oficial"
    if (cep === 'site-oficial') {
      updateData({ modalidadeCompra: 'site-sedex' });
      onNext(3); // Vai direto para ReviewStep
      return;
    }
    
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
    window.open('https://app.monetizze.com.br/checkout/DXM349681', '_blank');
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
    <div className="space-y-6 md:space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          MonjaSlim: Sua Transformação Começa Aqui
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Descubra o poder do MonjaSlim, o suplemento natural de última geração criado para quem busca emagrecimento saudável, controle da ansiedade alimentar e mais energia no dia a dia. Fórmula avançada, resultados reais e segurança total. Escolha como quer receber o seu MonjaSlim!
        </p>
        <div className="pt-2">
          <h2 className="text-lg md:text-xl font-semibold text-foreground mb-1">
            Como você prefere adquirir o MonjaSlim?
          </h2>
          <p className="text-sm text-muted-foreground">
            Escolha a modalidade que melhor atende sua necessidade:
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:gap-4">
        <Card 
          className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-primary/50"
          onClick={() => handleSelectMethod('site-sedex')}
        >
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 md:gap-6">
              <div className="bg-primary/10 p-3 md:p-4 rounded-full">
                <Truck className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
                  Quero Receber em Todo o Brasil
                </h3>
                <p className="text-base font-medium text-muted-foreground mb-3">
                  Entrega Rápida e Segura via SEDEX
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Compre online no site oficial, com garantia e pagamento seguro
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Receba seu MonjaSlim em qualquer lugar do Brasil
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Suporte e acompanhamento do pedido do início ao fim
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Pagamento 100% seguro e protegido
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-primary/50"
          onClick={() => handleSelectMethod('pagar-entrega')}
        >
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 md:gap-6">
              <div className="bg-primary/10 p-3 md:p-4 rounded-full">
                <DollarSign className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
                  Quero Pagar na Entrega (Divinópolis-MG)
                </h3>
                <p className="text-base font-medium text-muted-foreground mb-3">
                  Receba em casa e pague somente quando chegar
                </p>
                
                {cepStatus.hasValidCEP ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        ✅ Divinópolis - Entrega Disponível
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Ideal para quem prefere pagar só no recebimento
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Disponível exclusivamente para Divinópolis-MG e região
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Nossa equipe entrará em contato para confirmar a área de entrega
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-amber-600 font-medium">
                        Verifique se sua região está disponível
                      </span>
                    </div>
                  </div>
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