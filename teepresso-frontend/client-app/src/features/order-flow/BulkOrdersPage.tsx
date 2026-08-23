import React, { Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OrderFlowProvider, useOrderFlow } from '@/features/order-flow/components/OrderFlowContext';
import { OrderFlowLayout } from '@/features/order-flow/components/OrderFlowLayout';
import { Step1YourDetails } from '@/features/order-flow/components/steps/Step1YourDetails';
import { Step2ProductAndQuantities } from '@/features/order-flow/components/steps/Step2ProductAndQuantities';
import { Step3UploadAndDesign } from '@/features/order-flow/components/steps/Step3UploadAndDesign';
import { Step4ReviewAndOrder } from '@/features/order-flow/components/steps/Step4ReviewAndOrder';
import { PRODUCTS_CATALOG } from '@/features/catalog/data/productsData';

function StepRenderer() {
  const { state, addOrderItem, resetOrder } = useOrderFlow();
  const [searchParams, setSearchParams] = useSearchParams();

  const prodId = searchParams.get('product');

  // Read URL query parameter e.g., ?product=custom-kurta-seasonal
  React.useEffect(() => {
    if (prodId) {
      const match = PRODUCTS_CATALOG.find(p => p.id === prodId);
      if (match) {
        if (state.paymentCompleted) {
          // If previous order is completed, start a new one with this product
          resetOrder(match);
        } else if (!state.items.some(item => item.productId === match.id)) {
          // Add to current order if not already in it
          addOrderItem(match);
        }
        // Clear the query parameter so removing items works and it doesn't trigger again
        setSearchParams({}, { replace: true });
      }
    }
  }, [prodId, state.items, state.paymentCompleted, setSearchParams, addOrderItem, resetOrder]);

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
