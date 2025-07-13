import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, TrendingUp } from "lucide-react";
import { useRealtimeTracking } from "@/hooks/useRealtimeTracking";

export const FunnelStepsLive = () => {
  const { realtimeData } = useRealtimeTracking();

  const steps = [
    { number: 1, name: "Modalidade", description: "Escolha do método" },
    { number: 2, name: "Dados Pessoais", description: "Preenchimento do formulário" },
    { number: 3, name: "Tratamento", description: "Seleção do produto" },
    { number: 4, name: "Agendamento", description: "Escolha de data/hora" },
    { number: 5, name: "Revisão", description: "Finalização do pedido" }
  ];

  const getStepUsers = (stepNumber: number) => {
    return realtimeData.usersByStep.get(stepNumber) || 0;
  };

  const getStepActivity = (stepNumber: number) => {
    const users = getStepUsers(stepNumber);
    if (users === 0) return 'inactive';
    if (users >= 3) return 'high';
    if (users >= 1) return 'medium';
    return 'low';
  };

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  const getActivityText = (activity: string) => {
    switch (activity) {
      case 'high': return 'Alta atividade';
      case 'medium': return 'Atividade moderada';
      case 'low': return 'Baixa atividade';
      default: return 'Inativo';
    }
  };

  const maxUsers = Math.max(...Array.from(realtimeData.usersByStep.values()), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Funil em Tempo Real
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {steps.map((step, index) => {
            const users = getStepUsers(step.number);
            const activity = getStepActivity(step.number);
            const progressPercentage = maxUsers > 0 ? (users / maxUsers) * 100 : 0;

            return (
              <div key={step.number} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-6 bg-border" />
                )}
                
                <div className="flex items-center gap-4">
                  {/* Step indicator */}
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 
                    ${activity !== 'inactive' 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : 'border-muted bg-muted text-muted-foreground'
                    }
                  `}>
                    <span className="text-sm font-bold">{step.number}</span>
                  </div>

                  {/* Step content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{step.name}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="secondary" 
                          className={`${getActivityColor(activity)} text-white`}
                        >
                          {getActivityText(activity)}
                        </Badge>
                        
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{users}</span>
                          <span className="text-muted-foreground">online</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <Progress 
                        value={progressPercentage} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Atividade relativa</span>
                        <span>{progressPercentage.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {realtimeData.totalOnline}
              </div>
              <p className="text-xs text-muted-foreground">
                {realtimeData.isUsingFallback ? 'Dados históricos (24h)' : 'Total no funil'}
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {realtimeData.usersByStep.size}
              </div>
              <p className="text-xs text-muted-foreground">Etapas ativas</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};