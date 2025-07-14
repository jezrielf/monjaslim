
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeliveryManagement } from "@/hooks/useDeliveryManagement";
import { DeliveryCard } from "@/components/delivery/DeliveryCard";
import { DeliveryFilters } from "@/components/delivery/DeliveryFilters";
import { ProximitySection } from "@/components/delivery/ProximitySection";
import { StatusUpdateModal } from "@/components/delivery/StatusUpdateModal";
import { ThermalPrintModal } from "@/components/delivery/ThermalPrintModal";
import { Navigation } from "@/components/Navigation";
import { Loader, CheckSquare, Square, Printer } from "lucide-react";

export default function Pedidos() {
  const [filters, setFilters] = useState({
    paymentStatus: 'all',
    deliveryStatus: 'all',
    searchTerm: '',
    dateRange: { from: null, to: null },
    sortBy: 'recent' as 'recent' | 'proximity' | 'city'
  });
  
  const [selectedLead, setSelectedLead] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Estados para seleção múltipla e impressão
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const { leads, loading, updateLeadStatus, groupedLeads } = useDeliveryManagement(filters);

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

  // Funções para seleção múltipla
  const handleSelectLead = (leadId: string, selected: boolean) => {
    if (selected) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    }
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead.id));
    }
  };

  const getSelectedLeadsData = () => {
    return leads.filter(lead => selectedLeads.includes(lead.id));
  };

  const handlePrint = () => {
    setSelectedLeads([]);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (leads.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-lg">
              Nenhum pedido encontrado com os filtros selecionados
            </p>
          </CardContent>
        </Card>
      );
    }

    // Renderização agrupada por proximidade
    if (filters.sortBy === 'proximity' && groupedLeads) {
      let sectionOrder = 1;
      
      return (
        <div className="space-y-6">
          {Object.entries(groupedLeads).map(([city, neighborhoods]) => 
            Object.entries(neighborhoods).map(([neighborhood, neighborhoodLeads]) => (
              <ProximitySection
                key={`${city}-${neighborhood}`}
                city={city}
                neighborhood={neighborhood}
                leads={neighborhoodLeads}
                sectionOrder={sectionOrder++}
                onAction={handleCardAction}
                selectedLeads={selectedLeads}
                onSelectLead={handleSelectLead}
              />
            ))
          )}
        </div>
      );
    }

    // Renderização normal (lista)
    return (
      <div className="grid gap-6">
        {leads.map((lead) => (
          <DeliveryCard
            key={lead.id}
            lead={lead}
            onAction={handleCardAction}
            selected={selectedLeads.includes(lead.id)}
            onSelect={(selected) => handleSelectLead(lead.id, selected)}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 pt-20">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">
              Gestão de Entregas
            </h1>
            <p className="text-muted-foreground">
              Acompanhe e gerencie todos os pedidos com entrega
              {filters.sortBy === 'proximity' && (
                <span className="ml-2 text-primary font-medium">
                  • Organizados por proximidade para otimizar rotas
                </span>
              )}
            </p>
          </div>

          {/* Botões de seleção e impressão */}
          {leads.length > 0 && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-muted/30 rounded-lg border">
              <Button 
                variant="outline" 
                onClick={handleSelectAll}
                className="flex items-center gap-2"
              >
                {selectedLeads.length === leads.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {selectedLeads.length === leads.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Button>
              
              {selectedLeads.length > 0 && (
                <>
                  <div className="text-sm text-muted-foreground">
                    {selectedLeads.length} de {leads.length} pedidos selecionados
                  </div>
                  
                  <Button 
                    onClick={() => setPrintModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 ml-auto"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Etiquetas ({selectedLeads.length})
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Filters */}
          <DeliveryFilters 
            filters={filters}
            onFiltersChange={setFilters}
          />

          {/* Content */}
          {renderContent()}

          {/* Status Update Modal */}
          <StatusUpdateModal
            lead={selectedLead}
            open={modalOpen}
            onOpenChange={setModalOpen}
            onUpdate={handleStatusUpdate}
          />

          {/* Thermal Print Modal */}
          <ThermalPrintModal
            open={printModalOpen}
            onOpenChange={setPrintModalOpen}
            selectedLeads={getSelectedLeadsData()}
            onPrint={handlePrint}
          />
        </div>
      </div>
    </>
  );
}
