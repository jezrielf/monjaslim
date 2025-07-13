import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, Mail, Calendar } from 'lucide-react';

interface SuccessMessageProps {
  onNewForm: () => void;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ onNewForm }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="border-success shadow-lg">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-success/20 rounded-full p-4">
                <CheckCircle className="h-16 w-16 text-success" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Cadastro Realizado com Sucesso!
              </h1>
              <p className="text-lg text-muted-foreground">
                Seu pedido foi recebido! Agora é muito importante que você acompanhe as próximas etapas para garantir a entrega do Monja Slim no endereço informado.
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Próximos passos:
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-left">
                  <Phone className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Aguarde nosso contato</p>
                    <p className="text-sm text-muted-foreground">
                      Nosso time vai ligar para confirmar todos os dados do pedido. Fique atento ao seu telefone — só realizamos a entrega após essa confirmação.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-left">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Confirmação obrigatória</p>
                    <p className="text-sm text-muted-foreground">
                      Caso não consigamos falar com você pelo telefone informado, seu pedido será cancelado automaticamente.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-left">
                  <Calendar className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Entrega e Pagamento</p>
                    <p className="text-sm text-muted-foreground">
                      O Monja Slim será entregado no endereço cadastrado e o pagamento deverá ser realizado no ato da entrega, direto para o entregador.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-semibold">Importante:</span> Mantenha seu telefone ligado e disponível. Se não atender nossa ligação ou não houver responsável para receber o pedido no endereço, a entrega não será realizada e o pedido será cancelado.
              </p>
              <p className="text-sm text-foreground mt-2 font-medium text-accent">
                Aproveite a oportunidade para começar sua transformação com o Monja Slim!
              </p>
            </div>

            <Button
              onClick={onNewForm}
              variant="outline"
              size="lg"
              className="border-accent text-accent hover:bg-accent/10"
            >
              Fazer Novo Cadastro
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};