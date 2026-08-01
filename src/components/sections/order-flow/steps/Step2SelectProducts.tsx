'use client';

import React from 'react';
import { useOrderFlow, Product } from '../OrderFlowContext';
import { Button } from '@/components/ui/Button/Button';
import { Card, CardContent } from '@/components/ui/Card/Card';
import { Plus, Check } from 'lucide-react';
import styles from './Step.module.css';

const mockCatalog = [
  { id: 'p1', name: 'Premium Round Neck T-Shirt', category: 'T-Shirts' },
  { id: 'p2', name: 'Corporate Polo T-Shirt', category: 'Polos' },
  { id: 'p3', name: 'Heavyweight Hoodie', category: 'Outerwear' },
  { id: 'p4', name: 'Classic Sweatshirt', category: 'Outerwear' },
  { id: 'p5', name: 'Performance Jersey', category: 'Activewear' },
  { id: 'p6', name: 'Canvas Tote Bag', category: 'Accessories' },
];

export function Step2SelectProducts() {
  const { state, nextStep, prevStep, addProduct, removeProduct } = useOrderFlow();
  
  const handleToggleProduct = (item: { id: string, name: string, category: string }) => {
    const isSelected = state.products.some(p => p.id === item.id);
    if (isSelected) {
      removeProduct(item.id);
    } else {
      addProduct({
        id: item.id,
        name: item.name,
        category: item.category,
        sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0 },
        colors: { primary: '' }
      });
    }
  };

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.title}>Select Products</h2>
      <p className={styles.description}>Choose the garments or items you want to include in this bulk order.</p>
      
      <div className={styles.selectionGrid}>
        {mockCatalog.map(item => {
          const isSelected = state.products.some(p => p.id === item.id);
          return (
            <Card key={item.id} hoverable style={{ borderColor: isSelected ? 'var(--color-primary-600)' : undefined, backgroundColor: isSelected ? 'var(--color-primary-50)' : undefined }}>
              <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', padding: 'var(--spacing-4)' }}>
                <div style={{ aspectRatio: '1', backgroundColor: 'var(--color-secondary-200)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
                  Image
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{item.category}</div>
                  <h3 style={{ fontSize: 'var(--text-base)', margin: 'var(--spacing-1) 0 var(--spacing-2)' }}>{item.name}</h3>
                </div>
                <Button 
                  variant={isSelected ? 'primary' : 'outline'} 
                  size="sm" 
                  leftIcon={isSelected ? <Check size={16} /> : <Plus size={16} />}
                  onClick={() => handleToggleProduct(item)}
                  style={{ width: '100%', marginTop: 'auto' }}
                >
                  {isSelected ? 'Selected' : 'Add to Order'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className={styles.actions}>
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button variant="primary" onClick={nextStep} disabled={state.products.length === 0}>
          Continue to Quantities
        </Button>
      </div>
    </div>
  );
}
