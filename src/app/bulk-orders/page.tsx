'use client';

import React from 'react';
import { OrderFlowProvider, useOrderFlow } from '@/components/sections/order-flow/OrderFlowContext';
import { OrderFlowLayout } from '@/components/sections/order-flow/OrderFlowLayout';
import { Step1BusinessInfo } from '@/components/sections/order-flow/steps/Step1BusinessInfo';
import { Step2SelectProducts } from '@/components/sections/order-flow/steps/Step2SelectProducts';
import { Step3SizeDistribution } from '@/components/sections/order-flow/steps/Step3SizeDistribution';
import { Step4ColorSelection } from '@/components/sections/order-flow/steps/Step4ColorSelection';
import { Step5ArtworkUpload } from '@/components/sections/order-flow/steps/Step5ArtworkUpload';
import { Step6PrintingPreferences } from '@/components/sections/order-flow/steps/Step6PrintingPreferences';
import { Step7AdditionalNotes } from '@/components/sections/order-flow/steps/Step7AdditionalNotes';
import { Step8ReviewOrder } from '@/components/sections/order-flow/steps/Step8ReviewOrder';
import { Step9Success } from '@/components/sections/order-flow/steps/Step9Success';

function StepRenderer() {
  const { state } = useOrderFlow();

  switch (state.currentStep) {
    case 1: return <Step1BusinessInfo />;
    case 2: return <Step2SelectProducts />;
    case 3: return <Step3SizeDistribution />;
    case 4: return <Step4ColorSelection />;
    case 5: return <Step5ArtworkUpload />;
    case 6: return <Step6PrintingPreferences />;
    case 7: return <Step7AdditionalNotes />;
    case 8: return <Step8ReviewOrder />;
    case 9: return <Step9Success />;
    default: return <Step1BusinessInfo />;
  }
}

export default function BulkOrdersPage() {
  return (
    <OrderFlowProvider>
      <OrderFlowLayout>
        <StepRenderer />
      </OrderFlowLayout>
    </OrderFlowProvider>
  );
}
