import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Sheet, Zap, Shield } from 'lucide-react';

export const IntegrationInfo: React.FC = () => {
  return (
    <Card className="border-accent/20 bg-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-accent" />
          Integrações Disponíveis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
            <Database className="h-8 w-8 text-success" />
            <div>
              <p className="font-medium text-foreground">Supabase</p>
              <p className="text-sm text-muted-foreground">Banco de dados seguro</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                Pronto para ativar
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
            <Sheet className="h-8 w-8 text-success" />
            <div>
              <p className="font-medium text-foreground">Google Sheets</p>
              <p className="text-sm text-muted-foreground">Planilha automática</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                Pronto para ativar
              </Badge>
            </div>
          </div>
        </div>

        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Para ativar as integrações com backend:
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Clique no botão verde "Supabase" no canto superior direito da interface 
                para conectar seu projeto e ativar armazenamento de dados e integrações.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};