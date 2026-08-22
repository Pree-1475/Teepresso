'use client';

import React, { useState } from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { MockupCanvasEditor } from '../MockupCanvasEditor';
import { Check, ArrowLeft, ArrowRight, Upload } from 'lucide-react';
import styles from './Step.module.css';

const PRINT_PREFERENCES = [
  {
    id: 'screen_print',
    title: 'Screen Printing',
    desc: 'Durable plastisol / water-based inks. Ideal for bulk orders (50+ pcs).',
    popular: true,
  },
  {
    id: 'embroidery',
    title: 'High-Density Embroidery',
    desc: 'Premium stitched thread finish. Perfect for Polo chest & Kurta logos.',
    popular: false,
  },
  {
    id: 'dtg',
    title: 'Direct-to-Garment (DTG)',
    desc: 'Unlimited color gradients & detailed artwork prints.',
    popular: false,
  },
];

export function Step3UploadAndDesign() {
  const { 
    state, 
    updateItemInstructions,
    prevStep, 
    nextStep 
  } = useOrderFlow();

  const [selectedPrintMethod, setSelectedPrintMethod] = useState<string>('screen_print');
  const [generalFiles, setGeneralFiles] = useState<File[]>([]);

  const customizableItems = state.items.filter(item => item.requiresMockup);

  const handleGeneralFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setGeneralFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className={styles.stepCard}>
      <div className={styles.stepHeaderRow}>
        <div className={styles.stepTitleGroup}>
          <span className={styles.stepNumberBadge}>03</span>
          <h2 className={styles.stepTitle}>Upload Your Design</h2>
        </div>
        <div className={styles.actionRowCompact}>
          <button type="button" className={styles.secondaryBtnCompact} onClick={prevStep}>
            <ArrowLeft size={16} /> Back
          </button>
          <button type="button" className={styles.primaryBtnCompact} onClick={nextStep}>
            Next <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {customizableItems.length === 0 ? (
        <div className={styles.sectionBlock} style={{ textAlign: 'center', padding: '40px 20px', background: '#f9fafb', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '12px', color: '#111827' }}>No design required</h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>The products you've selected do not require custom artwork.</p>
          <button type="button" className={styles.primaryBtnLarge} onClick={nextStep}>
            Continue to Review <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <>
          {/* Print Style Dropdown */}
          <div className={styles.sectionBlock} style={{ paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 className={styles.sectionHeader} style={{ marginBottom: '8px' }}>Global Print Style</h3>
            <select 
              id="print-style-select" 
              value={selectedPrintMethod}
              onChange={(e) => setSelectedPrintMethod(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.95rem', color: '#111827', cursor: 'pointer', outline: 'none' }}
            >
              {PRINT_PREFERENCES.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.title} {method.popular ? '(Recommended)' : ''}
                </option>
              ))}
            </select>
            <p style={{ marginTop: '6px', fontSize: '0.85rem', color: '#6b7280' }}>
              {PRINT_PREFERENCES.find(m => m.id === selectedPrintMethod)?.desc}
            </p>
          </div>

          {customizableItems.map((item, index) => (
            <div key={item.id} style={{ marginBottom: '40px', paddingBottom: '20px', borderBottom: index < customizableItems.length - 1 ? '2px dashed #e5e7eb' : 'none' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                Design: {item.name}
              </h3>
              <div className={styles.sectionBlock}>
                <h4 className={styles.sectionHeader}>Design Notes & Direct Uploads</h4>
                <div className={styles.uploadRow}>
                  <div className={styles.designerInputBlock}>
                    <textarea
                      id={`design-notes-${item.id}`}
                      rows={3}
                      className={styles.notesTextarea}
                      placeholder="e.g. Put our company logo on the left chest, and write 'CREW 2026' in bold font across the back."
                      value={item.artwork.instructions}
                      onChange={(e) => updateItemInstructions(item.id, e.target.value)}
                    />
                  </div>
                  
                  <div className={styles.generalUploadContainer} style={{ marginTop: 0 }}>
                    <label className={styles.generalUploadBtn} style={{ width: '100%', justifyContent: 'center' }}>
                      <Upload size={18} /> Choose Files
                      <input 
                        type="file" 
                        multiple 
                        onChange={handleGeneralFileUpload} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                    {generalFiles.length > 0 && (
                      <div className={styles.uploadedFilesList}>
                        {generalFiles.map((f, i) => (
                          <div key={i} className={styles.uploadedFileItem}>
                            <Check size={14} className={styles.fileCheckIcon} /> {f.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.sectionBlock}>
                <div className={styles.canvasWorkspaceSection}>
                  <MockupCanvasEditor itemId={item.id} />
                </div>
              </div>
            </div>
          ))}
        </>
      )}

    </div>
  );
}

export default Step3UploadAndDesign;
