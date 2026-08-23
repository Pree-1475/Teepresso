import React from 'react';
import Link from 'next/link';
import { ClipboardCheck, UploadCloud, Edit, Settings, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import styles from './how-it-works.module.css';

const steps = [
  {
    icon: ClipboardCheck,
    title: '1. Select & Configure',
    desc: 'Choose your apparel style (t-shirts, hoodies, or kurtas), enter quantities, and specify colors.'
  },
  {
    icon: UploadCloud,
    title: '2. Upload Artwork',
    desc: 'Upload your team logo or artwork. If you do not have one, our design team will create it for you.'
  },
  {
    icon: Edit,
    title: '3. Approve Proof',
    desc: 'We will send a digital proof of the mockup. We never print until you explicitly sign off.'
  },
  {
    icon: Settings,
    title: '4. Precision Print',
    desc: 'We use high-grade screen printing, embroidery, or DTG machines to print with quality inspection.'
  },
  {
    icon: Truck,
    title: '5. Fast Delivery',
    desc: 'Your bulk order is carefully packed and shipped straight to your venue, colony, or campus.'
  }
];

export function HowItWorksPage() {
  return (
    <div className={styles.pageContainer}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.subtitle}>Process Overview</span>
          <h1 className={styles.title}>Simple Bulk Customization</h1>
          <p className={styles.description}>
            From submitting your order idea to receiving your box of custom printed apparel. Here is what to expect.
          </p>
        </div>

        <div className={styles.stepsGrid}>
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className={styles.stepCard}>
                <div className={styles.stepBadge}>{idx + 1}</div>
                <div className={styles.stepIconWrapper}>
                  <Icon size={24} />
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            );
          })}
        </div>

        <div className={styles.ctaBanner}>
          <h2 className={styles.ctaTitle}>Ready to start your group order?</h2>
          <p className={styles.ctaText}>
            Get a tailored, instant quotation with our step-by-step custom order configurator. It takes less than 2 minutes.
          </p>
          <div className={styles.ctaBtns}>
            <Link href="/products">
              <Button rightIcon={<ArrowRight size={16} />}>Start Customizer</Button>
            </Link>
            <Link href="/products">
              <Button variant="outline">View Products Catalog</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowItWorksPage;
