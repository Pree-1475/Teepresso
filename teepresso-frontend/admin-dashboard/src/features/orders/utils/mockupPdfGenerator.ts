import { jsPDF } from 'jspdf';

export type GarmentView = 'front' | 'back' | 'left' | 'right';
export type PlacementKey =
  | 'centre_chest'
  | 'left_chest'
  | 'right_chest'
  | 'full_front'
  | 'back'
  | 'left_sleeve'
  | 'right_sleeve';

export interface PlacementRegion {
  view: GarmentView;
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  label: string;
}

export const PLACEMENT_REGIONS: Record<string, PlacementRegion> = {
  centre_chest: { view: 'front', xPct: 50, yPct: 41, wPct: 30, hPct: 30, label: 'Centre Chest' },
  left_chest:   { view: 'front', xPct: 62, yPct: 34, wPct: 18, hPct: 18, label: 'Left Chest' },
  right_chest:  { view: 'front', xPct: 38, yPct: 34, wPct: 18, hPct: 18, label: 'Right Chest' },
  full_front:   { view: 'front', xPct: 50, yPct: 48, wPct: 44, hPct: 44, label: 'Full Front' },
  back:         { view: 'back',  xPct: 50, yPct: 44, wPct: 36, hPct: 36, label: 'Back' },
  left_sleeve:  { view: 'left',  xPct: 55, yPct: 36, wPct: 18, hPct: 18, label: 'Left Sleeve' },
  right_sleeve: { view: 'right', xPct: 45, yPct: 36, wPct: 18, hPct: 18, label: 'Right Sleeve' },
};

export const GARMENT_VIEWS: { key: GarmentView; label: string; asset: string }[] = [
  { key: 'front', label: 'Front View',   asset: '/images/products/teepresso/white/tee-white-front.png' },
  { key: 'back',  label: 'Back View',    asset: '/images/products/teepresso/white/tee-white-back.png' },
  { key: 'left',  label: 'Left Sleeve',  asset: '/images/products/teepresso/white/tee-white-left.png' },
  { key: 'right', label: 'Right Sleeve', asset: '/images/products/teepresso/white/tee-white-right.png' },
];

const BRAND_COLOURS: { name: string; hex: string; filter: string }[] = [
  { name: 'White',  hex: '#FFFFFF', filter: 'none' },
  { name: 'Black',  hex: '#1F1D1C', filter: 'brightness(0.2) contrast(1.15)' },
  { name: 'Red',    hex: '#C0392B', filter: 'sepia(1) saturate(5) hue-rotate(320deg) brightness(0.72)' },
  { name: 'Navy',   hex: '#1B2A4A', filter: 'sepia(1) saturate(4.2) hue-rotate(185deg) brightness(0.38)' },
  { name: 'Forest', hex: '#1A4D3E', filter: 'sepia(1) saturate(3.8) hue-rotate(100deg) brightness(0.42)' },
  { name: 'Grey',   hex: '#8A8D8F', filter: 'saturate(0) brightness(0.72)' },
  { name: 'Pink',   hex: '#F4A7B9', filter: 'sepia(0.8) saturate(2.2) hue-rotate(290deg) brightness(0.92)' },
  { name: 'Purple', hex: '#5C2D91', filter: 'sepia(1) saturate(3.5) hue-rotate(225deg) brightness(0.48)' },
];

export function getFabricFilter(colorName?: string, colorHex?: string): string {
  const hex = (colorHex || '').toLowerCase().trim();
  const name = (colorName || '').toLowerCase().trim();

  const match = BRAND_COLOURS.find(
    (c) => (hex && c.hex.toLowerCase() === hex) || (name && c.name.toLowerCase() === name)
  );
  if (match) return match.filter;
  if (!name || name === 'default' || name === 'white' || hex === '#ffffff') return 'none';
  return 'none';
}

async function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = async () => {
      // Fallback: try fetching as blob to bypass strict CORS image tainting when possible
      try {
        const res = await fetch(src);
        const blob = await res.blob();
        const objUrl = URL.createObjectURL(blob);
        const retryImg = new Image();
        retryImg.onload = () => {
          URL.revokeObjectURL(objUrl);
          resolve(retryImg);
        };
        retryImg.onerror = (err) => {
          URL.revokeObjectURL(objUrl);
          reject(err);
        };
        retryImg.src = objUrl;
      } catch (err) {
        reject(err);
      }
    };
    img.src = src;
  });
}

/**
 * Composites a single garment side (base T-shirt + fabric tint + placed artworks)
 * onto a 900x900 canvas and returns a PNG data URL.
 */
