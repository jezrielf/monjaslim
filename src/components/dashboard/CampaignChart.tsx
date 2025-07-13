import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CampaignData } from "@/hooks/useCampaignAnalytics";

interface CampaignChartProps {
  data: CampaignData[];
  title: string;
}

export const CampaignChart = ({ data, title }: CampaignChartProps) => {
  const chartData = data.slice(0, 10).map(campaign => ({
    name: `${campaign.utm_source}/${campaign.utm_campaign}`.substring(0, 20),
    leads: campaign.total_leads,
    conversions: campaign.conversions,
    conversion_rate: campaign.conversion_rate,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
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
            <Bar dataKey="leads" fill="hsl(var(--primary))" name="Leads" />
            <Bar dataKey="conversions" fill="hsl(var(--success))" name="Conversões" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};