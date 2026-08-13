'use client';

import React, { useRef } from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { Button } from '@/common/components/ui/Button/Button';
import { Upload, FileImage, Sparkles, Check, ArrowRight, ArrowLeft, MessageSquare } from 'lucide-react';
import styles from './Step.module.css';

export function Step4ArtworkUpload() {
  const { state, updateArtworkMode, setArtworkFile, updateInstructions, nextStep, prevStep } = useOrderFlow();
  const { artwork } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setArtworkFile(file, previewUrl);
    }
  };

  return (
    <div className={styles.stepContainer}>
      <span className={styles.stepBadge}>STEP 4 OF 8 • ARTWORK & LOGO</span>
      <h2 className={styles.title}>Do you have an artwork file ready?</h2>
      <p className={styles.description}>Select how you would like to handle your group logo or print design.</p>

      {/* Path Selector */}
      <div className={styles.pathSelectorGrid}>
        <div
          className={`${styles.pathCard} ${artwork.mode === 'has_design' ? styles.pathCardSelected : ''}`}
          onClick={() => updateArtworkMode('has_design')}
        >
          <div className={styles.pathHeader}>
            <FileImage size={24} color="var(--color-primary-600)" />
            <span className={styles.pathTitle}>A. I already have my design</span>
          </div>
          <p className={styles.pathDesc}>Upload your vector file (AI, EPS, PDF) or high-resolution PNG/JPEG image.</p>
          {artwork.mode === 'has_design' && <span className={styles.selectedCheck}><Check size={14} color="#fff" /></span>}
        </div>

        <div
          className={`${styles.pathCard} ${artwork.mode === 'need_help' ? styles.pathCardSelected : ''}`}
          onClick={() => updateArtworkMode('need_help')}
        >
          <div className={styles.pathHeader}>
            <Sparkles size={24} color="var(--color-primary-600)" />
            <span className={styles.pathTitle}>B. I need help with my design</span>
          </div>
          <p className={styles.pathDesc}>Share a rough sketch, logo idea, or text description. Our team will create it for free!</p>
          {artwork.mode === 'need_help' && <span className={styles.selectedCheck}><Check size={14} color="#fff" /></span>}
        </div>
      </div>

      {/* File Upload Box */}
      <div className={styles.uploadDropZone} onClick={() => fileInputRef.current?.click()}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.ai,.eps,.pdf"
          style={{ display: 'none' }}
        />

        {artwork.previewUrl ? (
          <div className={styles.uploadPreview}>
            <img src={artwork.previewUrl} alt="Uploaded Artwork" className={styles.previewImage} />
            <div>
              <div className={styles.previewFileName}>{artwork.file?.name || 'Uploaded Artwork'}</div>
              <span className={styles.changeFileBtn}>Click to change file</span>
            </div>
          </div>
        ) : (
          <div className={styles.uploadPlaceholder}>
            <Upload size={32} color="var(--color-primary-600)" />
            <div className={styles.uploadMainText}>
              {artwork.mode === 'has_design' ? 'Click to upload artwork file' : 'Upload optional reference image / sketch'}
            </div>
            <div className={styles.uploadSubText}>PNG, JPG, SVG, AI, EPS or PDF (Max 25MB)</div>
          </div>
        )}
      </div>

      {/* Human Design Instructions Box */}
      <div className={styles.instructionContainer}>
        <label className={styles.instructionLabel}>
          <MessageSquare size={16} color="var(--color-primary-600)" />
          {artwork.mode === 'need_help' ? 'Design Instructions for our team *' : 'Special Placement Instructions (Optional)'}
        </label>
        <textarea
          value={artwork.instructions}
          onChange={(e) => updateInstructions(e.target.value)}
          placeholder="Tell our designer how you'd like the design placed, recolored, or formatted (e.g. 'Place colony logo on left chest in gold print, add batch 2026 on back')."
          className={styles.instructionTextarea}
          rows={3}
        />
      </div>

      <div className={styles.actions}>
        <Button variant="outline" onClick={prevStep} leftIcon={<ArrowLeft size={16} />}>Back</Button>
        <Button variant="primary" size="lg" onClick={nextStep} rightIcon={<ArrowRight size={18} />}>
          Preview Mockup Placement
        </Button>
      </div>
    </div>
  );
}
