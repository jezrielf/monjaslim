import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Loader, TrendingUp, Users, MousePointer, DollarSign, Filter, Calendar, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRange } from 'react-day-picker';

interface Lead {
  id: string;
  created_at: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  modalidade_compra: string;
  tipo_tratamento: string;
  preco_tratamento: string;
  aceite_final: boolean;
}

interface DashboardFilters {
  dateRange?: DateRange;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: undefined,
    utmSource: 'all',
    utmMedium: 'all',
    utmCampaign: 'all',
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply date filters
      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }

      // Apply UTM filters
      if (filters.utmSource !== 'all') {
        query = query.eq('utm_source', filters.utmSource);
      }
      if (filters.utmMedium !== 'all') {
        query = query.eq('utm_medium', filters.utmMedium);
      }
      if (filters.utmCampaign !== 'all') {
        query = query.eq('utm_campaign', filters.utmCampaign);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  // Analytics calculations
  const totalLeads = leads.length;
  const conversions = leads.filter(lead => lead.aceite_final).length;
  const conversionRate = totalLeads > 0 ? (conversions / totalLeads * 100).toFixed(1) : '0';

  // Group leads by source
  const leadsBySource = leads.reduce((acc, lead) => {
    const source = lead.utm_source || 'Direct';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sourceData = Object.entries(leadsBySource).map(([name, value]) => ({ name, value }));

  // Group leads by date for timeline
  const leadsByDate = leads.reduce((acc, lead) => {
    const date = new Date(lead.created_at).toLocaleDateString('pt-BR');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const timelineData = Object.entries(leadsByDate)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, leads]) => ({ date, leads }));

  // Campaign performance
  const campaignData = leads.reduce((acc, lead) => {
    const campaign = lead.utm_campaign || 'Sem campanha';
    if (!acc[campaign]) {
      acc[campaign] = { name: campaign, leads: 0, conversions: 0 };
    }
    acc[campaign].leads++;
    if (lead.aceite_final) {
      acc[campaign].conversions++;
    }
    return acc;
  }, {} as Record<string, { name: string; leads: number; conversions: number }>);

  const campaignPerformance = Object.values(campaignData).map(camp => ({
    ...camp,
    conversionRate: camp.leads > 0 ? (camp.conversions / camp.leads * 100).toFixed(1) : '0'
  }));

  // Get unique values for filters
  const uniqueSources = [...new Set(leads.map(l => l.utm_source).filter(Boolean))];
  const uniqueMediums = [...new Set(leads.map(l => l.utm_medium).filter(Boolean))];
  const uniqueCampaigns = [...new Set(leads.map(l => l.utm_campaign).filter(Boolean))];

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 pt-20">
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 pt-20">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">
              Dashboard Analytics
            </h1>
            <p className="text-muted-foreground">
              Acompanhe a performance das suas campanhas e leads
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Período</label>
                  <DatePickerWithRange
                    date={filters.dateRange}
                    onDateChange={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Fonte</label>
                  <Select
                    value={filters.utmSource}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, utmSource: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as fontes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as fontes</SelectItem>
                      {uniqueSources.map(source => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Meio</label>
                  <Select
                    value={filters.utmMedium}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, utmMedium: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os meios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os meios</SelectItem>
                      {uniqueMediums.map(medium => (
                        <SelectItem key={medium} value={medium}>{medium}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Campanha</label>
                  <Select
                    value={filters.utmCampaign}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, utmCampaign: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as campanhas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as campanhas</SelectItem>
                      {uniqueCampaigns.map(campaign => (
                        <SelectItem key={campaign} value={campaign}>{campaign}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalLeads}</div>
                <p className="text-xs text-muted-foreground">
                  Leads capturados no período
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversões</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{conversions}</div>
                <p className="text-xs text-muted-foreground">
                  Leads que aceitaram a proposta
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Percentual de conversão
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fontes Ativas</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueSources.length}</div>
                <p className="text-xs text-muted-foreground">
                  Diferentes fontes de tráfego
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Leads por Fonte</CardTitle>
                <CardDescription>Distribuição de leads por origem do tráfego</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline de Leads</CardTitle>
                <CardDescription>Evolução de leads ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="leads" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Performance Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Performance por Campanha</CardTitle>
              <CardDescription>Análise detalhada de cada campanha</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>Conversões</TableHead>
                    <TableHead>Taxa de Conversão</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignPerformance.map((campaign) => (
                    <TableRow key={campaign.name}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>{campaign.leads}</TableCell>
                      <TableCell>{campaign.conversions}</TableCell>
                      <TableCell>{campaign.conversionRate}%</TableCell>
                      <TableCell>
                        <Badge variant={parseFloat(campaign.conversionRate) > 20 ? "default" : "secondary"}>
                          {parseFloat(campaign.conversionRate) > 20 ? "Boa" : "Regular"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <CardTitle>Leads Recentes</CardTitle>
              <CardDescription>Últimos leads capturados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Fonte</TableHead>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.slice(0, 10).map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.nome}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.cidade}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{lead.utm_source || 'Direct'}</Badge>
                      </TableCell>
                      <TableCell>{lead.utm_campaign || '-'}</TableCell>
                      <TableCell>
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={lead.aceite_final ? "default" : "secondary"}>
                          {lead.aceite_final ? "Convertido" : "Lead"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}