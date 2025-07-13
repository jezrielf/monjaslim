import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TimeSeriesData } from "@/hooks/useCampaignAnalytics";

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  title: string;
}

export const TimeSeriesChart = ({ data, title }: TimeSeriesChartProps) => {
  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('pt-BR', { 
      month: 'short', 
      day: 'numeric' 
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--card-foreground))"
              }}
            />
            <Line 
              type="monotone" 
              dataKey="leads" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Leads"
            />
            <Line 
              type="monotone" 
              dataKey="conversions" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              name="Conversões"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};