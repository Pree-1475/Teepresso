import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, ArrowRight, Palette, Layers, Sparkles } from 'lucide-react';
import styles from '../products/ProductsAdminPage.module.css';

export function SnippetsDashboardPage() {
  const snippets = [
    {
      id: 'categories',
      name: 'Categories',
      description: 'Manage apparel classification collections, e.g. T-Shirts, Polos, Kurtas, Hoodies.',
      path: '/snippets/categories',
      icon: Tag,
    },
    {
      id: 'colors',
      name: 'Colors',
      description: 'Define catalog colors with custom display names and hex value swatches.',
      path: '/snippets/colors',
      icon: Palette,
    },
    {
      id: 'sizes',
      name: 'Sizes',
      description: 'Configure standard and premium sizing grids (e.g. S, M, L, XL, XXL, 3XL).',
      path: '/snippets/sizes',
      icon: Layers,
    },
    {
      id: 'patterns',
      name: 'Patterns',
      description: 'Manage print & weave pattern snippets (Bandhani, Ikat, Floral Brocade, Geometric) for Kurtas and Accessories.',
      path: '/snippets/patterns',
      icon: Sparkles,
    }
  ];

  return (
    <div className={styles.workspace} style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className={styles.title}>Snippets</h1>
        <p className={styles.subtitle}>Choose a snippet collection to view or manage custom options</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {snippets.map(snip => {
          const Icon = snip.icon;
          return (
            <Link 
              key={snip.id} 
              to={snip.path}
              style={{
                display: 'flex',
                gap: '16px',
                padding: '24px',
                backgroundColor: 'var(--color-surface-white)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
              className="snippet-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface-white)';
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: 'rgba(5, 122, 120, 0.1)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: 'var(--color-text-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{snip.name}</span>
                  <ArrowRight size={14} style={{ opacity: 0.7 }} />
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                  {snip.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
export default SnippetsDashboardPage;
