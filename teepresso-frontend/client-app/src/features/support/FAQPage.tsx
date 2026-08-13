import React from 'react';
import { Accordion } from '@/common/components/ui/Accordion/Accordion';
import { Button } from '@/common/components/ui/Button/Button';
import { HelpCircle, MessageSquare } from 'lucide-react';
import styles from './faq.module.css';

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
    content: 'We accept all major credit cards, bank transfers, UPI payments, and institutional purchase orders (POs) for approved universities and corporate partners.'
  },
  {
    title: 'Can I order a sample before placing a large order?',
    content: 'Yes, we provide pre-production samples for large volume orders. For standard orders, we provide a highly detailed digital mockup for your approval before printing begins.'
  },
  {
    title: 'What printing methods do you offer?',
    content: 'We offer Screen Printing for high durability and vibrant colors, Direct-to-Garment (DTG) for complex multi-colored designs, and high-quality Embroidery for polo shirts and corporate outerwear.'
  },
  {
    title: 'Do you offer discount options for student groups?',
    content: 'Yes! We support student clubs, college festivals, and university groups with special discounted pricing. Make sure to specify your college name when submitting the bulk order configuration.'
  }
];

export function FAQPage() {
  return (
    <div className={styles.pageContainer}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.subtitle}>Frequently Asked Questions</span>
          <h1 className={styles.title}>Here to Help You</h1>
          <p className={styles.description}>
            Have questions about ordering custom apparel? Find fast answers to our most common queries below.
          </p>
        </div>

        <div className={styles.layout}>
          <div className={styles.faqList}>
            <Accordion items={faqItems} allowMultiple={true} />
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.ctaCard}>
              <HelpCircle size={36} color="var(--color-primary-600)" style={{ margin: '0 auto var(--spacing-4)' }} />
              <h3 className={styles.ctaTitle}>Still Have Questions?</h3>
              <p className={styles.ctaText}>
                If you cannot find the answer here, get in touch with our team directly.
              </p>
              <a href="mailto:hello@teepresso.com">
                <Button variant="outline" className={styles.ctaBtn} leftIcon={<MessageSquare size={16} />}>
                  Email Support
                </Button>
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default FAQPage;
