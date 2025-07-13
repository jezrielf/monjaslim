import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDeliveryManagement } from "@/hooks/useDeliveryManagement";
import { DeliveryCard } from "@/components/delivery/DeliveryCard";
import { DeliveryFilters } from "@/components/delivery/DeliveryFilters";
import { StatusUpdateModal } from "@/components/delivery/StatusUpdateModal";
import { Loader } from "lucide-react";

export default function Pedidos() {
  const [filters, setFilters] = useState({
    paymentStatus: 'all',
    deliveryStatus: 'all',
    searchTerm: '',
    dateRange: { from: null, to: null }
  });
  
  const [selectedLead, setSelectedLead] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { leads, loading, updateLeadStatus } = useDeliveryManagement(filters);

  const handleStatusUpdate = async (leadId: string, updates: any) => {
    await updateLeadStatus(leadId, updates);
    setModalOpen(false);
    setSelectedLead(null);
  };

  const handleCardAction = (lead: any, action: 'paid' | 'unpaid' | 'details') => {
    if (action === 'details') {
      setSelectedLead(lead);
      setModalOpen(true);
    } else if (action === 'paid') {
      handleStatusUpdate(lead.id, {
        payment_status: 'paid',
        payment_date: new Date().toISOString(),
        delivery_status: 'delivered',
        delivery_date: new Date().toISOString()
      });
    } else if (action === 'unpaid') {
      setSelectedLead(lead);
      setModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Gestão de Entregas
          </h1>
          <p className="text-muted-foreground">
            Acompanhe e gerencie todos os pedidos com entrega
          </p>
        </div>

        {/* Filters */}
        <DeliveryFilters 
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6">
            {leads.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground text-lg">
                    Nenhum pedido encontrado com os filtros selecionados
                  </p>
                </CardContent>
              </Card>
            ) : (
              leads.map((lead) => (
                <DeliveryCard
                  key={lead.id}
                  lead={lead}
                  onAction={handleCardAction}
                />
              ))
            )}
          </div>
        )}

        {/* Status Update Modal */}
        <StatusUpdateModal
          lead={selectedLead}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
}