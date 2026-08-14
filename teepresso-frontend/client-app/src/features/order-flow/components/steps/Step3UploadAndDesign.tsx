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
    updateInstructions,
    prevStep, 
    nextStep 
  } = useOrderFlow();

  const { artwork } = state;
  const [selectedPrintMethod, setSelectedPrintMethod] = useState<string>('screen_print');
  const [generalFiles, setGeneralFiles] = useState<File[]>([]);

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

      {/* Print Style Dropdown */}
      <div className={styles.sectionBlock} style={{ paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h3 className={styles.sectionHeader} style={{ marginBottom: '8px' }}>Print Style</h3>
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

      <div className={styles.sectionBlock}>
        <h3 className={styles.sectionHeader}>Design Notes & Direct Uploads</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div className={styles.designerInputBlock} style={{ flex: 1 }}>
            <textarea
              id="design-notes"
              rows={3}
              className={styles.notesTextarea}
              placeholder="e.g. Put our company logo on the left chest, and write 'CREW 2026' in bold font across the back."
              value={artwork.instructions}
              onChange={(e) => updateInstructions(e.target.value)}
            />
          </div>
          
          <div className={styles.generalUploadContainer} style={{ marginTop: 0, minWidth: '200px' }}>
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
          <MockupCanvasEditor />
        </div>
      </div>

    </div>
  );
}

export default Step3UploadAndDesign;
