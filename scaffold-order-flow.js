const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'src', 'components', 'sections', 'order-flow');
const stepsPath = path.join(basePath, 'steps');

if (!fs.existsSync(stepsPath)) {
  fs.mkdirSync(stepsPath, { recursive: true });
}

// 1. Layout Component
const layoutContent = `import React from 'react';
import { OrderSidebar } from './OrderSidebar';
import { StepProgress } from './StepProgress';
import styles from './OrderFlowLayout.module.css';

export function OrderFlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.mainContent}>
            <StepProgress />
            <div className={styles.stepContainer}>
              {children}
            </div>
          </div>
          <div className={styles.sidebarColumn}>
            <OrderSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(basePath, 'OrderFlowLayout.tsx'), layoutContent);

const layoutCssContent = `.layout {
  padding: var(--spacing-16) 0 var(--spacing-24);
  background-color: var(--color-background);
  min-height: 100vh;
}
.grid {
  display: flex;
  flex-direction: column-reverse;
  gap: var(--spacing-8);
}
@media (min-width: 1024px) {
  .grid {
    flex-direction: row;
    align-items: flex-start;
  }
  .mainContent { flex: 1; }
  .sidebarColumn { width: 350px; position: sticky; top: var(--spacing-24); }
}
.stepContainer {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  box-shadow: var(--shadow-sm);
}
`;
fs.writeFileSync(path.join(basePath, 'OrderFlowLayout.module.css'), layoutCssContent);

// 2. Sidebar Component
const sidebarContent = `'use client';
import React from 'react';
import { useOrderFlow } from './OrderFlowContext';
import styles from './OrderSidebar.module.css';

