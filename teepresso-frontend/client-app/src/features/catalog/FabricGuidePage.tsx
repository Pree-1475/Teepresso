import React, { useState } from 'react';
import Link from 'next/link';
import { Shirt, Palette, CheckCircle2, ArrowRight, Layers, Sparkles, Info } from 'lucide-react';
import { Button } from '@/common/components/ui/Button/Button';
import styles from './fabric-guide.module.css';

const FABRICS = [
  {
    name: '100% Ring-Spun Combed Cotton',
    type: 'Standard Casual Wear',
    specs: ['180 GSM', '100% Cotton', 'Super Soft Feel'],
    desc: 'Our most popular option for general group t-shirts. Ring-spun combing removes short fibers, leaving a smooth, highly durable surface that prints beautifully with screen and DTG methods.',
    pros: ['Very breathable and soft', 'Excellent print resolution', 'Ideal for daily college or colony wear'],
    icon: Shirt
  },
  {
    name: 'Heavyweight Streetwear Cotton',
    type: 'Premium Streetwear',
    specs: ['240 GSM', '100% Cotton', 'Boxy / Oversized Fit'],
    desc: 'Thicker, premium-grade cotton engineered for modern boxy fits and streetwear collections. It holds structure extremely well and gives a luxurious feel favored by tech startups and college fest organizing teams.',
    pros: ['Highly durable structural integrity', 'Excellent for puff printing', 'Premium retail-ready texture'],
    icon: Layers
  },
  {
    name: 'Rich Cotton-Poly Blend',
    type: 'Corporate & Active wear',
    specs: ['220 GSM', '60% Cotton / 40% Polyester', 'Pique Knit'],
    desc: 'The gold standard for corporate polo shirts. The polyester infusion prevents shrinkage, resists wrinkling, and extends color retention while maintaining cotton\'s natural breathability.',
    pros: ['Wrinkle resistant', 'Minimal shrinkage', 'Classic professional look'],
    icon: Sparkles
  },
  {
    name: 'Active Dry-Fit Mesh',
    type: 'Athletic & Sports Wear',
    specs: ['160 GSM', '100% Micro-Polyester', 'Moisture-Wicking'],
    desc: 'Lightweight activewear mesh designed for sports tournaments, athletic clubs, and outdoor events. Draws moisture away from the body to keep the wearer cool and dry.',
    pros: ['Ultra lightweight', 'Quick-drying active mesh', 'Perfect for sublimation & sports prints'],
    icon: Info
  }
];

const PRINTS = [
  {
    name: 'Classic Screen Printing',
    type: 'Best for Bulk',
    specs: ['Plastisol / Water-based', 'Durable', 'Min: 50 Pcs'],
    desc: 'The industry benchmark for bulk customized t-shirts. Individual stencils are created for each color, ensuring rich, vibrant, ink deposits that last the lifetime of the fabric.',
    pros: ['Vibrant color output', 'Extremely durable & wash-proof', 'Unbeatable pricing at high volumes'],
    icon: Palette
  },
  {
    name: 'Direct-To-Garment (DTG)',
    type: 'Best for Complex Art',
    specs: ['Water-based Ink', 'Unlimited Colors', 'Min: 50 Pcs'],
    desc: 'Prints designs directly from computer files onto the fabric using specialized inkjet technology. Ideal for multi-colored logos, gradients, photos, or detailed illustrations.',
    pros: ['No color limits', 'Soft ink texture on fabric', 'Exceptional detail capability'],
    icon: Sparkles
  },
  {
    name: 'Premium Embroidery',
    type: 'Best for Corporate & Polos',
    specs: ['Classic Thread Count', 'Raised Textures', 'Min: 50 Pcs'],
    desc: 'Automated embroidery machines sew colored threads directly into the fabric. Highly recommended for corporate polo shirts, hoodies, and jackets to add a premium, professional touch.',
    pros: ['High professional look', 'Maximum durability', 'Adds unique premium texture'],
    icon: Layers
  },
  {
    name: '3D Puff Print',
    type: 'Best for Trend & Streetwear',
    specs: ['Raised Plastisol', 'Tactile Texture', 'Min: 100 Pcs'],
    desc: 'Special foaming agents are added to the ink, which expands under heat, creating an elevated, three-dimensional tactile effect. Extremely popular for college fest hoodies and streetwear.',
    pros: ['Stunning 3D tactile finish', 'Unique premium look', 'Very popular with youth groups'],
    icon: Shirt
  }
];

export function FabricGuidePage() {
  const [activeTab, setActiveTab] = useState<'fabrics' | 'prints'>('fabrics');

  const currentItems = activeTab === 'fabrics' ? FABRICS : PRINTS;

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.subtitle}>APPAREL CATALOG</span>
          <h1 className={styles.title}>Fabrics & Printing Showcase</h1>
          <p className={styles.description}>
            Learn about our premium fabric options and high-grade printing methods to customize your group apparel perfectly.
          </p>
        </div>

        {/* Tab Controls */}
        <div className={styles.tabsContainer}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'fabrics' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveTab('fabrics')}
          >
            Fabric Varieties
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'prints' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveTab('prints')}
          >
            Printing Techniques
          </button>
        </div>

        {/* Catalog Items */}
        <div className={styles.grid}>
          {currentItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className={styles.card}>
                <div className={styles.mediaWrapper}>
                  <Icon size={64} strokeWidth={1} className={styles.cardIcon} />
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{item.name}</h3>
                  
                  <div className={styles.specRow}>
                    <span className={`${styles.tag} ${styles.primaryTag}`}>{item.type}</span>
                    {item.specs.map((spec, sIdx) => (
                      <span key={sIdx} className={styles.tag}>{spec}</span>
                    ))}
                  </div>

                  <p className={styles.cardDesc}>{item.desc}</p>

                  <div className={styles.prosList}>
                    {item.pros.map((pro, pIdx) => (
                      <div key={pIdx} className={styles.proItem}>
                        <CheckCircle2 size={14} />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>Ready to pick your fabric?</h2>
          <p className={styles.ctaText}>
            Configure your order details in our interactive bulk order configurator to see how your selected fabric affects pricing.
          </p>
          <Link href="/bulk-orders">
            <Button rightIcon={<ArrowRight size={16} />}>Configure Bulk Order</Button>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default FabricGuidePage;
