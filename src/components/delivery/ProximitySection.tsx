
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin } from "lucide-react";
import { DeliveryCard } from "./DeliveryCard";

interface ProximitySectionProps {
  city: string;
  neighborhood: string;
  leads: any[];
  sectionOrder: number;
  onAction: (lead: any, action: 'paid' | 'unpaid' | 'details') => void;
  selectedLeads?: string[];
  onSelectLead?: (leadId: string, selected: boolean) => void;
}

export const ProximitySection = ({ 
  city, 
  neighborhood, 
  leads, 
  sectionOrder,
  onAction,
  selectedLeads = [],
  onSelectLead
}: ProximitySectionProps) => {
  const allSelected = leads.every(lead => selectedLeads.includes(lead.id));
  const someSelected = leads.some(lead => selectedLeads.includes(lead.id));

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectLead) return;
    
    leads.forEach(lead => {
      if (checked && !selectedLeads.includes(lead.id)) {
        onSelectLead(lead.id, true);
      } else if (!checked && selectedLeads.includes(lead.id)) {
        onSelectLead(lead.id, false);
      }
    });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4 p-4 bg-muted/50 rounded-lg border-l-4 border-l-primary">
        {onSelectLead && (
          <Checkbox
            checked={someSelected && !allSelected ? "indeterminate" : allSelected}
            onCheckedChange={handleSelectAll}
          />
        )}
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg text-foreground">
          {neighborhood} - {city}
        </h3>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {leads.length} pedido{leads.length > 1 ? 's' : ''}
        </Badge>
        <Badge variant="outline" className="ml-auto border-primary/30 text-primary">
          Rota {sectionOrder}
        </Badge>
      </div>
      
      <div className="grid gap-4 pl-4">
        {leads.map((lead, index) => (
          <div key={lead.id} className="relative">
            <div className="absolute -left-8 top-6 w-6 h-6 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {index + 1}
            </div>
            <DeliveryCard 
              lead={lead} 
              onAction={onAction}
              selected={selectedLeads.includes(lead.id)}
              onSelect={onSelectLead ? (selected) => onSelectLead(lead.id, selected) : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
