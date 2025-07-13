import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FunnelStepData } from "@/hooks/useFunnelAnalytics";

interface FunnelChartProps {
  data: FunnelStepData[];
  title: string;
}

export const FunnelChart = ({ data, title }: FunnelChartProps) => {
  const maxValue = Math.max(...data.map(step => step.total_entries));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((step, index) => {
            const width = maxValue > 0 ? (step.completions / maxValue) * 100 : 0;
            const completion = step.total_entries > 0 ? (step.completions / step.total_entries) * 100 : 0;
            
            return (
              <div key={step.step_number} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">
                    {step.step}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {step.completions} ({completion.toFixed(1)}%)
                  </span>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-muted rounded-full h-6">
                    <div 
                      className="bg-gradient-primary h-6 rounded-full transition-all duration-300 flex items-center justify-center"
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-xs font-medium text-primary-foreground">
                        {step.completions}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Drop-off: {step.drop_off_rate.toFixed(1)}%</span>
                  <span>Tempo médio: {Math.round(step.avg_time_seconds)}s</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};