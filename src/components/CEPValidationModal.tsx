import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { trackFunnelEvent } from '@/utils/tracking';

interface CEPValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCEPValidated: (cep: string, isValid: boolean) => void;
  initialCEP?: string;
}

export const CEPValidationModal: React.FC<CEPValidationModalProps> = ({
  isOpen,
  onClose,
  onCEPValidated,
  initialCEP = '',
}) => {
  const [cep, setCep] = useState(initialCEP);
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    city?: string;
    message?: string;
  } | null>(null);
  const { toast } = useToast();

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const isValidDivinopolisCEP = (cep: string): boolean => {
    const cleanCEP = cep.replace(/\D/g, '');
    const cepNumber = parseInt(cleanCEP);
    
    // Divinópolis: 35500000 a 35507999
    return cepNumber >= 35500000 && cepNumber <= 35507999;
  };

  const validateCEP = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      toast({
        title: "CEP incompleto",
        description: "Digite o CEP completo para continuar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    trackFunnelEvent('cep_validation_requested', 1, { cep: cleanCep });

    try {
      // Primeiro, validação por range numérico
      const isValidRange = isValidDivinopolisCEP(cleanCep);
      
      // Depois, validação via ViaCEP para confirmar
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setValidationResult({
          isValid: false,
          message: "CEP não encontrado. Verifique o CEP informado."
        });
        trackFunnelEvent('cep_validation_failed', 1, { 
          cep: cleanCep, 
          reason: 'cep_not_found' 
        });
        return;
      }

      const city = data.localidade;
      const isDivinopolis = city?.toLowerCase().includes('divinópolis') || isValidRange;

      setValidationResult({
        isValid: isDivinopolis,
        city: city,
        message: isDivinopolis 
          ? "✅ Ótimo! Atendemos sua região"
          : `❌ Infelizmente não atendemos ${city} ainda`
      });

      if (!isDivinopolis) {
        trackFunnelEvent('delivery_blocked_invalid_cep', 1, { 
          cep: cleanCep,
          city: city 
        });
      }

      onCEPValidated(cep, isDivinopolis);

    } catch (error) {
      // Fallback para validação apenas por range
      const isValidRange = isValidDivinopolisCEP(cleanCep);
      setValidationResult({
        isValid: isValidRange,
        message: isValidRange 
          ? "✅ CEP válido para entrega"
          : "❌ CEP fora da área de atendimento"
      });
      
      onCEPValidated(cep, isValidRange);
      
      if (!isValidRange) {
        trackFunnelEvent('delivery_blocked_invalid_cep', 1, { 
          cep: cleanCep,
          reason: 'api_error_fallback' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectToSite = () => {
    trackFunnelEvent('redirected_to_official_site', 1, { 
      source: 'cep_validation_modal',
      cep: cep.replace(/\D/g, ''),
      city: validationResult?.city
    });
    
    // Informar ao componente pai para definir modalidade e ir para ReviewStep
    onCEPValidated('site-oficial', true); // Passa flag especial
    onClose();
  };

  const handleTryAgain = () => {
    setCep('');
    setValidationResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Verificação de Área de Entrega
          </DialogTitle>
          <DialogDescription>
            Para pagar na entrega, precisamos verificar se atendemos sua região
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cep-validation">CEP</Label>
            <Input
              id="cep-validation"
              value={cep}
              onChange={(e) => setCep(formatCep(e.target.value))}
              placeholder="00000-000"
              maxLength={9}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  validateCEP();
                }
              }}
            />
          </div>

          {validationResult && (
            <div className="p-3 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                {validationResult.isValid ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Área Atendida
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    Fora da Área
                  </Badge>
                )}
              </div>
              <p className="text-sm">{validationResult.message}</p>
              {validationResult.city && (
                <p className="text-xs text-muted-foreground mt-1">
                  Cidade: {validationResult.city}
                </p>
              )}
            </div>
          )}

          {validationResult && !validationResult.isValid && (
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-amber-800 mb-1">
                    Ops! Não atendemos sua região ainda 😔
                  </h4>
                  <p className="text-sm text-amber-700 mb-3">
                    Infelizmente o pagamento na entrega só está disponível para Divinópolis-MG. 
                    Mas você pode comprar pelo nosso site oficial com entrega via Sedex para todo o Brasil!
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
          )}

          <div className="flex gap-2 justify-end">
            {validationResult && !validationResult.isValid && (
              <Button
                onClick={handleTryAgain}
                variant="outline"
                size="sm"
              >
                Tentar Outro CEP
              </Button>
            )}
            
            {!validationResult && (
              <Button
                onClick={validateCEP}
                disabled={isLoading || cep.replace(/\D/g, '').length !== 8}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar CEP'
                )}
              </Button>
            )}

            {validationResult?.isValid && (
              <Button
                onClick={onClose}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continuar
              </Button>
            )}

            <Button
              onClick={onClose}
              variant="outline"
            >
              Fechar
            </Button>
          </div>

          <div className="text-xs text-muted-foreground border-t pt-3">
            <p className="font-medium mb-1">Área de atendimento:</p>
            <p>• Divinópolis-MG e região</p>
            <p>• Para outras cidades: compra pelo site com Sedex</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};