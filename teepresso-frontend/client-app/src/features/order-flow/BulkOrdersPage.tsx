import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { OrderFlowProvider, useOrderFlow } from '@/features/order-flow/components/OrderFlowContext';
import { OrderFlowLayout } from '@/features/order-flow/components/OrderFlowLayout';
import { Step1YourDetails } from '@/features/order-flow/components/steps/Step1YourDetails';
import { Step2ProductAndQuantities } from '@/features/order-flow/components/steps/Step2ProductAndQuantities';
import { Step3UploadAndDesign } from '@/features/order-flow/components/steps/Step3UploadAndDesign';
import { Step4ReviewAndOrder } from '@/features/order-flow/components/steps/Step4ReviewAndOrder';
import { PRODUCTS_CATALOG } from '@/features/catalog/data/productsData';

function StepRenderer() {
  const { state, updateProduct } = useOrderFlow();
  const searchParams = useSearchParams();

  // Read URL query parameter e.g., ?product=custom-kurta-seasonal or ?product=polo-corporate
  React.useEffect(() => {
    const prodId = searchParams.get('product');
    if (prodId) {
      const match = PRODUCTS_CATALOG.find(p => p.id === prodId);
      if (match) {
        updateProduct({
          id: match.id,
          name: match.name,
          category: match.category,
          pricePerUnit: match.startingPrice,
        });
      }
    }
  }, [searchParams]);

  switch (state.currentStep) {
    case 1: return <Step1YourDetails />;
    case 2: return <Step2ProductAndQuantities />;
    case 3: return <Step3UploadAndDesign />;
    case 4: return <Step4ReviewAndOrder />;
    default: return <Step1YourDetails />;
  }
}

export function BulkOrdersPage() {
  return (
    <OrderFlowProvider>
      <OrderFlowLayout>
        <Suspense fallback={<div>Loading Order Configurator...</div>}>
          <StepRenderer />
        </Suspense>
      </OrderFlowLayout>
    </OrderFlowProvider>
  );
}

export default BulkOrdersPage;
