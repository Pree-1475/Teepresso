import React from 'react';
import { MousePointerClick, Paintbrush, ThumbsUp, Printer, Truck } from 'lucide-react';
import { useScrollReveal } from '@/common/hooks/useScrollReveal';
import styles from './FestiveHowItWorks.module.css';

const steps = [
  {
    icon: <MousePointerClick className={styles.icon} size={32} strokeWidth={1.5} />,
    title: "1. Choose",
    desc: "Select your Kurta color and bulk quantity."
  },
  {
    icon: <Paintbrush className={styles.icon} size={32} strokeWidth={1.5} />,
    title: "2. Upload / Design",
    desc: "Upload your society or event logo."
  },
  {
    icon: <ThumbsUp className={styles.icon} size={32} strokeWidth={1.5} />,
    title: "3. Approve",
    desc: "Review the digital mockup we provide."
  },
  {
    icon: <Printer className={styles.icon} size={32} strokeWidth={1.5} />,
    title: "4. Bulk Print",
    desc: "We print your order with high-quality inks."
  },
  {
    icon: <Truck className={styles.icon} size={32} strokeWidth={1.5} />,
    title: "5. Delivered",
    desc: "Fast, reliable shipping for your entire group."
  }
];

export const FestiveHowItWorks = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section className={styles.section} ref={ref}>
      <div className="container">
        <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
          <h2 className={styles.title}>How Bulk Orders Work.</h2>
        </div>
        
        <div className={`${styles.timeline} ${isVisible ? styles.timelineVisible : ''}`}>
          {steps.map((step, index) => (
            <div key={index} className={styles.step} style={{ transitionDelay: `${index * 150}ms` }}>
              <div className={styles.iconWrapper}>
                {step.icon}
                <div className={styles.iconGlow}></div>
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
              
              {index < steps.length - 1 && (
                <div className={styles.connectorContainer}>
                  <div className={styles.connectorBase} />
                  <div className={styles.connectorFill} style={{ transitionDelay: `${index * 150 + 300}ms` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
