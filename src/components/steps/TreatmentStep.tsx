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
    id: '3-potes',
    name: '3 Potes',
    description: 'Tratamento mais vendido',
    originalPrice: 'R$997,00',
    installments: '12x R$33,08',
    pixPrice: 'R$397,00',
    popular: false,
    image: 'https://monjaslim.site/wp-content/uploads/2025/07/3-potes--300x251.jpg',
  },
  {
    id: '5-potes',
    name: '5 Potes',
    description: 'Máximo resultado',
    originalPrice: 'R$1.712,00',
    installments: '12x R$45,58',
    pixPrice: 'R$547,00',
    popular: true,
    image: 'https://monjaslim.site/wp-content/uploads/2025/07/5-potes--300x251.jpg',
  },
  {
    id: '2-potes',
    name: '2 Potes',
    description: 'Para iniciantes',
    originalPrice: 'R$697,00',
    installments: '12x R$24,75',
    pixPrice: 'R$297,00',
    popular: false,
    image: 'https://monjaslim.site/wp-content/uploads/2025/07/2-potes--300x251.jpg',
  },
  {
    id: '1-pote',
    name: '1 Pote',
    description: 'Para testar',
    originalPrice: 'R$397,00',
    installments: '12x R$16,41',
    pixPrice: 'R$197,00',
    popular: false,
    image: 'https://monjaslim.site/wp-content/uploads/2025/07/1-pote--300x251.jpg',
  },
];

export const TreatmentStep: React.FC<TreatmentStepProps> = ({
  data,
  updateData,
  onNext,
  onPrev,
}) => {
  const [selectedTreatment, setSelectedTreatment] = useState(data.tipoTratamento || '5-potes');
  const [error, setError] = useState('');

  const handleTreatmentSelect = (treatmentId: string) => {
    const treatment = treatments.find(t => t.id === treatmentId);
    if (treatment) {
      setSelectedTreatment(treatmentId);
      updateData({
        tipoTratamento: treatmentId,
        precoTratamento: `${treatment.installments} ou ${treatment.pixPrice} no Pix`,
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
                <Badge className="bg-gradient-to-r from-[hsl(208_100%_24%)] to-[hsl(208_85%_30%)] text-white px-3 py-1">
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
              {/* Imagem do produto */}
              <div className="flex justify-center mb-4">
                <img 
                  src={treatment.image} 
                  alt={treatment.name}
                  className="w-24 h-24 object-contain rounded-lg"
                />
              </div>

              <div className="text-center space-y-2">
                <div className="text-sm text-red-600 font-bold line-through">
                  De {treatment.originalPrice}
                </div>
                <div className="text-lg font-bold text-foreground">
                  {treatment.installments} sem juros
                </div>
                <div className="text-sm text-muted-foreground">
                  ou <span className="text-green-600 font-bold">{treatment.pixPrice} no Pix</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>✓ Garantia de 30 dias</div>
                  <div>✓ Frete grátis para todo Brasil</div>
                  <div>✓ Suporte especializado</div>
                  {treatment.id === '5-potes' && (
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