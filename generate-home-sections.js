const fs = require('fs');
const path = require('path');

const sections = [
  'HeroSection',
  'TrustBar',
  'IndustriesSection',
  'HowItWorksSection',
  'FeaturedProducts',
  'WhyChooseUsSection',
  'TestimonialsSection',
  'GallerySection',
  'FAQSection',
  'CTASection'
];

const basePath = path.join(__dirname, 'src', 'components', 'sections', 'home');

if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
}

sections.forEach(section => {
  const tsxContent = `import React from 'react';
import styles from './${section}.module.css';

export function ${section}() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2>${section}</h2>
        {/* Placeholder for ${section} */}
      </div>
    </section>
  );
}
`;

  const cssContent = `.section {
  padding: var(--spacing-16) 0;
  /* Add specific styles for ${section} */
}
`;

  fs.writeFileSync(path.join(basePath, `${section}.tsx`), tsxContent);
  fs.writeFileSync(path.join(basePath, `${section}.module.css`), cssContent);
});

console.log('Sections generated successfully.');
