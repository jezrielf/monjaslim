
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, X, Eye } from "lucide-react";
import { useThermalPrint } from "@/hooks/useThermalPrint";

interface ThermalPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLeads: any[];
  onPrint: () => void;
}

export const ThermalPrintModal = ({ 
  open, 
  onOpenChange, 
  selectedLeads, 
  onPrint 
}: ThermalPrintModalProps) => {
  const { printLabels } = useThermalPrint();

  const handlePrint = () => {
    printLabels(selectedLeads);
    onPrint();
    onOpenChange(false);
  };

  const handlePreview = () => {
    // Abrir prévia sem imprimir
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      const { printLabels } = useThermalPrint();
      // Gerar HTML mas não imprimir automaticamente
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Prévia das Etiquetas</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .preview-note { 
                background: #f0f0f0; 
                padding: 10px; 
                margin-bottom: 20px; 
                border-radius: 5px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="preview-note">
              <h2>📋 Prévia das Etiquetas Térmicas</h2>
              <p>Esta é uma prévia das ${selectedLeads.length} etiqueta(s) que serão impressas.</p>
              <p><strong>Configuração:</strong> 100x150mm | Impressora Térmica</p>
            </div>
            ${selectedLeads.map(lead => `
              <div style="border: 2px solid #000; width: 300px; height: 450px; margin: 20px 0; padding: 15px; font-family: monospace; font-size: 12px; background: white;">
                <div style="text-align: center; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
                  🏷️ PEDIDO MONJASLIM
                </div>
                <div style="margin-bottom: 10px;">
                  <div style="font-weight: bold;">👤 ${lead.nome || 'N/A'}</div>
                  <div>📞 ${lead.telefone || 'N/A'}</div>
                </div>
                <div style="margin-bottom: 10px;">
                  <div style="font-weight: bold; border-bottom: 1px dashed #000;">📍 ENDEREÇO:</div>
                  <div>${[lead.rua, lead.numero].filter(Boolean).join(', ')}</div>
                  <div>${[lead.bairro, lead.cidade].filter(Boolean).join(' - ')}</div>
                  <div>${lead.cep ? `CEP: ${lead.cep}` : ''}</div>
                </div>
                <div style="margin-bottom: 10px;">
                  <div style="font-weight: bold; border-bottom: 1px dashed #000;">📦 PRODUTO:</div>
                  <div style="font-weight: bold;">${lead.tipo_tratamento || 'N/A'}</div>
                  <div>💰 ${lead.preco_tratamento || 'N/A'}</div>
                </div>
                <div>
                  <div>✅ Pagamento: ${lead.payment_status === 'paid' ? 'Pago' : lead.payment_status === 'unpaid' ? 'Não Pago' : 'Pendente'}</div>
                  <div>🚚 Entrega: ${lead.delivery_status === 'delivered' ? 'Entregue' : lead.delivery_status === 'failed' ? 'Falhou' : 'Pendente'}</div>
                  <div style="text-align: right; margin-top: 5px;">📅 ${new Date(lead.created_at).toLocaleDateString('pt-BR')}</div>
                </div>
              </div>
            `).join('')}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Impressão Térmica
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {selectedLeads.length} etiqueta(s) selecionada(s)
            </Badge>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">📏 Configurações da Etiqueta:</h4>
            <ul className="text-sm space-y-1">
              <li>• <strong>Tamanho:</strong> 100x150mm</li>
              <li>• <strong>Orientação:</strong> Retrato</li>
              <li>• <strong>Margem:</strong> 3mm</li>
              <li>• <strong>Fonte:</strong> Monoespaçada</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-2 text-blue-800">📋 Informações na Etiqueta:</h4>
            <ul className="text-sm space-y-1 text-blue-700">
              <li>• Nome e telefone do cliente</li>
              <li>• Endereço completo de entrega</li>
              <li>• Produto e valor</li>
              <li>• Status de pagamento e entrega</li>
              <li>• Data do pedido</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePreview}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Prévia
            </Button>
            
            <Button 
              onClick={handlePrint}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
