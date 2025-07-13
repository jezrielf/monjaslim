import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Truck, CreditCard } from 'lucide-react';
import { FormData } from '../FormWizard';

interface PurchaseMethodStepProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
  onNext: () => void;
}

export const PurchaseMethodStep: React.FC<PurchaseMethodStepProps> = ({
  data,
  updateData,
  onNext,
}) => {
  const handleSelectMethod = (method: string) => {
    updateData({ modalidadeCompra: method });
    onNext();
  };

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
                <div className="flex items-center gap-2 mt-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-xs md:text-sm text-green-600 font-medium">
                    Segurança e comodidade
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};