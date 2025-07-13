import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { FormData } from '../FormWizard';

interface SchedulingStepProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const daysOptions = [
  { id: 'segunda', name: 'Segunda-feira', available: true },
  { id: 'terca', name: 'Terça-feira', available: true },
  { id: 'quarta', name: 'Quarta-feira', available: true },
  { id: 'quinta', name: 'Quinta-feira', available: true },
  { id: 'sexta', name: 'Sexta-feira', available: true },
  { id: 'sabado', name: 'Sábado', available: true },
];

const timeOptions = [
  { id: '12:00', name: '12:00', description: 'Meio-dia', popular: false },
  { id: '13:00', name: '13:00', description: '13 horas', popular: false },
  { id: '14:00', name: '14:00', description: '14 horas', popular: true },
  { id: '15:00', name: '15:00', description: '15 horas', popular: false },
  { id: '16:00', name: '16:00', description: '16 horas', popular: false },
  { id: '17:00', name: '17:00', description: '17 horas', popular: false },
  { id: '18:00', name: '18:00', description: '18 horas', popular: false },
  { id: '19:00', name: '19:00', description: '19 horas', popular: false },
  { id: '20:00', name: '20:00', description: '20 horas', popular: false },
  { id: 'manha', name: 'Manhã do próximo dia útil', description: 'Período da manhã', popular: false },
];

export const SchedulingStep: React.FC<SchedulingStepProps> = ({
  data,
  updateData,
  onNext,
  onPrev,
}) => {
  const [selectedDay, setSelectedDay] = useState(data.diaAgenda);
  const [selectedTime, setSelectedTime] = useState(data.horarioAgenda);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDaySelect = (dayId: string) => {
    setSelectedDay(dayId);
    updateData({ diaAgenda: dayId });
    setErrors({ ...errors, dia: '' });
  };

  const handleTimeSelect = (timeId: string) => {
    setSelectedTime(timeId);
    updateData({ horarioAgenda: timeId });
    setErrors({ ...errors, horario: '' });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedDay) {
      newErrors.dia = 'Selecione um dia da semana';
    }

    if (!selectedTime) {
      newErrors.horario = 'Selecione um horário';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Quando podemos entrar em contato?
        </h3>
        <p className="text-muted-foreground">
          Escolha o melhor dia e horário para nossa equipe ligar
        </p>
      </div>

      {/* Seleção do dia */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-accent" />
          <h4 className="text-lg font-medium text-foreground">Melhor dia da semana</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {daysOptions.map((day) => (
            <Card
              key={day.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedDay === day.id
                  ? 'border-accent bg-accent/10 shadow-md'
                  : 'border-border hover:border-accent/50 hover:bg-muted/50'
              }`}
              onClick={() => handleDaySelect(day.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-sm font-medium text-foreground">
                  {day.name}
                </div>
                {day.available && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Disponível
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {errors.dia && (
          <p className="text-sm text-destructive text-center">{errors.dia}</p>
        )}
      </div>

      {/* Seleção do horário */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-accent" />
          <h4 className="text-lg font-medium text-foreground">Melhor horário</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {timeOptions.map((time) => (
            <Card
              key={time.id}
              className={`relative cursor-pointer transition-all duration-200 ${
                selectedTime === time.id
                  ? 'border-accent bg-accent/10 shadow-md'
                  : 'border-border hover:border-accent/50 hover:bg-muted/50'
              } ${time.popular ? 'ring-1 ring-accent/30' : ''} ${
                time.id === 'manha' ? 'md:col-span-2 lg:col-span-3' : ''
              }`}
              onClick={() => handleTimeSelect(time.id)}
            >
              {time.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-gold text-accent-foreground text-xs">
                    Mais procurado
                  </Badge>
                </div>
              )}

              <CardContent className="p-3 text-center">
                <div className="text-sm font-medium text-foreground">
                  {time.name}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {time.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {errors.horario && (
          <p className="text-sm text-destructive text-center">{errors.horario}</p>
        )}
      </div>

      {/* Informações adicionais */}
      <Card className="bg-muted/30 border-accent/20">
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>📞 Ligação gratuita e sem compromisso</p>
            <p>⏱️ Duração aproximada: 5 a 10 minutos</p>
            <p>🎯 Consultoria personalizada para seu caso</p>
          </div>
        </CardContent>
      </Card>

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