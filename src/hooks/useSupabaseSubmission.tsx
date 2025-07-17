import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  purchaseMethod: string;
  nome: string;
  telefone: string;
  email: string;
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
  numero: string;
  complemento: string;
  treatmentType: string;
  treatmentPrice: string;
  selectedDay: string;
  selectedTime: string;
  acceptance: boolean;
}

export const useSupabaseSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitFormData = async (formData: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Insert lead data
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert({
          // Personal data
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email,
          cep: formData.cep,
          rua: formData.rua,
          bairro: formData.bairro,
          cidade: formData.cidade,
          numero: formData.numero,
          complemento: formData.complemento,
          
          // Form data
          modalidade_compra: formData.purchaseMethod,
          tipo_tratamento: formData.treatmentType,
          preco_tratamento: formData.treatmentPrice,
          dia_agenda: formData.selectedDay,
          horario_agenda: formData.selectedTime,
          aceite_final: formData.acceptance,
          data_preenchimento: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (leadError) {
        throw leadError;
      }

      toast({
        title: "Dados salvos com sucesso!",
        description: "Suas informações foram registradas no sistema.",
      });

      return { success: true, leadId: leadData?.id };

    } catch (error: any) {
      console.error('Error submitting form data:', error);
      
      toast({
        title: "Erro ao salvar dados",
        description: "Houve um problema ao salvar suas informações. Tente novamente.",
        variant: "destructive",
      });

      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitFormData,
    isSubmitting
  };
};