import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeliveryFilters {
  paymentStatus: string;
  deliveryStatus: string;
  searchTerm: string;
  dateRange: { from: Date | null; to: Date | null };
}

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
      
      setLeads(data || []);
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

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  return {
    leads,
    loading,
    updateLeadStatus,
    refetch: fetchLeads
  };
};