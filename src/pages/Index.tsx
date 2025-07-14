import { FormWizard } from '@/components/FormWizard';
import { Navigation } from '@/components/Navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

const Index = () => {
  return (
    <>
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 mb-6">
        <Alert className="border-primary/20 bg-primary/5">
          <Shield className="h-4 w-4 text-primary" />
          <AlertDescription className="text-center font-medium">
            <strong>Página Oficial MonjaSlim</strong><br />
            Você está em um ambiente seguro para finalizar seu pedido.<br />
            Escolha a melhor forma de entrega e prossiga com tranquilidade.
          </AlertDescription>
        </Alert>
      </div>
      <FormWizard />
    </>
  );
};

export default Index;
