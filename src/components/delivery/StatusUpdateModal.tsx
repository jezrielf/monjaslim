import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { format } from "date-fns";

interface StatusUpdateModalProps {
  lead: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (leadId: string, updates: any) => void;
}

export const StatusUpdateModal = ({ lead, open, onOpenChange, onUpdate }: StatusUpdateModalProps) => {
  const [paymentStatus, setPaymentStatus] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  useEffect(() => {
    if (lead) {
      setPaymentStatus(lead.payment_status || 'pending');
      setDeliveryStatus(lead.delivery_status || 'pending');
      setPaymentNotes(lead.payment_notes || '');
      setDeliveryNotes(lead.delivery_notes || '');
    }
  }, [lead]);

  const handleUpdate = () => {
    if (!lead) return;

    const updates: any = {
      payment_status: paymentStatus,
      delivery_status: deliveryStatus,
      payment_notes: paymentNotes,
      delivery_notes: deliveryNotes,
    };

    // Add timestamps for status changes
    if (paymentStatus === 'paid' && lead.payment_status !== 'paid') {
      updates.payment_date = new Date().toISOString();
    }
    
    if (deliveryStatus === 'delivered' && lead.delivery_status !== 'delivered') {
      updates.delivery_date = new Date().toISOString();
    }

    onUpdate(lead.id, updates);
  };

  if (!lead) return null;

  const formatAddress = () => {
    const parts = [lead.rua, lead.numero, lead.bairro, lead.cidade].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Atualizar Status do Pedido</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Info Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{lead.nome}</h3>
              <Badge variant="outline">
                {format(new Date(lead.created_at), 'dd/MM/yyyy')}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.telefone}</span>
                </div>
                {lead.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{formatAddress()}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.tipo_tratamento}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-primary">{lead.preco_tratamento}</span>
                </div>
                {lead.dia_agenda && lead.horario_agenda && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.dia_agenda} às {lead.horario_agenda}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Status de Pagamento
            </Label>
            <RadioGroup value={paymentStatus} onValueChange={setPaymentStatus}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="payment-pending" />
                <Label htmlFor="payment-pending" className="cursor-pointer">Pendente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="payment-paid" />
                <Label htmlFor="payment-paid" className="cursor-pointer text-green-600">Pago</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unpaid" id="payment-unpaid" />
                <Label htmlFor="payment-unpaid" className="cursor-pointer text-red-600">Não Pago</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Delivery Status */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Status de Entrega
            </Label>
            <RadioGroup value={deliveryStatus} onValueChange={setDeliveryStatus}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="delivery-pending" />
                <Label htmlFor="delivery-pending" className="cursor-pointer">Pendente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivered" id="delivery-delivered" />
                <Label htmlFor="delivery-delivered" className="cursor-pointer text-green-600">Entregue</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="failed" id="delivery-failed" />
                <Label htmlFor="delivery-failed" className="cursor-pointer text-red-600">Falhou</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-notes">Observações de Pagamento</Label>
              <Textarea
                id="payment-notes"
                placeholder="Ex: Cliente pagou em dinheiro, troco para R$ 100..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-notes">Observações de Entrega</Label>
              <Textarea
                id="delivery-notes"
                placeholder="Ex: Entregue no portão, cliente não estava em casa..."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleUpdate} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Atualizar Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};