export async function renderGarmentSideToDataUrl(
  view: GarmentView,
  placements: Record<string, any> = {},
  colorName?: string,
  colorHex?: string
): Promise<string> {
  const size = 900;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Warm studio card background
  ctx.fillStyle = '#F7F4F0';
  ctx.fillRect(0, 0, size, size);

  // Subtle border
  ctx.strokeStyle = '#E5DFD7';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, size - 4, size - 4);

  // 1. Draw base garment PNG with fabric color filter
  const viewMeta = GARMENT_VIEWS.find((v) => v.key === view)!;
  const garmentImg = await loadImageElement(viewMeta.asset);
  const filter = getFabricFilter(colorName, colorHex);

  ctx.save();
  ctx.filter = filter;
  ctx.drawImage(garmentImg, 0, 0, size, size);
  ctx.restore();

  // 2. Draw all artworks assigned to this view
  for (const [key, placementData] of Object.entries(placements || {})) {
    if (!placementData?.previewUrl) continue;
    const region = PLACEMENT_REGIONS[key];
    if (!region || region.view !== view) continue;

    try {
      const artImg = await loadImageElement(placementData.previewUrl);

      const boxW = (region.wPct / 100) * size;
      const boxH = (region.hPct / 100) * size;
      const offsetX = ((Number(placementData.x) || 0) / 100) * size;
      const offsetY = ((Number(placementData.y) || 0) / 100) * size;
      const centerX = (region.xPct / 100) * size + offsetX;
      const centerY = (region.yPct / 100) * size + offsetY;
      const scale = Number(placementData.scale) || 1;
      const rotationDeg = Number(placementData.rotation) || 0;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((rotationDeg * Math.PI) / 180);
      ctx.scale(scale, scale);

      // Preserve aspect ratio (object-fit: contain) inside boxW x boxH
      const imgAspect = artImg.width / (artImg.height || 1);
      const boxAspect = boxW / boxH;
      let drawW = boxW;
      let drawH = boxH;
      if (imgAspect > boxAspect) {
        drawH = boxW / imgAspect;
      } else {
        drawW = boxH * imgAspect;
      }

      ctx.drawImage(artImg, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    } catch (err) {
      console.warn(`Could not render artwork for placement ${key}:`, err);
    }
  }

  return canvas.toDataURL('image/png');
}

export interface PdfOrderMeta {
  orderId: string;
  customerName: string;
  phone?: string;
  orderDate?: string;
  productName: string;
  color?: string;
  colorHex?: string;
  size?: string;
  totalPieces?: number;
  notes?: string;
  placements: Record<string, any>;
}

/**
 * Generates and downloads a production-ready A4 PDF showing all 4 sides
 * of the garment with the customer's placed artwork + order specifications.
 */
export async function generateOrderMockupPdf(meta: PdfOrderMeta): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth(); // 210mm

  // Header Banner
  doc.setFillColor(72, 39, 25); // #482719 Espresso
  doc.rect(0, 0, pageW, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('TEEPRESSO — PRODUCTION MOCKUP SHEET', 14, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Order ID: ${meta.orderId}   |   Date: ${meta.orderDate || '-'}`, 14, 18);

  // Order Metadata Box
  doc.setFillColor(250, 247, 243);
  doc.setDrawColor(230, 223, 215);
  doc.roundedRect(14, 29, pageW - 28, 24, 2, 2, 'FD');

  doc.setTextColor(40, 30, 25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`Customer: ${meta.customerName}`, 18, 36);
  doc.text(`Product: ${meta.productName}`, 18, 42);
  doc.text(`Color: ${meta.color || 'White'}   |   Size: ${meta.size || 'Standard'}   |   Qty: ${meta.totalPieces || 1} pcs`, 18, 48);

  if (meta.phone) {
    doc.setFont('helvetica', 'normal');
    doc.text(`Phone: ${meta.phone}`, pageW - 68, 36);
  }

  // Render all 4 views in parallel
  const renderedViews = await Promise.all(
    GARMENT_VIEWS.map(async (v) => {
      const dataUrl = await renderGarmentSideToDataUrl(
        v.key,
        meta.placements,
        meta.color,
        meta.colorHex
      );

      // Summarize placements on this view
      const activeOnView = Object.entries(meta.placements || {})
        .filter(([k, p]) => p?.previewUrl && PLACEMENT_REGIONS[k]?.view === v.key)
        .map(([k, p]) => {
          const reg = PLACEMENT_REGIONS[k];
          const pct = Math.round((Number(p.scale) || 1) * 100);
          const rot = Math.round(Number(p.rotation) || 0);
          return `${reg?.label || k} (${pct}%${rot ? `, ${rot}°` : ''})`;
        });

      return {
        ...v,
        dataUrl,
        summary: activeOnView.length > 0 ? activeOnView.join(' • ') : 'No artwork placed',
      };
    })
  );

  // 2x2 Grid Layout
  const cardW = 86;
  const cardH = 86;
  const startX = 14;
  const startY = 59;
  const gapX = 10;
  const gapY = 18;

  renderedViews.forEach((rv, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);

    doc.addImage(rv.dataUrl, 'PNG', x, y, cardW, cardH);

    // Side Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(72, 39, 25);
    doc.text(rv.label.toUpperCase(), x, y + cardH + 5);

    // Placement Details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(105, 95, 90);
    doc.text(rv.summary, x, y + cardH + 10, { maxWidth: cardW });
  });

  // Footer Notes
  if (meta.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(72, 39, 25);
    doc.text('Production Notes:', 14, 272);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 55, 50);
    doc.text(meta.notes, 14, 277, { maxWidth: pageW - 28 });
  }

  doc.save(`${meta.orderId}_Mockup_AllSides.pdf`);
}

/**
 * Downloads a single raw customer artwork image directly.
 */
export async function downloadRawArtwork(url: string, filename: string): Promise<void> {
  const res = await fetch(url);
  const blob = await res.blob();
  const ext = blob.type.includes('svg')
    ? 'svg'
    : blob.type.split('/')[1]?.split(';')[0] || 'png';
  const objUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objUrl;
  a.download = `${filename}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objUrl);
}
