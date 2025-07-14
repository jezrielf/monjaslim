
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeliveryFilters {
  paymentStatus: string;
  deliveryStatus: string;
  searchTerm: string;
  dateRange: { from: Date | null; to: Date | null };
  sortBy: 'recent' | 'proximity' | 'city';
}

// Mapeamento de bairros próximos em Divinópolis
const BAIRROS_PROXIMIDADE: Record<string, string[]> = {
  'Centro': ['Esplanada', 'São Luís', 'Paraíso', 'Santa Rosa'],
  'Esplanada': ['Centro', 'Bom Pastor', 'Icaraí', 'São Luís'],
  'Bom Pastor': ['Esplanada', 'Interlagos', 'Icaraí'],
  'São Luís': ['Centro', 'Esplanada', 'Paraíso'],
  'Paraíso': ['Centro', 'São Luís', 'Santa Rosa'],
  'Icaraí': ['Esplanada', 'Bom Pastor'],
  'Interlagos': ['Bom Pastor', 'Icaraí'],
  'Santa Rosa': ['Centro', 'Paraíso']
};

export const useDeliveryManagement = (filters: DeliveryFilters) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('leads')
        .select('*')
        .eq('modalidade_compra', 'pagar-entrega')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.paymentStatus !== 'all') {
        query = query.eq('payment_status', filters.paymentStatus);
      }
      
      if (filters.deliveryStatus !== 'all') {
        query = query.eq('delivery_status', filters.deliveryStatus);
      }

      if (filters.searchTerm) {
        query = query.or(`nome.ilike.%${filters.searchTerm}%,telefone.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%`);
      }

      if (filters.dateRange.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }
      
      if (filters.dateRange.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const sortedLeads = sortLeads(data || [], filters.sortBy);
      setLeads(sortedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Erro ao carregar pedidos",
        description: "Não foi possível carregar os pedidos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sortLeads = (leads: any[], sortBy: string) => {
    switch (sortBy) {
      case 'proximity':
        return sortByProximity(leads);
      case 'city':
        return sortByCity(leads);
      case 'recent':
      default:
        return leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  };

  const sortByProximity = (leads: any[]) => {
    // Agrupar por cidade
    const groupedByCity = leads.reduce((acc, lead) => {
      const city = lead.cidade || 'Cidade não informada';
      if (!acc[city]) acc[city] = [];
      acc[city].push(lead);
      return acc;
    }, {});

    const sortedLeads: any[] = [];

    // Processar cada cidade
    Object.entries(groupedByCity).forEach(([city, cityLeads]: [string, any]) => {
      // Agrupar por bairro dentro da cidade
      const groupedByNeighborhood = cityLeads.reduce((acc: any, lead: any) => {
        const bairro = lead.bairro || 'Bairro não informado';
        if (!acc[bairro]) acc[bairro] = [];
        acc[bairro].push(lead);
        return acc;
      }, {});

      // Ordenar bairros por proximidade e quantidade
      const neighborhoodOrder = getNeighborhoodOrder(Object.keys(groupedByNeighborhood));
      
      neighborhoodOrder.forEach(neighborhood => {
        if (groupedByNeighborhood[neighborhood]) {
          // Ordenar leads dentro do bairro por CEP e data
          const sortedNeighborhoodLeads = groupedByNeighborhood[neighborhood].sort((a: any, b: any) => {
            // Primeiro por CEP (se disponível)
            if (a.cep && b.cep) {
              return a.cep.localeCompare(b.cep);
            }
            // Depois por data de criação
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });

          sortedLeads.push(...sortedNeighborhoodLeads);
        }
      });
    });

    return sortedLeads;
  };

  const sortByCity = (leads: any[]) => {
    return leads.sort((a, b) => {
      // Primeiro por cidade
      const cityA = a.cidade || 'ZZZ';
      const cityB = b.cidade || 'ZZZ';
      const cityCompare = cityA.localeCompare(cityB);
      
      if (cityCompare !== 0) return cityCompare;
      
      // Depois por bairro
      const bairroA = a.bairro || 'ZZZ';
      const bairroB = b.bairro || 'ZZZ';
      const bairroCompare = bairroA.localeCompare(bairroB);
      
      if (bairroCompare !== 0) return bairroCompare;
      
      // Por último por data
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  const getNeighborhoodOrder = (neighborhoods: string[]) => {
    // Ordenar bairros por proximidade usando o mapa
    const ordered: string[] = [];
    const remaining = [...neighborhoods];

    // Primeiro, adicionar bairros com mais pedidos
    const withCounts = remaining.map(n => ({
      name: n,
      count: neighborhoods.filter(nb => nb === n).length
    })).sort((a, b) => b.count - a.count);

    // Processar em ordem de proximidade
    while (remaining.length > 0) {
      const current = remaining.shift();
      if (!current) break;
      
      ordered.push(current);
      
      // Adicionar bairros próximos na sequência
      const proximos = BAIRROS_PROXIMIDADE[current] || [];
      proximos.forEach(proximo => {
        const index = remaining.indexOf(proximo);
        if (index > -1) {
          ordered.push(proximo);
          remaining.splice(index, 1);
        }
      });
    }

    return ordered;
  };

  const updateLeadStatus = async (leadId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "O status do pedido foi atualizado com sucesso.",
      });

      // Refresh the leads list
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getGroupedLeads = () => {
    if (filters.sortBy !== 'proximity') return null;

    const grouped: { [key: string]: { [key: string]: any[] } } = {};
    
    leads.forEach((lead: any) => {
      const city = lead.cidade || 'Cidade não informada';
      const bairro = lead.bairro || 'Bairro não informado';
      
      if (!grouped[city]) grouped[city] = {};
      if (!grouped[city][bairro]) grouped[city][bairro] = [];
      
      grouped[city][bairro].push(lead);
    });

    return grouped;
  };

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  return {
    leads,
    loading,
    updateLeadStatus,
    refetch: fetchLeads,
    groupedLeads: getGroupedLeads()
  };
};
