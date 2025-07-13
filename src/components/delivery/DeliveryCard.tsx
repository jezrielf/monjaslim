import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Package,
  DollarSign,
  Calendar,
  MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";

interface DeliveryCardProps {
  lead: any;
  onAction: (lead: any, action: 'paid' | 'unpaid' | 'details') => void;
}

export const DeliveryCard = ({ lead, onAction }: DeliveryCardProps) => {
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Pago</Badge>;
      case 'unpaid':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">Não Pago</Badge>;
      default:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Pendente</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="outline" className="border-green-500 text-green-600">Entregue</Badge>;
      case 'failed':
        return <Badge variant="outline" className="border-red-500 text-red-600">Falhou</Badge>;
      default:
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pendente</Badge>;
    }
  };

  const formatAddress = () => {
    const parts = [lead.rua, lead.numero, lead.bairro, lead.cidade].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">{lead.nome}</h3>
            <div className="flex gap-2">
              {getPaymentStatusBadge(lead.payment_status)}
              {getDeliveryStatusBadge(lead.delivery_status)}
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 inline mr-1" />
            {format(new Date(lead.created_at), 'dd/MM/yyyy')}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{lead.telefone}</span>
          </div>
          {lead.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{lead.email}</span>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <span>{formatAddress()}</span>
        </div>

        {/* Treatment Info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>{lead.tipo_tratamento}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-primary">{lead.preco_tratamento}</span>
          </div>
        </div>

        {/* Schedule */}
        {lead.dia_agenda && lead.horario_agenda && (
          <div className="text-sm">
            <strong>Agendamento:</strong> {lead.dia_agenda} às {lead.horario_agenda}
          </div>
        )}

        {/* Notes */}
        {(lead.payment_notes || lead.delivery_notes) && (
          <div className="border-t pt-3 space-y-1">
            {lead.payment_notes && (
              <div className="text-sm">
                <strong>Obs. Pagamento:</strong> {lead.payment_notes}
              </div>
            )}
            {lead.delivery_notes && (
              <div className="text-sm">
                <strong>Obs. Entrega:</strong> {lead.delivery_notes}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {lead.payment_status === 'pending' && (
            <>
              <Button 
                onClick={() => onAction(lead, 'paid')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Pago
              </Button>
              <Button 
                onClick={() => onAction(lead, 'unpaid')}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Não Pago
              </Button>
            </>
          )}
          
          <Button 
            onClick={() => onAction(lead, 'details')}
            variant="outline"
            className="flex-1"
          >
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};