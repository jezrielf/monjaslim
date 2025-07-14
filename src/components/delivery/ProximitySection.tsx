
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { DeliveryCard } from "./DeliveryCard";

interface ProximitySectionProps {
  city: string;
  neighborhood: string;
  leads: any[];
  sectionOrder: number;
  onAction: (lead: any, action: 'paid' | 'unpaid' | 'details') => void;
}

export const ProximitySection = ({ 
  city, 
  neighborhood, 
  leads, 
  sectionOrder,
  onAction 
}: ProximitySectionProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4 p-4 bg-muted/50 rounded-lg border-l-4 border-l-primary">
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
            />
          </div>
        ))}
      </div>
    </div>
  );
};
