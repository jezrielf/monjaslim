import { useState } from "react";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Target,
  BarChart3,
  PieChart,
  TrendingDown,
  RefreshCw
} from "lucide-react";
import { useCampaignAnalytics } from "@/hooks/useCampaignAnalytics";
import { useFunnelAnalytics } from "@/hooks/useFunnelAnalytics";
import { useQueryClient } from "@tanstack/react-query";
import { KPICard } from "@/components/dashboard/KPICard";
import { CampaignChart } from "@/components/dashboard/CampaignChart";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { TimeSeriesChart } from "@/components/dashboard/TimeSeriesChart";
import { UTMTable } from "@/components/dashboard/UTMTable";
import { DateRangePicker, DateRange } from "@/components/dashboard/DateRangePicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date(),
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const queryClient = useQueryClient();
  const { data: campaignData, isLoading: campaignLoading } = useCampaignAnalytics(dateRange);
  const { data: funnelData, isLoading: funnelLoading } = useFunnelAnalytics(dateRange);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["campaign-analytics"] });
    await queryClient.invalidateQueries({ queryKey: ["funnel-analytics"] });
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  if (campaignLoading || funnelLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Carregando dados...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background p-6 pt-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Analítico
          </h1>
          <p className="text-muted-foreground">
            Análise completa de campanhas, funil de conversão e performance UTM
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
          <DateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange}
          />
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="whitespace-nowrap"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <Button variant="outline" className="whitespace-nowrap">
            Exportar Dados
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total de Leads"
          value={formatNumber(campaignData?.kpis.total_leads || 0)}
          icon={Users}
          subtitle="no período selecionado"
        />
        <KPICard
          title="Taxa de Conversão"
          value={`${(campaignData?.kpis.overall_conversion_rate || 0).toFixed(1)}%`}
          icon={TrendingUp}
          subtitle="conversão geral"
        />
        <KPICard
          title="Tempo Médio no Funil"
          value={formatTime(campaignData?.kpis.avg_funnel_time || 0)}
          icon={Clock}
          subtitle="desde entrada até conversão"
        />
        <KPICard
          title="Total de Conversões"
          value={formatNumber(campaignData?.kpis.total_conversions || 0)}
          icon={Target}
          subtitle="leads finalizados"
        />
      </div>

      {/* Modalidade Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <PieChart className="h-5 w-5" />
              Performance por Modalidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <div>
                  <div className="font-semibold text-foreground">Site Oficial</div>
                  <div className="text-sm text-muted-foreground">Compra direta online</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">
                    {formatNumber(campaignData?.kpis.site_oficial_count || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">leads</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <div>
                  <div className="font-semibold text-foreground">Pagar na Entrega</div>
                  <div className="text-sm text-muted-foreground">Pagamento na entrega</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">
                    {formatNumber(campaignData?.kpis.pagar_entrega_count || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">leads</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5" />
              Top 5 Campanhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaignData?.campaigns
                .sort((a, b) => b.total_leads - a.total_leads)
                .slice(0, 5)
                .map((campaign, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {campaign.utm_campaign}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {campaign.utm_source}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold text-foreground">
                        {campaign.total_leads}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {campaign.conversion_rate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="campaigns" className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="funnel">Funil</TabsTrigger>
          <TabsTrigger value="timeline">Evolução</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CampaignChart
              data={campaignData?.campaigns || []}
              title="Performance de Campanhas (Top 10)"
            />
            <UTMTable
              data={campaignData?.campaigns.slice(0, 10) || []}
              title="Detalhes das Campanhas"
            />
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <FunnelChart
              data={funnelData?.overallFunnel || []}
              title="Funil de Conversão Geral"
            />
            
            <div className="space-y-6">
              {funnelData?.modalityFunnels.map((modality, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">
                      Funil - {modality.modalidade}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {modality.total_leads}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Leads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-success">
                          {modality.conversion_rate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Taxa Conversão</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <TimeSeriesChart
            data={campaignData?.timeSeries || []}
            title="Evolução de Leads e Conversões"
          />
        </TabsContent>
      </Tabs>

      {/* Detailed UTM Table */}
      <UTMTable
        data={campaignData?.campaigns || []}
        title="Análise Completa de UTMs"
      />
      </div>
    </>
  );
};

export default Dashboard;