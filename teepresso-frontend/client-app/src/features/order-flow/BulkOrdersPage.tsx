import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { OrderFlowProvider, useOrderFlow } from '@/features/order-flow/components/OrderFlowContext';
import { OrderFlowLayout } from '@/features/order-flow/components/OrderFlowLayout';
import { Step1BusinessInfo } from '@/features/order-flow/components/steps/Step1BusinessInfo';
import { Step2SelectProducts } from '@/features/order-flow/components/steps/Step2SelectProducts';
import { Step3SizeDistribution } from '@/features/order-flow/components/steps/Step3SizeDistribution';
import { Step4ArtworkUpload } from '@/features/order-flow/components/steps/Step4ArtworkUpload';
import { Step5MockupPlacement } from '@/features/order-flow/components/steps/Step5MockupPlacement';
import { Step6PrintingPreferences } from '@/features/order-flow/components/steps/Step6PrintingPreferences';
import { Step7AdditionalNotes } from '@/features/order-flow/components/steps/Step7AdditionalNotes';
import { Step8ReviewOrder } from '@/features/order-flow/components/steps/Step8ReviewOrder';
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
    case 1: return <Step1BusinessInfo />;
    case 2: return <Step2SelectProducts />;
    case 3: return <Step3SizeDistribution />;
    case 4: return <Step4ArtworkUpload />;
    case 5: return <Step5MockupPlacement />;
    case 6: return <Step6PrintingPreferences />;
    case 7: return <Step7AdditionalNotes />;
    case 8: return <Step8ReviewOrder />;
    default: return <Step1BusinessInfo />;
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
