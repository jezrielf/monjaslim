
import { useToast } from "@/hooks/use-toast";

export const useThermalPrint = () => {
  const { toast } = useToast();

  const formatAddress = (lead: any) => {
    const address = [lead.rua, lead.numero].filter(Boolean).join(', ');
    const district = [lead.bairro, lead.cidade].filter(Boolean).join(' - ');
    const cep = lead.cep ? `CEP: ${lead.cep}` : '';
    return { address, district, cep };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'unpaid': return 'Não Pago';
      case 'delivered': return 'Entregue';
      case 'failed': return 'Falhou';
      default: return 'Pendente';
    }
  };

  const generatePrintHTML = (leads: any[]) => {
    const labelsHTML = leads.map(lead => {
      const { address, district, cep } = formatAddress(lead);
      
      return `
        <div class="thermal-label">
          <div class="header">
            <div class="title">🏷️ PEDIDO MONJASLIM</div>
          </div>
          
          <div class="customer-info">
            <div class="name">👤 ${lead.nome || 'N/A'}</div>
            <div class="phone">📞 ${lead.telefone || 'N/A'}</div>
          </div>
          
          <div class="address-section">
            <div class="section-title">📍 ENDEREÇO:</div>
            <div class="address-line">${address}</div>
            <div class="address-line">${district}</div>
            <div class="address-line">${cep}</div>
          </div>
          
          <div class="product-section">
            <div class="section-title">📦 PRODUTO:</div>
            <div class="product-name">${lead.tipo_tratamento || 'N/A'}</div>
            <div class="price">💰 ${lead.preco_tratamento || 'N/A'}</div>
          </div>
          
          <div class="status-section">
            <div class="status">✅ Pagamento: ${getStatusLabel(lead.payment_status)}</div>
            <div class="status">🚚 Entrega: ${getStatusLabel(lead.delivery_status)}</div>
            <div class="date">📅 Data: ${formatDate(lead.created_at)}</div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Etiquetas de Pedidos</title>
          <style>
            @page {
              size: 100mm 150mm;
              margin: 3mm;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .thermal-label {
                page-break-after: always;
              }
              
              .thermal-label:last-child {
                page-break-after: avoid;
              }
            }
            
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 0;
              background: white;
            }
            
            .thermal-label {
              width: 94mm;
              height: 144mm;
              padding: 3mm;
              border: 1px solid #000;
              background: white;
              font-size: 9px;
              line-height: 1.2;
              color: #000;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            
            .header {
              text-align: center;
              margin-bottom: 8px;
              border-bottom: 1px solid #000;
              padding-bottom: 4px;
            }
            
            .title {
              font-weight: bold;
              font-size: 11px;
            }
            
            .customer-info {
              margin-bottom: 8px;
            }
            
            .name {
              font-weight: bold;
              font-size: 10px;
              margin-bottom: 2px;
            }
            
            .phone {
              font-size: 9px;
            }
            
            .address-section, .product-section, .status-section {
              margin-bottom: 8px;
            }
            
            .section-title {
              font-weight: bold;
              margin-bottom: 2px;
              border-bottom: 1px dashed #000;
            }
            
            .address-line, .product-name, .price, .status, .date {
              margin-bottom: 1px;
              padding-left: 2px;
            }
            
            .product-name {
              font-weight: bold;
            }
            
            .price {
              font-weight: bold;
              font-size: 10px;
            }
            
            .status {
              font-size: 8px;
            }
            
            .date {
              font-size: 8px;
              text-align: right;
            }
          </style>
        </head>
        <body>
          ${labelsHTML}
        </body>
      </html>
    `;
  };

  const printLabels = (leads: any[]) => {
    if (leads.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum pedido selecionado para impressão",
        variant: "destructive"
      });
      return;
    }

    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        throw new Error('Popup bloqueado');
      }

      const htmlContent = generatePrintHTML(leads);
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Aguardar carregar antes de imprimir
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 250);
      };

      toast({
        title: "Sucesso",
        description: `${leads.length} etiqueta(s) enviada(s) para impressão`,
      });

    } catch (error) {
      console.error('Erro na impressão:', error);
      toast({
        title: "Erro na Impressão",
        description: "Não foi possível abrir a janela de impressão. Verifique se popups estão permitidos.",
        variant: "destructive"
      });
    }
  };

  return { printLabels };
};
