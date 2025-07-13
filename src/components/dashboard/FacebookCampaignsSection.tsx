import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CampaignData } from "@/hooks/useCampaignAnalytics";

interface FacebookCampaignsSectionProps {
  campaigns: CampaignData[];
}

export const FacebookCampaignsSection = ({ campaigns }: FacebookCampaignsSectionProps) => {
  const facebookCampaigns = campaigns.filter(c => c.utm_source === 'Facebook');
  
  if (facebookCampaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📱 Campanhas do Facebook
            <Badge variant="secondary">0 campanhas</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma campanha do Facebook detectada.</p>
            <p className="text-sm mt-2">
              Verifique se os UTMs estão sendo enviados corretamente:
              <br />
              <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">
                utm_source=facebook&utm_medium=cpc&utm_campaign=...
              </code>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📱 Campanhas do Facebook
          <Badge variant="default">{facebookCampaigns.length} campanhas</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {facebookCampaigns.map((campaign, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">
                  {campaign.utm_campaign}
                </h4>
                <Badge variant={campaign.conversion_rate > 50 ? "default" : "secondary"}>
                  {campaign.conversion_rate.toFixed(1)}% conversão
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Anúncio:</span>
                  <p className="font-medium">{campaign.utm_content}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Placement:</span>
                  <p className="font-medium">{campaign.utm_term}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{campaign.total_leads}</p>
                  <p className="text-xs text-muted-foreground">Leads</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{campaign.conversions}</p>
                  <p className="text-xs text-muted-foreground">Conversões</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-muted-foreground">
                    {Math.round(campaign.avg_time_seconds / 60)}min
                  </p>
                  <p className="text-xs text-muted-foreground">Tempo Médio</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};