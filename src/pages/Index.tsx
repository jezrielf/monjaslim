import { FormWizard } from '@/components/FormWizard';
import { Navigation } from '@/components/Navigation';
import { UTMIndicator } from '@/components/UTMIndicator';

const Index = () => {
  return (
    <>
      <Navigation />
      <UTMIndicator />
      <FormWizard />
    </>
  );
};

export default Index;
