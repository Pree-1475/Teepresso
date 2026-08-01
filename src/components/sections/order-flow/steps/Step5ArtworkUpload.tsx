'use client';

import React, { useCallback, useState } from 'react';
import { useOrderFlow } from '../OrderFlowContext';
import { Button } from '@/components/ui/Button/Button';
import { UploadCloud, FileImage, X, AlertCircle } from 'lucide-react';
import styles from './Step.module.css';

export function Step5ArtworkUpload() {
  const { state, addArtwork, removeArtwork, setNeedsDesignAssistance, nextStep, prevStep } = useOrderFlow();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      // Simulate an upload by generating a fake ID and storing file metadata
      addArtwork({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: file.size,
      });
    });
  };

  const isComplete = state.artwork.length > 0 || state.needsDesignAssistance;

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.title}>Artwork & Design</h2>
      <p className={styles.description}>Upload your high-resolution logos and designs. We accept AI, EPS, SVG, PDF, PSD, PNG, and JPG.</p>
      
      {!state.needsDesignAssistance ? (
        <>
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragging ? 'var(--color-primary-600)' : 'var(--color-border)'}`,
              backgroundColor: isDragging ? 'var(--color-primary-50)' : 'var(--color-background)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--spacing-12)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-4)',
              textAlign: 'center',
              transition: 'all var(--transition-fast)',
              marginTop: 'var(--spacing-6)'
            }}
          >
            <UploadCloud size={48} color="var(--color-primary-600)" />
            <div>
              <h3 style={{ margin: '0 0 var(--spacing-2) 0' }}>Drag & drop your files here</h3>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>or click to browse from your computer</p>
            </div>
            <input 
              type="file" 
              multiple 
              onChange={handleFileInput} 
              style={{ display: 'none' }} 
              id="file-upload" 
              accept=".ai,.eps,.svg,.pdf,.psd,.png,.jpg,.jpeg"
            />
            <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
              Browse Files
            </Button>
          </div>

          {state.artwork.length > 0 && (
            <div style={{ marginTop: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              <h4 style={{ margin: 0 }}>Uploaded Files</h4>
              {state.artwork.map(file => (
                <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                    <div style={{ padding: 'var(--spacing-2)', backgroundColor: 'var(--color-secondary-100)', borderRadius: 'var(--radius-sm)', color: 'var(--color-secondary-600)' }}>
                      <FileImage size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{file.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeArtwork(file.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-error-text)', cursor: 'pointer', padding: 'var(--spacing-2)' }}
                    aria-label="Remove file"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 'var(--spacing-8)', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>Don&apos;t have print-ready artwork?</p>
            <Button variant="ghost" onClick={() => setNeedsDesignAssistance(true)}>
              I need design assistance
            </Button>
          </div>
        </>
      ) : (
        <div style={{ marginTop: 'var(--spacing-6)', padding: 'var(--spacing-8)', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-primary-200)', textAlign: 'center' }}>
          <AlertCircle size={48} color="var(--color-primary-600)" style={{ margin: '0 auto var(--spacing-4)' }} />
          <h3 style={{ margin: '0 0 var(--spacing-2) 0', color: 'var(--color-primary-900)' }}>Design Assistance Requested</h3>
          <p style={{ margin: '0 0 var(--spacing-6) 0', color: 'var(--color-primary-700)' }}>
            No problem! Our expert design team will contact you to discuss your ideas, create mockups, and prepare print-ready files.
          </p>
          <Button variant="outline" onClick={() => setNeedsDesignAssistance(false)}>
            I have artwork to upload
          </Button>
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button variant="primary" onClick={nextStep} disabled={!isComplete}>
          Continue to Printing Options
        </Button>
      </div>
    </div>
  );
}
