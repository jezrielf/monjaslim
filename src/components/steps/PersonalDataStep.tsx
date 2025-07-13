import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { FormData } from '../FormWizard';
import { useToast } from '@/hooks/use-toast';

interface PersonalDataStepProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const PersonalDataStep: React.FC<PersonalDataStepProps> = ({
  data,
  updateData,
  onNext,
  onPrev,
}) => {
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 7) {
        return numbers.replace(/(\d{2})(\d{1,5})/, '($1) $2');
      } else {
        return numbers.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
      }
    }
    return value.slice(0, 15); // Limit to prevent overflow
  };

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handleCepSearch = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP informado.",
          variant: "destructive",
        });
        return;
      }

      updateData({
        rua: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
      });

      toast({
        title: "Endereço encontrado!",
        description: "Dados preenchidos automaticamente.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível buscar o CEP.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCep(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!data.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!data.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!validatePhone(data.telefone)) {
      newErrors.telefone = 'Formato: (xx) xxxxx-xxxx';
    }

    if (!data.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!data.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    }

    if (!data.numero.trim()) {
      newErrors.numero = 'Número é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input
            id="nome"
            value={data.nome}
            onChange={(e) => updateData({ nome: e.target.value })}
            placeholder="Digite seu nome completo"
            className={errors.nome ? 'border-destructive' : ''}
          />
          {errors.nome && (
            <p className="text-sm text-destructive">{errors.nome}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone *</Label>
          <Input
            id="telefone"
            value={data.telefone}
            onChange={(e) => updateData({ telefone: formatPhone(e.target.value) })}
            placeholder="(11) 99999-9999"
            maxLength={15}
            className={errors.telefone ? 'border-destructive' : ''}
          />
          {errors.telefone && (
            <p className="text-sm text-destructive">{errors.telefone}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => updateData({ email: e.target.value })}
          placeholder="seu@email.com"
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="cep">CEP *</Label>
          <div className="relative">
            <Input
              id="cep"
              value={data.cep}
              onChange={(e) => {
                const formattedCep = formatCep(e.target.value);
                updateData({ cep: formattedCep });
                if (formattedCep.replace(/\D/g, '').length === 8) {
                  handleCepSearch(formattedCep);
                }
              }}
              placeholder="00000-000"
              className={errors.cep ? 'border-destructive' : ''}
            />
            {isLoadingCep && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
            )}
          </div>
          {errors.cep && (
            <p className="text-sm text-destructive">{errors.cep}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="numero">Número *</Label>
          <Input
            id="numero"
            value={data.numero}
            onChange={(e) => updateData({ numero: e.target.value })}
            placeholder="123"
            className={errors.numero ? 'border-destructive' : ''}
          />
          {errors.numero && (
            <p className="text-sm text-destructive">{errors.numero}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="complemento">Complemento</Label>
          <Input
            id="complemento"
            value={data.complemento}
            onChange={(e) => updateData({ complemento: e.target.value })}
            placeholder="Apto 101"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="rua">Rua</Label>
          <Input
            id="rua"
            value={data.rua}
            onChange={(e) => updateData({ rua: e.target.value })}
            placeholder="Nome da rua"
            disabled={isLoadingCep}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro</Label>
          <Input
            id="bairro"
            value={data.bairro}
            onChange={(e) => updateData({ bairro: e.target.value })}
            placeholder="Nome do bairro"
            disabled={isLoadingCep}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            value={data.cidade}
            onChange={(e) => updateData({ cidade: e.target.value })}
            placeholder="Nome da cidade"
            disabled={isLoadingCep}
          />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={handleNext}
          className="bg-gradient-primary hover:opacity-90 shadow-glow"
          size="lg"
        >
          Próximo
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};