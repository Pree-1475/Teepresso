import React from 'react';
import { Accordion } from '@/components/ui/Accordion/Accordion';
import { Button } from '@/components/ui/Button/Button';
import styles from './FAQSection.module.css';

const faqItems = [
  {
    title: 'What is the minimum order quantity (MOQ)?',
    content: 'Our minimum order quantity for custom apparel is 50 pieces per design. This allows us to maintain our high-quality printing standards while keeping pricing cost-effective for bulk orders.'
  },
  {
    title: 'How long does delivery take?',
    content: 'Standard production and delivery take 10-14 business days after you approve the digital proof. Rush orders (5-7 days) are available for select products upon request.'
  },
  {
    title: 'Can you help with the design?',
    content: 'Absolutely! We offer complimentary design support for all bulk orders. Our team of expert designers will ensure your artwork is print-ready and optimized for the best possible result.'
  },
  {
    title: 'What payment methods do you accept?',
    content: 'We accept all major credit cards, bank transfers, and institutional purchase orders (POs) for approved universities and corporate partners.'
  },
  {
    title: 'Can I order a sample before placing a large order?',
    content: 'Yes, we provide pre-production samples for large volume orders. For standard orders, we provide a highly detailed digital mockup for your approval before printing begins.'
  }
];

export function FAQSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <h2 className={styles.title}>Frequently Asked Questions</h2>
            <p className={styles.description}>
              Everything you need to know about ordering custom apparel in bulk.
            </p>
            <div className={styles.contactCard}>
              <h3>Still have questions?</h3>
              <p>Our team is here to help you navigate the process.</p>
              <Button variant="outline" className={styles.contactBtn}>Contact Support</Button>
            </div>
          </div>
          
          <div className={styles.accordionWrapper}>
            <Accordion items={faqItems} />
          </div>
        </div>
      </div>
    </section>
  );
}
