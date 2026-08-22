'use client';

import React, { useState, useRef } from 'react';
import { useOrderFlow } from './OrderFlowContext';
import { getMockupConfig } from '../data/mockupAssetMap';
import { 
  Upload, 
  Trash2, 
  RotateCw, 
  RefreshCw,
  X
} from 'lucide-react';
import styles from './MockupCanvasEditor.module.css';

interface MockupCanvasEditorProps {
  itemId: string;
}

export function MockupCanvasEditor({ itemId }: MockupCanvasEditorProps) {
  const { 
    state, 
    setItemArtworkFile, 
    updateItemPlacementTransform, 
    removeItemPlacementArtwork,
    setItemActiveView,
    setItemActivePlacementId
  } = useOrderFlow();

  const item = state.items.find(i => i.id === itemId);
  if (!item) return null;

  const { artwork, mockup } = item;
  const mockupConfig = getMockupConfig(item.productId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedPlacement, setSelectedPlacement] = useState<string>('front');
  const [showPopover, setShowPopover] = useState<boolean>(false);

  const activePlacementData = artwork.placements[selectedPlacement];

  const handleHotspotClick = (placementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPlacement(placementId);
    setItemActivePlacementId(itemId, placementId);
    setShowPopover(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setItemArtworkFile(itemId, file, previewUrl, selectedPlacement);
      setShowPopover(false);
    }
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
      updateItemPlacementTransform(itemId, selectedPlacement, {
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

  return (
    <div className={styles.workspaceContainer}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png, image/jpeg, image/svg+xml, application/pdf"
        style={{ display: 'none' }}
      />

      {/* Mobile View Toggle */}
      <div className={styles.mobileViewToggleRow}>
        <button
          type="button"
          className={`${styles.viewToggleBtn} ${mockup.activeView === 'front' ? styles.viewToggleActive : ''}`}
          onClick={() => setItemActiveView(itemId, 'front')}
        >
          Front View
        </button>
        <button
          type="button"
          className={`${styles.viewToggleBtn} ${mockup.activeView === 'back' ? styles.viewToggleActive : ''}`}
          onClick={() => setItemActiveView(itemId, 'back')}
        >
          Back View
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
            <button className={styles.closePopoverBtn} onClick={() => setShowPopover(false)}>
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
                      updateItemPlacementTransform(itemId, selectedPlacement, {
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
                      updateItemPlacementTransform(itemId, selectedPlacement, {
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
                      updateItemPlacementTransform(itemId, selectedPlacement, {
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
                      updateItemPlacementTransform(itemId, selectedPlacement, { x: 0, y: 0, scale: 1, rotation: 0 })
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
                    removeItemPlacementArtwork(itemId, selectedPlacement);
                    setShowPopover(false);
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
}

export default MockupCanvasEditor;
