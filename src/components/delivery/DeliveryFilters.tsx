import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Calendar } from "lucide-react";

interface DeliveryFiltersProps {
  filters: {
    paymentStatus: string;
    deliveryStatus: string;
    searchTerm: string;
    dateRange: { from: Date | null; to: Date | null };
  };
  onFiltersChange: (filters: any) => void;
}

export const DeliveryFilters = ({ filters, onFiltersChange }: DeliveryFiltersProps) => {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      paymentStatus: 'all',
      deliveryStatus: 'all',
      searchTerm: '',
      dateRange: { from: null, to: null }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.paymentStatus !== 'all') count++;
    if (filters.deliveryStatus !== 'all') count++;
    if (filters.searchTerm) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    return count;
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou email..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status de Pagamento</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'pending', label: 'Pendentes', color: 'bg-yellow-500' },
                  { value: 'paid', label: 'Pagos', color: 'bg-green-500' },
                  { value: 'unpaid', label: 'Não Pagos', color: 'bg-red-500' }
                ].map((status) => (
                  <Button
                    key={status.value}
                    variant={filters.paymentStatus === status.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter('paymentStatus', status.value)}
                    className={filters.paymentStatus === status.value && status.color ? status.color : ''}
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Delivery Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status de Entrega</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'pending', label: 'Pendentes', color: 'bg-yellow-500' },
                  { value: 'delivered', label: 'Entregues', color: 'bg-green-500' },
                  { value: 'failed', label: 'Falharam', color: 'bg-red-500' }
                ].map((status) => (
                  <Button
                    key={status.value}
                    variant={filters.deliveryStatus === status.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter('deliveryStatus', status.value)}
                    className={filters.deliveryStatus === status.value && status.color ? status.color : ''}
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {getActiveFiltersCount()} filtro(s) ativo(s)
              </span>
            </div>
            
            {getActiveFiltersCount() > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearFilters}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};