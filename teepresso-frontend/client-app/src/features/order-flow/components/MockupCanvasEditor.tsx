'use client';

import React, { useState, useRef } from 'react';
import { useOrderFlow, MockupTransform } from './OrderFlowContext';
import { Button } from '@/common/components/ui/Button/Button';
import { 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  RefreshCw, 
  Move, 
  ZoomIn, 
  Sparkles, 
  Upload, 
  Check, 
  HelpCircle,
  Send,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import styles from './MockupCanvasEditor.module.css';

interface HistoryState {
  front: MockupTransform;
  back: MockupTransform;
}

export function MockupCanvasEditor() {
  const { 
    state, 
    updateMockupTransform, 
    setActiveView, 
    setDesignerAssistance,
    setArtworkFile,
    updateInstructions
  } = useOrderFlow();

  const { artwork, mockup, product } = state;
  const currentView = mockup.activeView;
  const currentTransform = currentView === 'front' ? mockup.frontTransform : mockup.backTransform;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSubmittedModal, setShowSubmittedModal] = useState<boolean>(false);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<HistoryState[]>([
    { front: { ...mockup.frontTransform }, back: { ...mockup.backTransform } }
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; initialX: number; initialY: number }>({
    x: 0,
    y: 0,
    initialX: 0,
    initialY: 0,
  });

  const pushHistory = (newTransform: MockupTransform) => {
    const updatedState = {
      front: currentView === 'front' ? newTransform : { ...mockup.frontTransform },
      back: currentView === 'back' ? newTransform : { ...mockup.backTransform },
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleTransformChange = (changes: Partial<MockupTransform>) => {
    const updated = { ...currentTransform, ...changes };
    updateMockupTransform(currentView, updated);
  };

  const handleSliderRelease = () => {
    pushHistory(currentTransform);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setArtworkFile(file, previewUrl);
    }
  };

  const handleRemoveArtwork = () => {
    setArtworkFile(null, '');
    const resetTransform = { x: 0, y: 0, scale: 1, rotation: 0 };
    handleTransformChange(resetTransform);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: currentTransform.x,
      initialY: currentTransform.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = (e.clientX - dragStartRef.current.x) * 0.5;
    const deltaY = (e.clientY - dragStartRef.current.y) * 0.5;

    const clampedX = Math.max(-120, Math.min(120, dragStartRef.current.initialX + deltaX));
    const clampedY = Math.max(-140, Math.min(140, dragStartRef.current.initialY + deltaY));

    handleTransformChange({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      pushHistory(currentTransform);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      updateMockupTransform('front', prev.front);
      updateMockupTransform('back', prev.back);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      updateMockupTransform('front', next.front);
      updateMockupTransform('back', next.back);
    }
  };

  const handleReset = () => {
    const resetTransform = { x: 0, y: 0, scale: 1, rotation: 0 };
    handleTransformChange(resetTransform);
    pushHistory(resetTransform);
  };

  const handleSendToTeepresso = () => {
    setShowSubmittedModal(true);
  };

  return (
    <div className={styles.editorContainer}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.ai,.eps,.pdf"
        style={{ display: 'none' }}
      />

      {/* Top Bar: Upload, View Switcher & Action History */}
      <div className={styles.topToolbar}>
        <div className={styles.toolbarLeft}>
          <button 
            type="button" 
            className={styles.uploadBtnHeader} 
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} /> {artwork.file ? 'Change Artwork' : 'Upload Artwork'}
          </button>

          <div className={styles.viewToggleGroup}>
            <button
              type="button"
              className={`${styles.viewBtn} ${currentView === 'front' ? styles.viewBtnActive : ''}`}
              onClick={() => setActiveView('front')}
            >
              Front
            </button>
            <button
              type="button"
              className={`${styles.viewBtn} ${currentView === 'back' ? styles.viewBtnActive : ''}`}
              onClick={() => setActiveView('back')}
            >
              Back
            </button>
          </div>
        </div>

        {/* History Controls: Undo, Redo, Reset, Remove Artwork */}
        <div className={styles.historyGroup}>
          <button 
            type="button" 
            className={styles.iconActionBtn} 
            onClick={handleUndo} 
            disabled={historyIndex === 0} 
            title="Undo"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            type="button" 
            className={styles.iconActionBtn} 
            onClick={handleRedo} 
            disabled={historyIndex >= history.length - 1} 
            title="Redo"
          >
            <RotateCw size={16} />
          </button>
          <button 
            type="button" 
            className={styles.iconActionBtn} 
            onClick={handleReset} 
            title="Reset Placement"
          >
            <RefreshCw size={16} />
          </button>
          {artwork.previewUrl && (
            <button 
              type="button" 
              className={`${styles.iconActionBtn} ${styles.dangerBtn}`} 
              onClick={handleRemoveArtwork} 
              title="Remove Artwork"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {mockup.designerAssistance ? (
        <div className={styles.designerAssistanceBox}>
          <div className={styles.assistanceHeader}>
            <Sparkles size={24} color="var(--color-primary-600)" />
            <h3 className={styles.assistanceTitle}>Need Help With Placement?</h3>
          </div>
          <p className={styles.assistanceDesc}>
            Our Teepresso design team will format your artwork, align print boundaries, and send a high-res digital proof for your approval before printing.
          </p>

          <div className={styles.instructionContainer}>
            <label className={styles.instructionLabel}>
              <MessageSquare size={14} /> Tell our design team what you need:
            </label>
            <textarea
              value={artwork.instructions}
              onChange={(e) => updateInstructions(e.target.value)}
              placeholder="e.g. 'Center the colony emblem on left chest in gold, add batch 2026 on upper back'."
              className={styles.instructionTextarea}
              rows={3}
            />
          </div>

          <button 
            type="button" 
            onClick={() => setDesignerAssistance(false)}
            className={styles.switchBackBtn}
          >
            Switch Back to Interactive Canvas Editor
          </button>
        </div>
      ) : (
        <>
          {/* Interactive Canvas Stage */}
          <div 
            className={styles.canvasStage}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className={styles.tshirtGraphicWrapper} style={{ backgroundColor: product.colorHex }}>
              <div className={styles.tshirtSilhoutte} />
              <div className={styles.collarDetail} />
              <span className={styles.viewIndicator}>{currentView.toUpperCase()} VIEW</span>
            </div>

            <div className={styles.printableBounds}>
              <span className={styles.boundsLabel}>Print Area</span>

              {artwork.previewUrl ? (
                <div
                  className={`${styles.artworkTransformLayer} ${isDragging ? styles.isDragging : ''}`}
                  style={{
                    transform: `translate(${currentTransform.x}px, ${currentTransform.y}px) scale(${currentTransform.scale}) rotate(${currentTransform.rotation}deg)`,
                  }}
                  onMouseDown={handleMouseDown}
                >
                  <img
                    src={artwork.previewUrl}
                    alt="Uploaded Artwork"
                    className={styles.artworkImage}
                    draggable={false}
                  />
                  <div className={styles.dragHandleHint}>
                    <Move size={12} /> Drag to position
                  </div>
                </div>
              ) : (
                <div className={styles.noArtworkNotice} onClick={() => fileInputRef.current?.click()}>
                  <Upload size={24} color="rgba(255,255,255,0.7)" style={{ marginBottom: 4 }} />
                  <span>Click to Upload Artwork</span>
                </div>
              )}
            </div>
          </div>

          {/* Simple Control Sliders: Resize & Rotate */}
          <div className={styles.controlsPanel}>
            <div className={styles.controlRow}>
              <label className={styles.controlLabel}>
                <ZoomIn size={14} /> Size / Scale: {Math.round(currentTransform.scale * 100)}%
              </label>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.05}
                value={currentTransform.scale}
                onChange={(e) => handleTransformChange({ scale: Number(e.target.value) })}
                onMouseUp={handleSliderRelease}
                className={styles.rangeSlider}
              />
            </div>

            <div className={styles.controlRow}>
              <label className={styles.controlLabel}>
                <RotateCw size={14} /> Rotation: {currentTransform.rotation}°
              </label>
              <input
                type="range"
                min={-180}
                max={180}
                step={5}
                value={currentTransform.rotation}
                onChange={(e) => handleTransformChange({ rotation: Number(e.target.value) })}
                onMouseUp={handleSliderRelease}
                className={styles.rangeSlider}
              />
            </div>
          </div>

          {/* Need Help Banner */}
          <div className={styles.assistanceBanner}>
            <div className={styles.assistanceText}>
              <HelpCircle size={16} color="var(--color-primary-600)" />
              <span>Need help with placement?</span>
            </div>
            <button
              type="button"
              className={styles.letDesignerHandleBtn}
              onClick={() => setDesignerAssistance(true)}
            >
              Let Teepresso Design Team Handle It
            </button>
          </div>
        </>
      )}

      {/* Main Action Button */}
      <div className={styles.sendActionRow}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSendToTeepresso}
          leftIcon={<Send size={16} />}
        >
          Send to Teepresso
        </Button>
      </div>

      {/* Submission Confirmation Modal */}
      {showSubmittedModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSubmittedModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeaderIcon}>
              <CheckCircle2 size={48} color="var(--color-primary-600)" />
            </div>
            <h3 className={styles.modalTitle}>Your design request has been sent to our design team.</h3>
            <p className={styles.modalDesc}>
              The Teepresso design team will handle final artwork preparation and send a digital proof to your phone/email.
            </p>

            <Button variant="primary" size="md" onClick={() => setShowSubmittedModal(false)}>
              Got It!
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
