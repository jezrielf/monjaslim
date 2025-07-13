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
                Recebemos suas informações e em breve nossa equipe entrará em contato.
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Próximos passos:
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-left">
                  <Phone className="h-5 w-5 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Aguarde nossa ligação</p>
                    <p className="text-sm text-muted-foreground">
                      Entraremos em contato no horário que você escolheu
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-left">
                  <Mail className="h-5 w-5 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Confirme seu email</p>
                    <p className="text-sm text-muted-foreground">
                      Verifique sua caixa de entrada para mais informações
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-left">
                  <Calendar className="h-5 w-5 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Consultoria gratuita</p>
                    <p className="text-sm text-muted-foreground">
                      Nosso especialista irá apresentar o melhor tratamento para você
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <span className="font-semibold">Importante:</span> Mantenha seu telefone disponível 
                no horário escolhido. A ligação é gratuita e sem compromisso!
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