'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { OrderFlowProvider, useOrderFlow } from '@/components/sections/order-flow/OrderFlowContext';
import { OrderFlowLayout } from '@/components/sections/order-flow/OrderFlowLayout';
import { Step1BusinessInfo } from '@/components/sections/order-flow/steps/Step1BusinessInfo';
import { Step2SelectProducts } from '@/components/sections/order-flow/steps/Step2SelectProducts';
import { Step3SizeDistribution } from '@/components/sections/order-flow/steps/Step3SizeDistribution';
import { Step4ArtworkUpload } from '@/components/sections/order-flow/steps/Step4ArtworkUpload';
import { Step5MockupPlacement } from '@/components/sections/order-flow/steps/Step5MockupPlacement';
import { Step6PrintingPreferences } from '@/components/sections/order-flow/steps/Step6PrintingPreferences';
import { Step7AdditionalNotes } from '@/components/sections/order-flow/steps/Step7AdditionalNotes';
import { Step8ReviewOrder } from '@/components/sections/order-flow/steps/Step8ReviewOrder';
import { PRODUCTS_CATALOG } from '@/data/productsData';

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

export default function BulkOrdersPage() {
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
