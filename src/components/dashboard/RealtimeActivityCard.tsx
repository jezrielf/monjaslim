import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, Clock, AlertCircle } from "lucide-react";
import { useRealtimeTracking } from "@/hooks/useRealtimeTracking";

export const RealtimeActivityCard = () => {
  const { realtimeData, isConnected } = useRealtimeTracking();

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - eventTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s atrás`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}min atrás`;
    } else {
      return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    }
  };

  const getStepName = (stepNumber: number) => {
    const steps: { [key: number]: string } = {
      1: "Modalidade",
      2: "Dados Pessoais", 
      3: "Tratamento",
      4: "Agendamento",
      5: "Revisão"
    };
    return steps[stepNumber] || `Etapa ${stepNumber}`;
  };

  const getModalityDisplay = (modality: string) => {
    if (modality === 'site-sedex') return 'Site Oficial';
    if (modality === 'pagar-entrega') return 'Pagar na Entrega';
    return modality;
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Atividade em Tempo Real</CardTitle>
          {realtimeData.isUsingFallback ? (
            <Badge variant="outline" className="ml-2">
              <AlertCircle className="h-3 w-3 mr-1" />
              Dados Históricos (24h)
            </Badge>
          ) : isConnected ? (
            <Badge variant="default" className="ml-2 animate-pulse">
              🔴 AO VIVO
            </Badge>
          ) : (
            <Badge variant="secondary" className="ml-2">
              ⚪ OFFLINE
            </Badge>
          )}
        </div>
        {realtimeData.lastActivity && (
          <div className="text-xs text-muted-foreground">
            Última atividade: {formatTimeAgo(realtimeData.lastActivity)}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Online */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Pessoas Online</span>
            </div>
            <div className="text-3xl font-bold text-primary">
              {realtimeData.totalOnline}
            </div>
            <p className="text-xs text-muted-foreground">
              {realtimeData.isUsingFallback ? 'Últimas 24 horas' : 'Últimos 30 minutos'}
            </p>
          </div>

          {/* Por Etapa */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Por Etapa</span>
            </div>
            <div className="space-y-1">
              {Array.from(realtimeData.usersByStep.entries())
                .sort(([a], [b]) => a - b)
                .map(([step, count]) => (
                  <div key={step} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {getStepName(step)}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              {realtimeData.usersByStep.size === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhuma atividade recente
                </p>
              )}
            </div>
          </div>

          {/* Atividade Recente */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Atividade Recente</span>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {realtimeData.recentActivity.map((activity, index) => (
                <div 
                  key={`${activity.lead_id}-${index}`}
                  className="text-xs p-2 bg-muted/50 rounded-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">
                        {getStepName(activity.step_number)}
                      </span>
                      <div className="text-muted-foreground">
                        {getModalityDisplay(activity.modalidade_compra)}
                      </div>
                    </div>
                    <span className="text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              {realtimeData.recentActivity.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhuma atividade recente
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Por Modalidade */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Distribuição por Modalidade</h4>
          <div className="grid grid-cols-2 gap-4">
            {Array.from(realtimeData.usersByModality.entries()).map(([modality, count]) => (
              <div key={modality} className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                <span className="text-sm">{getModalityDisplay(modality)}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};