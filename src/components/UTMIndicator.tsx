import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { extractUTMParams } from '@/utils/tracking';

export const UTMIndicator = () => {
  const [utmData, setUtmData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const utms = extractUTMParams();
    const hasUTMs = Object.values(utms).some(value => value);
    
    if (hasUTMs) {
      setUtmData(utms);
      setIsVisible(true);
      
      // Hide after 10 seconds
      const timer = setTimeout(() => setIsVisible(false), 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible || !utmData) return null;

  const isFacebookTraffic = utmData.utm_source === 'facebook';

  return (
    <div className="fixed top-20 right-4 z-40 w-80">
      <Card className="shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{isFacebookTraffic ? '📱' : '🎯'}</span>
              <span className="font-semibold text-sm">
                {isFacebookTraffic ? 'Anúncio Facebook Detectado' : 'Campanha Detectada'}
              </span>
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            {utmData.utm_campaign && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Campanha</Badge>
                <span className="text-xs truncate">{utmData.utm_campaign}</span>
              </div>
            )}
            {utmData.utm_content && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Anúncio</Badge>
                <span className="text-xs truncate">{utmData.utm_content}</span>
              </div>
            )}
            {utmData.utm_term && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Placement</Badge>
                <span className="text-xs truncate">{utmData.utm_term}</span>
              </div>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            ✅ Tracking ativo - Dados sendo coletados para análise
          </div>
        </CardContent>
      </Card>
    </div>
  );
};