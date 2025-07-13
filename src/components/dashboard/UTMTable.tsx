import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CampaignData } from "@/hooks/useCampaignAnalytics";

interface UTMTableProps {
  data: CampaignData[];
  title: string;
}

export const UTMTable = ({ data, title }: UTMTableProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getConversionRateBadge = (rate: number) => {
    if (rate >= 20) return { variant: "default" as const, label: "Excelente" };
    if (rate >= 10) return { variant: "secondary" as const, label: "Bom" };
    if (rate >= 5) return { variant: "outline" as const, label: "Regular" };
    return { variant: "destructive" as const, label: "Baixo" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">Source</TableHead>
                <TableHead className="text-muted-foreground">Campaign</TableHead>
                <TableHead className="text-muted-foreground">Content</TableHead>
                <TableHead className="text-muted-foreground">Term</TableHead>
                <TableHead className="text-right text-muted-foreground">Leads</TableHead>
                <TableHead className="text-right text-muted-foreground">Conversões</TableHead>
                <TableHead className="text-right text-muted-foreground">Taxa</TableHead>
                <TableHead className="text-right text-muted-foreground">Tempo Médio</TableHead>
                <TableHead className="text-center text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((campaign, index) => {
                const badge = getConversionRateBadge(campaign.conversion_rate);
                return (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-foreground">
                      {campaign.utm_source}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {campaign.utm_campaign}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {campaign.utm_content}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {campaign.utm_term}
                    </TableCell>
                    <TableCell className="text-right text-foreground font-semibold">
                      {campaign.total_leads}
                    </TableCell>
                    <TableCell className="text-right text-success font-semibold">
                      {campaign.conversions}
                    </TableCell>
                    <TableCell className="text-right text-foreground font-semibold">
                      {campaign.conversion_rate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatTime(campaign.avg_time_seconds)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={badge.variant}>
                        {badge.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};