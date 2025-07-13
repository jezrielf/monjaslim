import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Check, Star } from 'lucide-react';
import { FormData } from '../FormWizard';

interface TreatmentStepProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const treatments = [
  {
    id: 'prime',
    name: 'Tratamento Prime',
    description: '3 potes - Mais vendido',
    installments: '12x R$33,08',
    fullPrice: 'R$397',
    discount: '20% OFF',
    popular: false,
  },
  {
    id: 'power',
    name: 'Tratamento Power',
    description: '5 potes - Resultado garantido',
    installments: '12x R$45,58',
    fullPrice: 'R$547',
    discount: '25% OFF',
    popular: true,
  },
  {
    id: 'plus',
    name: 'Tratamento Plus',
    description: '2 potes - Recomendado',
    installments: '12x R$24,75',
    fullPrice: 'R$297',
    discount: '15% OFF',
    popular: false,
  },
  {
    id: 'teste',
    name: 'Tratamento Teste',
    description: '1 pote para experimentar',
    installments: '12x R$16,42',
    fullPrice: 'R$197',
    discount: '10% OFF',
    popular: false,
  },
];

export const TreatmentStep: React.FC<TreatmentStepProps> = ({
  data,
  updateData,
  onNext,
  onPrev,
}) => {
  const [selectedTreatment, setSelectedTreatment] = useState(data.tipoTratamento);
  const [error, setError] = useState('');

  const handleTreatmentSelect = (treatmentId: string) => {
    const treatment = treatments.find(t => t.id === treatmentId);
    if (treatment) {
      setSelectedTreatment(treatmentId);
      updateData({
        tipoTratamento: treatmentId,
        precoTratamento: `${treatment.installments} ou ${treatment.fullPrice} à vista`,
      });
      setError('');
    }
  };

  const handleNext = () => {
    if (!selectedTreatment) {
      setError('Selecione um tratamento para continuar');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Escolha o melhor tratamento para você
        </h3>
        <p className="text-muted-foreground">
          Todos os planos incluem garantia de 30 dias
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {treatments.map((treatment) => (
          <Card
            key={treatment.id}
            className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedTreatment === treatment.id
                ? 'border-accent shadow-teal bg-card/80'
                : 'border-border hover:border-accent/50'
            } ${treatment.popular ? 'ring-2 ring-accent' : ''}`}
            onClick={() => handleTreatmentSelect(treatment.id)}
          >
            {treatment.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-[hsl(194_100%_27%)] to-[hsl(194_85%_35%)] text-white px-3 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{treatment.name}</CardTitle>
                {selectedTreatment === treatment.id && (
                  <div className="bg-success rounded-full p-1">
                    <Check className="w-4 h-4 text-success-foreground" />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {treatment.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {treatment.installments}
                </div>
                <div className="text-sm text-muted-foreground">
                  ou {treatment.fullPrice} à vista
                </div>
              </div>

              <div className="text-center">
                <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                  {treatment.discount}
                </Badge>
              </div>

              <div className="pt-2">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>✓ Garantia de 30 dias</div>
                  <div>✓ Frete grátis para todo Brasil</div>
                  <div>✓ Suporte especializado</div>
                  {treatment.id === 'power' && (
                    <div className="text-accent">✓ Resultado garantido ou dinheiro de volta</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <div className="text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrev}
          variant="outline"
          size="lg"
          className="border-border hover:bg-muted"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Button
          onClick={handleNext}
          className="bg-gradient-primary hover:opacity-90 shadow-glow"
          size="lg"
        >
          Próximo
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};