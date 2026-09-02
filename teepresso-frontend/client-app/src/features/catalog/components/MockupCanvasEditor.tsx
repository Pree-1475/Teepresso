'use client';

import React, { useState, useRef } from 'react';
import { getMockupConfig } from '../data/mockupAssetMap';
import { ArtworkData, PlacementArtworkData, MockupState } from '@/features/cart/context/CartContext';
import { 
  Upload, 
  Trash2, 
  RotateCw, 
  RefreshCw,
  X,
  Maximize
} from 'lucide-react';
import styles from './MockupCanvasEditor.module.css';

interface MockupCanvasEditorProps {
  productId: string;
  artwork: ArtworkData;
  mockup: MockupState;
  setArtwork: React.Dispatch<React.SetStateAction<ArtworkData>>;
  setMockup: React.Dispatch<React.SetStateAction<MockupState>>;
  onPopoverStateChange?: (isOpen: boolean) => void;
}

export function MockupCanvasEditor({ productId, artwork, mockup, setArtwork, setMockup, onPopoverStateChange }: MockupCanvasEditorProps) {
  const mockupConfig = getMockupConfig(productId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedPlacement, setSelectedPlacement] = useState<string>('front');
  const [showPopover, setShowPopover] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const activePlacementData = artwork.placements[selectedPlacement];

  const handleHotspotClick = (placementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPlacement(placementId);
    setMockup(prev => ({ ...prev, activePlacementId: placementId }));
    setShowPopover(true);
    if (onPopoverStateChange) onPopoverStateChange(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
      setArtwork(prev => ({
        ...prev,
        file,
        previewUrl,
        mode: 'has_design',
        placements: {
          ...prev.placements,
          [selectedPlacement]: {
            placementId: selectedPlacement,
            file,
            previewUrl,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0
          }
        }
      }));
      setShowPopover(false);
      if (onPopoverStateChange) onPopoverStateChange(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateItemPlacementTransform = (placementId: string, transform: Partial<PlacementArtworkData>) => {
    setArtwork(prev => {
      const currentPlacement = prev.placements[placementId] || {
        placementId, file: null, previewUrl: '', x: 0, y: 0, scale: 1, rotation: 0,
      };
      return {
        ...prev,
        placements: {
          ...prev.placements,
          [placementId]: { ...currentPlacement, ...transform }
        }
      };
    });
  };

  const handleDragPlacement = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activePlacementData || !activePlacementData.previewUrl) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = activePlacementData.x;
    const initialY = activePlacementData.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = ((moveEvent.clientX - startX) / 300) * 100;
      const dy = ((moveEvent.clientY - startY) / 300) * 100;
      updateItemPlacementTransform(selectedPlacement, {
        x: Math.max(-50, Math.min(50, initialX + dx)),
        y: Math.max(-50, Math.min(50, initialY + dy)),
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const editorContent = (
    <div className={`${styles.workspaceContainer} ${isFullScreen ? styles.workspaceFullScreen : ''}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png, image/jpeg, image/svg+xml, application/pdf"
        style={{ display: 'none' }}
      />

      {/* Mobile View Toggle & Actions */}
      <div className={styles.topActionsRow}>
        <div className={styles.mobileViewToggleRow}>
          <button
            type="button"
            className={`${styles.viewToggleBtn} ${mockup.activeView === 'front' ? styles.viewToggleActive : ''}`}
            onClick={() => setMockup(prev => ({ ...prev, activeView: 'front' }))}
          >
            Front View
          </button>
          <button
            type="button"
            className={`${styles.viewToggleBtn} ${mockup.activeView === 'back' ? styles.viewToggleActive : ''}`}
            onClick={() => setMockup(prev => ({ ...prev, activeView: 'back' }))}
          >
            Back View
          </button>
        </div>
        
        <button 
          type="button" 
          className={styles.expandBtn} 
          onClick={() => setIsFullScreen(!isFullScreen)}
        >
          {isFullScreen ? <X size={16} /> : <Maximize size={16} />}
          <span>{isFullScreen ? "Exit Fullscreen" : "View Fullscreen"}</span>
        </button>
      </div>

      <div className={styles.dualGarmentCanvasRow}>
        {/* FRONT GARMENT WORKSPACE */}
        <div className={`${styles.garmentWorkspaceCard} ${mockup.activeView === 'back' ? styles.hideMobileView : ''}`}>
          <span className={styles.garmentLabelBadge}>FRONT VIEW</span>
          <div className={styles.garmentStage}>
            <img 
              src={mockupConfig.frontImage} 
              alt={`${mockupConfig.name} Front`} 
              className={styles.garmentBaseImg} 
            />

            {mockupConfig.availablePlacements
              .filter(p => p.view === 'front')
              .map(placement => {
                const placementArt = artwork.placements[placement.id];
                const isSelected = selectedPlacement === placement.id;

                return (
                  <div
                    key={placement.id}
                    data-placement={placement.id}
                    className={`${styles.hotspotZone} ${isSelected ? styles.hotspotSelected : ''} ${placementArt?.previewUrl ? styles.hotspotHasArtwork : ''}`}
                    style={{
                      left: `${placement.xPercent}%`,
                      top: `${placement.yPercent}%`,
                      width: `${placement.maxWidthPercent}%`,
                      height: `${placement.maxHeightPercent}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: Math.round(100 - placement.maxWidthPercent),
                    }}
                    onClick={(e) => handleHotspotClick(placement.id, e)}
                  >
                    {placementArt?.previewUrl ? (
                      <div
                        className={styles.renderedArtworkContainer}
                        style={{
                          transform: `translate(${placementArt.x}%, ${placementArt.y}%) scale(${placementArt.scale}) rotate(${placementArt.rotation}deg)`,
                        }}
                        onMouseDown={handleDragPlacement}
                      >
                        <img src={placementArt.previewUrl} alt="Placed Artwork" className={styles.placedLogoImg} />
                      </div>
                    ) : (
                      <div className={styles.hotspotDotMarker}>
                        <span className={styles.hotspotDot} />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* BACK GARMENT WORKSPACE */}
        <div className={`${styles.garmentWorkspaceCard} ${mockup.activeView === 'front' ? styles.hideMobileView : ''}`}>
          <span className={styles.garmentLabelBadge}>BACK VIEW</span>
          <div className={styles.garmentStage}>
            <img 
              src={mockupConfig.backImage} 
              alt={`${mockupConfig.name} Back`} 
              className={styles.garmentBaseImg} 
            />

            {mockupConfig.availablePlacements
              .filter(p => p.view === 'back')
              .map(placement => {
                const placementArt = artwork.placements[placement.id];
                const isSelected = selectedPlacement === placement.id;

                return (
                  <div
                    key={placement.id}
                    data-placement={placement.id}
                    className={`${styles.hotspotZone} ${isSelected ? styles.hotspotSelected : ''} ${placementArt?.previewUrl ? styles.hotspotHasArtwork : ''}`}
                    style={{
                      left: `${placement.xPercent}%`,
                      top: `${placement.yPercent}%`,
                      width: `${placement.maxWidthPercent}%`,
                      height: `${placement.maxHeightPercent}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: Math.round(100 - placement.maxWidthPercent),
                    }}
                    onClick={(e) => handleHotspotClick(placement.id, e)}
                  >
                    {placementArt?.previewUrl ? (
                      <div
                        className={styles.renderedArtworkContainer}
                        style={{
                          transform: `translate(${placementArt.x}%, ${placementArt.y}%) scale(${placementArt.scale}) rotate(${placementArt.rotation}deg)`,
                        }}
                        onMouseDown={handleDragPlacement}
                      >
                        <img src={placementArt.previewUrl} alt="Placed Artwork" className={styles.placedLogoImg} />
                      </div>
                    ) : (
                      <div className={styles.hotspotDotMarker}>
                        <span className={styles.hotspotDot} />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {showPopover && (
        <div className={styles.contextualPopoverModal}>
          <div className={styles.contextualHeader}>
            <span>Placement: <strong>{selectedPlacement.toUpperCase().replace('_', ' ')}</strong></span>
            <button className={styles.closePopoverBtn} onClick={() => { setShowPopover(false); if (onPopoverStateChange) onPopoverStateChange(false); }}>
              <X size={16} />
            </button>
          </div>

          <div className={styles.contextualActions}>
            <button
              type="button"
              className={styles.popoverActionBtnPrimary}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} /> {activePlacementData?.previewUrl ? 'Replace Artwork' : 'Upload Artwork'}
            </button>

            {activePlacementData?.previewUrl && (
              <>
                <div className={styles.popoverControlsRow}>
                  <button
                    type="button"
                    className={styles.iconCtrlBtn}
                    onClick={() =>
                      updateItemPlacementTransform(selectedPlacement, {
                        scale: Math.max(0.5, (activePlacementData.scale || 1) - 0.1),
                      })
                    }
                    title="Scale Down"
                  >
                    −
                  </button>
                  <span className={styles.ctrlLabel}>Size</span>
                  <button
                    type="button"
                    className={styles.iconCtrlBtn}
                    onClick={() =>
                      updateItemPlacementTransform(selectedPlacement, {
                        scale: Math.min(2.0, (activePlacementData.scale || 1) + 0.1),
                      })
                    }
                    title="Scale Up"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    className={styles.iconCtrlBtn}
                    onClick={() =>
                      updateItemPlacementTransform(selectedPlacement, {
                        rotation: ((activePlacementData.rotation || 0) + 15) % 360,
                      })
                    }
                    title="Rotate"
                  >
                    <RotateCw size={14} />
                  </button>

                  <button
                    type="button"
                    className={styles.iconCtrlBtnReset}
                    onClick={() =>
                      updateItemPlacementTransform(selectedPlacement, { x: 0, y: 0, scale: 1, rotation: 0 })
                    }
                    title="Reset Position"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                <button
                  type="button"
                  className={styles.popoverActionBtnDanger}
                  onClick={() => {
                    setArtwork(prev => {
                      const newPlacements = { ...prev.placements };
                      delete newPlacements[selectedPlacement];
                      return { ...prev, placements: newPlacements };
                    });
                    setShowPopover(false);
                    if (onPopoverStateChange) onPopoverStateChange(false);
                  }}
                >
                  <Trash2 size={16} /> Remove Artwork
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (isFullScreen) {
    return (
      <div className={styles.fullScreenOverlay}>
        <div className={styles.fullScreenModalContent}>
          {editorContent}
        </div>
      </div>
    );
  }

  return editorContent;
}

export default MockupCanvasEditor;