export function OrderSidebar() {
  const { state, totalQuantity } = useOrderFlow();

  return (
    <div className={styles.sidebar}>
      <h3 className={styles.title}>Order Summary</h3>
      
      <div className={styles.section}>
        <div className={styles.row}>
          <span className={styles.label}>Total Quantity:</span>
          <span className={styles.value}>{totalQuantity} pcs</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Products Selected:</span>
          <span className={styles.value}>{state.products.length}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Artwork:</span>
          <span className={styles.value}>{state.artwork.length > 0 ? \`\${state.artwork.length} files\` : 'Pending'}</span>
        </div>
      </div>

      <div className={styles.estimate}>
        <span className={styles.estimateLabel}>Estimated Turnaround</span>
        <span className={styles.estimateValue}>10-14 Days</span>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(basePath, 'OrderSidebar.tsx'), sidebarContent);

const sidebarCssContent = `.sidebar {
  background-color: var(--color-surface);
  border: 1px solid var(--color-primary-200);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
}
.title { font-size: var(--text-lg); color: var(--color-primary-900); margin-bottom: var(--spacing-6); }
.section { display: flex; flex-direction: column; gap: var(--spacing-3); padding-bottom: var(--spacing-6); border-bottom: 1px solid var(--color-border); margin-bottom: var(--spacing-6); }
.row { display: flex; justify-content: space-between; font-size: var(--text-sm); }
.label { color: var(--color-text-secondary); }
.value { font-weight: var(--font-weight-semibold); color: var(--color-text-primary); }
.estimate { display: flex; flex-direction: column; gap: var(--spacing-1); background-color: var(--color-primary-50); padding: var(--spacing-4); border-radius: var(--radius-md); text-align: center; }
.estimateLabel { font-size: var(--text-xs); color: var(--color-primary-700); text-transform: uppercase; letter-spacing: 0.05em; font-weight: var(--font-weight-bold); }
.estimateValue { font-size: var(--text-lg); font-weight: var(--font-weight-bold); color: var(--color-primary-900); }
`;
fs.writeFileSync(path.join(basePath, 'OrderSidebar.module.css'), sidebarCssContent);

// 3. Step Progress Component
const stepProgressContent = `'use client';
import React from 'react';
import { useOrderFlow } from './OrderFlowContext';
import styles from './StepProgress.module.css';

const steps = [
  'Business Info', 'Products', 'Quantities', 'Colors', 'Artwork', 'Printing', 'Notes', 'Review', 'Submit'
];

export function StepProgress() {
  const { state } = useOrderFlow();

  return (
    <div className={styles.container}>
      <p className={styles.mobileText}>Step {state.currentStep} of 9: {steps[state.currentStep - 1]}</p>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: \`\${(state.currentStep / 9) * 100}%\` }} />
      </div>
      <div className={styles.desktopSteps}>
        {steps.map((step, index) => (
          <div key={index} className={\`\${styles.stepIndicator} \${state.currentStep > index + 1 ? styles.completed : ''} \${state.currentStep === index + 1 ? styles.active : ''}\`}>
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(basePath, 'StepProgress.tsx'), stepProgressContent);

const stepProgressCssContent = `.container { margin-bottom: var(--spacing-8); }
.mobileText { font-size: var(--text-sm); font-weight: var(--font-weight-semibold); color: var(--color-primary-700); margin-bottom: var(--spacing-2); }
.progressBar { height: 8px; background-color: var(--color-secondary-200); border-radius: var(--radius-full); overflow: hidden; margin-bottom: var(--spacing-4); }
.progressFill { height: 100%; background-color: var(--color-primary-600); transition: width var(--transition-normal); }
.desktopSteps { display: none; }
@media (min-width: 768px) {
  .mobileText { display: none; }
  .desktopSteps { display: flex; justify-content: space-between; }
  .stepIndicator { width: 32px; height: 32px; border-radius: var(--radius-full); background-color: var(--color-secondary-200); color: var(--color-text-tertiary); display: flex; align-items: center; justify-content: center; font-size: var(--text-sm); font-weight: var(--font-weight-bold); transition: all var(--transition-fast); }
  .stepIndicator.completed { background-color: var(--color-primary-600); color: var(--color-surface); }
  .stepIndicator.active { background-color: var(--color-primary-50); color: var(--color-primary-600); box-shadow: 0 0 0 2px var(--color-primary-600); }
}
`;
fs.writeFileSync(path.join(basePath, 'StepProgress.module.css'), stepProgressCssContent);

// 4. Scaffold 9 Steps
const stepsArray = [
  'Step1BusinessInfo',
  'Step2SelectProducts',
  'Step3SizeDistribution',
  'Step4ColorSelection',
  'Step5ArtworkUpload',
  'Step6PrintingPreferences',
  'Step7AdditionalNotes',
  'Step8ReviewOrder',
  'Step9Success'
];

stepsArray.forEach((step, index) => {
  const content = `'use client';
import React from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { Button } from '@/components/ui/Button/Button';
import styles from './Step.module.css';

export function ${step}() {
  const { nextStep, prevStep } = useOrderFlow();

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.title}>${step.replace(/Step[0-9]/, '').replace(/([A-Z])/g, ' $1').trim()}</h2>
      <p className={styles.description}>Placeholder for Step ${index + 1} content.</p>
      
      <div className={styles.actions}>
        ${index > 0 && index < 8 ? `<Button variant="outline" onClick={prevStep}>Back</Button>` : ''}
        ${index < 8 ? `<Button variant="primary" onClick={nextStep}>Continue</Button>` : ''}
      </div>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(stepsPath, `${step}.tsx`), content);
});

// Shared Step CSS
const stepCssContent = `.stepContainer { display: flex; flex-direction: column; gap: var(--spacing-6); animation: fadeIn var(--transition-fast) ease-out; }
.title { font-size: var(--text-2xl); color: var(--color-primary-900); margin: 0; }
.description { color: var(--color-text-secondary); margin: 0; }
.actions { display: flex; justify-content: flex-end; gap: var(--spacing-4); margin-top: var(--spacing-8); padding-top: var(--spacing-6); border-top: 1px solid var(--color-border); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;
fs.writeFileSync(path.join(stepsPath, 'Step.module.css'), stepCssContent);

console.log('Order flow scaffolded successfully.');
