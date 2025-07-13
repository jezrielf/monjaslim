import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Edit2, Send, Loader2, CheckCircle, User, Package, Calendar, MapPin } from 'lucide-react';
import { FormData } from '../FormWizard';

interface ReviewStepProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
  onSubmit: () => void;
  onPrev: () => void;
  onEdit: (step: number) => void;
  isSubmitting: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  updateData,
  onSubmit,
  onPrev,
  onEdit,
  isSubmitting,
}) => {
  const getTreatmentName = (id: string) => {
    const treatments: Record<string, string> = {
      '1-pote': 'Ação de Choque Metabólica (1 pote - 30 dias)',
      '2-potes': 'Bloqueio do Efeito Sanfona (2 potes - 60 dias)',
      '3-potes': 'Reprogramação Corporal Definitiva (3 potes - 90 dias)',
      '5-potes': 'Reprogramação Corporal Total (5 potes - 150 dias)',
    };
    return treatments[id] || id;
  };

  const getDayName = (id: string) => {
    const days: Record<string, string> = {
      segunda: 'Segunda-feira',
      terca: 'Terça-feira',
      quarta: 'Quarta-feira',
      quinta: 'Quinta-feira',
      sexta: 'Sexta-feira',
      sabado: 'Sábado',
    };
    return days[id] || id;
  };

  const getTimeName = (id: string) => {
    const times: Record<string, string> = {
      tarde: '12h às 20h',
      manha: 'Manhã do próximo dia útil',
    };
    return times[id] || id;
  };

  const getModalidadeCompraName = (id: string): string => {
    const modalidades = {
      'site-sedex': 'Site oficial + Sedex',
      'pagar-entrega': 'Pagar na entrega'
    };
    return modalidades[id as keyof typeof modalidades] || id;
  };

  const handleAcceptToggle = () => {
    updateData({ aceiteFinal: !data.aceiteFinal });
  };

  const isSiteOficial = data.modalidadeCompra === 'site-sedex';

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Revise suas informações
        </h3>
        <p className="text-muted-foreground">
          {isSiteOficial 
            ? 'Confira seu tratamento escolhido antes do redirecionamento'
            : 'Confira todos os dados antes de finalizar'
          }
        </p>
      </div>

      {/* Modalidade de Compra */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-accent" />
            <CardTitle className="text-lg">Modalidade de Compra</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(1)}
            className="text-accent border-accent hover:bg-accent/10"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{getModalidadeCompraName(data.modalidadeCompra)}</p>
        </CardContent>
      </Card>

      {/* Dados Pessoais - Only show for pagar na entrega */}
      {!isSiteOficial && (
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg">Dados Pessoais</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(2)}
              className="text-accent border-accent hover:bg-accent/10"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Nome:</span>
                <p className="font-medium">{data.nome}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Telefone:</span>
                <p className="font-medium">{data.telefone}</p>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Email:</span>
              <p className="font-medium">{data.email}</p>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <span className="text-sm text-muted-foreground">Endereço:</span>
                <p className="font-medium">
                  {data.rua}, {data.numero}
                  {data.complemento && `, ${data.complemento}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.bairro}, {data.cidade} - {data.cep}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tratamento Escolhido */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-accent" />
            <CardTitle className="text-lg">Tratamento Escolhido</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(3)}
            className="text-accent border-accent hover:bg-accent/10"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </CardHeader>
        <CardContent>
          {data.tipoTratamento ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-lg">{getTreatmentName(data.tipoTratamento)}</p>
                {data.precoTratamento && (
                  <p className="text-muted-foreground">{data.precoTratamento}</p>
                )}
              </div>
              <Badge className="bg-gradient-to-r from-[hsl(208_100%_24%)] to-[hsl(208_85%_30%)] text-white">
                Selecionado
              </Badge>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Nenhum tratamento selecionado</p>
              <p className="text-xs text-muted-foreground mt-1">Debug: tipoTratamento = "{data.tipoTratamento}"</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(3)}
                className="mt-2 text-accent border-accent hover:bg-accent/10"
              >
                Selecionar Tratamento
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agendamento - Only show for pagar na entrega */}
      {!isSiteOficial && (
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg">Agendamento</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(4)}
              className="text-accent border-accent hover:bg-accent/10"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Melhor dia:</span>
                <p className="font-medium">{getDayName(data.diaAgenda)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Melhor horário:</span>
                <p className="font-medium">{getTimeName(data.horarioAgenda)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Aceite Final */}
      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAcceptToggle}
              className={`mt-1 ${
                data.aceiteFinal
                  ? 'bg-success border-success text-success-foreground'
                  : 'border-border'
              }`}
            >
              {data.aceiteFinal ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <div className="h-4 w-4 border rounded" />
              )}
            </Button>
            <div className="flex-1">
              <p className="text-sm text-foreground leading-relaxed">
                {isSiteOficial 
                  ? 'Confirmo que escolhi o tratamento correto e autorizo o redirecionamento para o site oficial do MonjaSlim.'
                  : 'Confirmo que todas as informações estão corretas e autorizo o contato da equipe no horário informado para apresentação do tratamento escolhido.'
                }
                {!isSiteOficial && (
                  <span className="text-accent font-medium"> Não há compromisso de compra.</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrev}
          variant="outline"
          size="lg"
          className="border-border hover:bg-muted"
          disabled={isSubmitting}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Button
          onClick={onSubmit}
          disabled={!data.aceiteFinal || isSubmitting}
          className="bg-gradient-primary hover:opacity-90 shadow-glow"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isSiteOficial ? 'Redirecionando...' : 'Enviando...'}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {isSiteOficial ? 'Ir para Site Oficial' : 'Confirmar e Enviar'}
            </>
          )}
        </Button>
      </div>

      {!data.aceiteFinal && (
        <p className="text-center text-sm text-muted-foreground">
          Marque a caixa de confirmação para finalizar
        </p>
      )}
    </div>
  );
};