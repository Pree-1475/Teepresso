const fs = require('fs');
const path = require('path');

const pages = [
  { name: 'Products', route: 'products' },
  { name: 'Bulk Orders', route: 'bulk-orders' },
  { name: 'Industries We Serve', route: 'industries' },
  { name: 'About Us', route: 'about' },
  { name: 'How It Works', route: 'how-it-works' },
  { name: 'Order Tracking', route: 'track-order' },
  { name: 'Contact Us', route: 'contact' },
  { name: 'FAQ', route: 'faq' },
  { name: 'Login', route: 'login' },
  { name: 'Register', route: 'register' }
];

const basePath = path.join(__dirname, 'src', 'app');

pages.forEach(page => {
  const dirPath = path.join(basePath, page.route);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const content = `import React from 'react';

export default function ${page.name.replace(/ /g, '')}Page() {
  return (
    <div className="container" style={{ padding: 'var(--spacing-24) var(--spacing-4)', minHeight: '60vh' }}>
      <h1>${page.name}</h1>
      <p style={{ marginTop: 'var(--spacing-4)' }}>
        This is the foundation for the ${page.name} page. More content will be added in future phases.
      </p>
    </div>
  );
}
`;

  fs.writeFileSync(path.join(dirPath, 'page.tsx'), content);
});

console.log('Pages scaffolded successfully.');
