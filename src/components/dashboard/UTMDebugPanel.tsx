import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getFullTrackingData, extractUTMParams, createTrackingData, detectTrafficSource } from "@/utils/tracking";
import { useToast } from "@/hooks/use-toast";
import { useUTMDiagnostics } from "@/hooks/useUTMDiagnostics";

export const UTMDebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [testUrl, setTestUrl] = useState("?utm_source=FB&utm_campaign=CampanhaTeste|123456&utm_medium=AdsetTeste|789012&utm_content=AnuncioTeste|345678&utm_term=feed");
  const { toast } = useToast();
  const diagnostics = useUTMDiagnostics();

  const currentData = getFullTrackingData();
  const currentUTMs = extractUTMParams();

  const simulateUTMCapture = () => {
    // Temporarily change URL to test UTM capture
    const originalUrl = window.location.href;
    window.history.pushState({}, '', testUrl);
    
    const testUTMs = extractUTMParams();
    const testTracking = createTrackingData();
    
    // Restore original URL
    window.history.pushState({}, '', originalUrl);
    
    console.log('🧪 UTM Test Results:', testTracking);
    
    toast({
      title: "Teste de UTMs Realizado",
      description: `Capturados: ${Object.values(testUTMs).filter(v => v).length} parâmetros`,
    });
  };

  if (!isVisible) {
    const hasIssues = !diagnostics.hasCurrentUTMs || diagnostics.recentLeadsWithoutUTMs > 0;
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          variant={hasIssues ? "destructive" : "outline"}
          size="sm" 
          onClick={() => setIsVisible(true)}
          className="shadow-lg"
        >
          🔍 Debug UTMs
          {hasIssues && <span className="ml-1 text-xs">⚠️</span>}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Debug UTM Tracking</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsVisible(false)}
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Diagnostics Summary */}
          <div>
            <Label className="text-xs font-semibold">Status do Tracking</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Badge variant={diagnostics.hasCurrentUTMs ? "default" : "destructive"} className="text-xs">
                {diagnostics.hasCurrentUTMs ? '✅ UTMs OK' : '❌ Sem UTMs'}
              </Badge>
              <Badge variant={diagnostics.isFacebookTraffic ? "default" : "secondary"} className="text-xs">
                {diagnostics.isFacebookTraffic ? '📱 Facebook' : '🌐 Outros'}
              </Badge>
              <Badge variant={diagnostics.sessionHasTracking ? "default" : "destructive"} className="text-xs">
                {diagnostics.sessionHasTracking ? '✅ Sessão' : '❌ Sem Sessão'}
              </Badge>
              <Badge variant={diagnostics.recentLeadsWithoutUTMs === 0 ? "default" : "destructive"} className="text-xs">
                {diagnostics.recentLeadsWithoutUTMs === 0 ? '✅ DB OK' : `❌ ${diagnostics.recentLeadsWithoutUTMs} sem UTM`}
              </Badge>
            </div>
          </div>

          {/* Current UTMs */}
          <div>
            <Label className="text-xs font-semibold">UTMs Atuais ({diagnostics.utmCount}/7)</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {Object.entries(currentUTMs).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1">
                  <Badge variant={value ? "default" : "secondary"} className="text-xs">
                    {key.replace('utm_', '')}
                  </Badge>
                  <span className="text-xs truncate">{value || 'vazio'}</span>
                </div>
              ))}
            </div>
            {diagnostics.missingParameters.length > 0 && (
              <p className="text-xs text-destructive mt-1">
                Faltando: {diagnostics.missingParameters.join(', ')}
              </p>
            )}
          </div>

          {/* Session Info */}
          <div>
            <Label className="text-xs font-semibold">Sessão Atual</Label>
            <div className="text-xs space-y-1">
              <p>ID: {currentData.tracking_data?.session_id?.slice(-8) || 'N/A'}</p>
              <p>Tempo: {currentData.total_session_time}</p>
              <p>Eventos: {currentData.funnel_events?.length || 0}</p>
              <p>Referrer: {document.referrer || 'Direto'}</p>
            </div>
          </div>

          {/* Traffic Detection */}
          <div>
            <Label className="text-xs font-semibold">Detecção de Tráfego</Label>
            <div className="text-xs space-y-1">
              {(() => {
                const detected = detectTrafficSource();
                return (
                  <>
                    <p>Fonte: {detected.source}</p>
                    <p>Meio: {detected.medium}</p>
                    <p>Social: {detected.isSocial ? 'Sim' : 'Não'}</p>
                  </>
                );
              })()}
            </div>
          </div>

          {/* UTM Test */}
          <div>
            <Label className="text-xs font-semibold">Testar Captura</Label>
            <Input
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="?utm_source=facebook&utm_medium=cpc..."
              className="text-xs mt-1"
            />
            <Button 
              size="sm" 
              onClick={simulateUTMCapture}
              className="w-full mt-2"
            >
              🧪 Simular Captura
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => console.log('Full tracking data:', currentData)}
            >
              📋 Log Data
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '?utm_source=FB&utm_campaign=teste|123&utm_medium=adset|456&utm_content=debug|789&utm_term=manual'}
            >
              🔗 Test URL
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};