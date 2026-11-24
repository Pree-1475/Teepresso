'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStorefront } from '@/common/context/StorefrontContext';
import { useCart, SizeQtyMap, ArtworkData } from '@/features/cart/context/CartContext';
import styles from './ProductPage.module.css';
import {
  UploadCloud, Type, Smile, LayoutGrid, ChevronRight,
  Search, RotateCcw, RotateCw, ZoomIn, ZoomOut,
  Sparkles, Gem, Feather, Shirt, Mic, HelpCircle, ChevronDown,
  ShoppingBag, Heart, Check, Plus, Minus, Info, Truck, Printer, Zap, RefreshCw,
  Pencil, Scan, Square, Play, Pause, Trash2
} from 'lucide-react';
import { API_BASE_URL } from '@/common/config/api';
import { PRODUCTS_CATALOG } from './data/productsData';

/* ---- Types ---- */
interface ColorSnippet { id: string; name: string; hex: string; }
interface SizeSnippet { id: string; name: string; category: string; }

interface ProductItem {
  id: string; name: string; category: string; shortDesc?: string;
  startingPrice: number; priceRange?: string; image: string;
  gallery?: string[];
  colors?: string[];          // hex list chosen by admin
  sizes?: string[];           // size names chosen by admin
  popularFor?: string;
  tiers?: { minQty: number; price: number }[];
  requiresSizes?: boolean; requiresColors?: boolean; requiresMockup?: boolean;
  applyVolumeDiscount?: boolean;
}

type GarmentView = 'front' | 'back' | 'left' | 'right';
type Placement = 'centre_chest' | 'left_chest' | 'right_chest' | 'full_front' | 'back' | 'left_sleeve' | 'right_sleeve';

interface PlacementRegion {
  view: GarmentView;
  xPct: number;  // center x as % of preview width
  yPct: number;  // center y as % of preview height
  wPct: number;  // width as % of preview width
  hPct: number;  // height as % of preview height
  label: string;
}

const PLACEMENT_REGIONS: Record<Placement, PlacementRegion> = {
  centre_chest: { view: 'front', xPct: 50, yPct: 41, wPct: 30, hPct: 30, label: 'Centre Chest' },
  left_chest:   { view: 'front', xPct: 62, yPct: 34, wPct: 18, hPct: 18, label: 'Left Chest' },
  right_chest:  { view: 'front', xPct: 38, yPct: 34, wPct: 18, hPct: 18, label: 'Right Chest' },
  full_front:   { view: 'front', xPct: 50, yPct: 48, wPct: 44, hPct: 44, label: 'Full Front' },
  back:         { view: 'back',  xPct: 50, yPct: 44, wPct: 36, hPct: 36, label: 'Back' },
  left_sleeve:  { view: 'left',  xPct: 50, yPct: 36, wPct: 18, hPct: 18, label: 'Left Sleeve' },
  right_sleeve: { view: 'right', xPct: 50, yPct: 36, wPct: 18, hPct: 18, label: 'Right Sleeve' },
};

const VIEW_DEFAULT_PLACEMENT: Record<GarmentView, Placement> = {
  front: 'centre_chest',
  back: 'back',
  left: 'left_sleeve',
  right: 'right_sleeve',
};

/* ---- Garment PNGs for the 4 views (background-removed photography) ---- */
const GARMENT_ASSETS: Record<GarmentView, string> = {
  front: '/images/products/teepresso/white/tee-white-front.png',
  back:  '/images/products/teepresso/white/tee-white-back.png',
  left:  '/images/products/teepresso/white/tee-white-left.png',
  right: '/images/products/teepresso/white/tee-white-right.png',
};

/* ---- View Thumbnails (Direct from reference screenshot) ---- */
const VIEW_THUMBNAILS: Record<GarmentView, string> = {
  front: '/images/products/teepresso/white/thumb-front.png',
  back:  '/images/products/teepresso/white/thumb-back.png',
  left:  '/images/products/teepresso/white/thumb-left.png',
  right: '/images/products/teepresso/white/thumb-right.png',
};

/* ---- Sample Designs from Reference Screenshot ---- */
interface UploadedItem {
  id: string;
  name: string;
  previewUrl: string;
  file: File | null;
}

const INITIAL_DESIGNS: UploadedItem[] = [
  { id: 'sample-wave',  name: 'The Great Wave', previewUrl: '/images/ui/great-wave.png', file: null },
  { id: 'sample-smile', name: 'Smiley Graphic', previewUrl: '/images/ui/smile.svg',      file: null },
  { id: 'sample-star',  name: 'Star Graphic',   previewUrl: '/images/ui/star.svg',       file: null },
];

/* ---- 3 Size Categories (Exact specification from prompt & reference) ---- */
interface SizeCategory { key: string; label: string; shortLabel: string; sizes: string[]; }
// Offline fallback only — normally categories & sizes come from GET /sizes
const FALLBACK_SIZE_CATEGORIES: SizeCategory[] = ['Kids Sizes', 'Adult Standard', 'Adult Plus (Special)'].map(label => ({
  key: label, label, shortLabel: shortCategoryLabel(label), sizes: ['S', 'M', 'L', 'XL', 'XXL'],
}));
function shortCategoryLabel(label: string) {
  return label.replace(/\(.*?\)/g, '').replace(/\bSizes?\b/i, '').trim() || label;
}

/* ---- Product Accordions ---- */
const STATIC_ACCORDIONS = [
  {
    id: 'care',
    title: 'Care Instructions',
    content: 'Machine wash cold inside-out with like colors. Do not iron directly on print. Tumble dry on low heat or hang dry in shade.'
  },
  {
    id: 'shipping',
    title: 'Shipping & Returns',
    content: 'Standard dispatch in 3-5 business days. Free shipping across India. Quality guarantee: free reprint if any print defect occurs.'
  },
];

/* ============================================================
   MAIN PRODUCT CUSTOMIZATION STUDIO COMPONENT
   ============================================================ */
export function ProductPage() {
  const { contactPhone } = useStorefront();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  /* — Product data — */
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* — Live database metadata snippets — */
  const [allColors, setAllColors] = useState<ColorSnippet[]>([]);
  const [allSizes, setAllSizes] = useState<SizeSnippet[]>([]);

  /* — Studio Customization State (Source of Truth) — */
  const [workflowTab, setWorkflowTab] = useState<'design' | 'product'>(
    () => (new URLSearchParams(window.location.search).get('tab') === 'design' ? 'design' : 'product')
  );
  const [activeView, setActiveView] = useState<GarmentView>('front');
  const [activeColour, setActiveColour] = useState<string>('#FFFFFF');
  const [activeColourName, setActiveColourName] = useState<string>('White');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  /* — Uploads & Artwork State — */
  const [uploadedDesigns, setUploadedDesigns] = useState<UploadedItem[]>(INITIAL_DESIGNS);
  const [activeDesignId, setActiveDesignId] = useState<string>('sample-wave');
  const [selectedPlacement, setSelectedPlacement] = useState<Placement>('centre_chest');

  const [artwork, setArtwork] = useState<ArtworkData>({
    file: null,
    previewUrl: '/images/ui/great-wave.png',
    mode: 'has_design',
    instructions: '',
    placements: {
      centre_chest: {
        placementId: 'centre_chest',
        file: null,
        previewUrl: '/images/ui/great-wave.png',
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
      }
    }
  });

  /* — Size & Quantity Configuration — */
  // Unset = open: every size category is expanded when the page loads
  const [openSizeCategories, setOpenSizeCategories] = useState<Record<string, boolean>>({});
  // Quantity per size, keyed `${categoryName}:${size}` so Kids M and Adult M stay separate
  const [sizeQty, setSizeQty] = useState<Record<string, number>>({});
  const seededDefaultRef = useRef(false);

  /* — Voice Note State — */
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [voiceNoteBase64, setVoiceNoteBase64] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  /* — UI States — */
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  /* ---- Data Loading: DB fetch with Catalog fallback ---- */
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [prodRes, colRes, sizeRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products/${id}`).then(r => r.json()).catch(() => null),
          fetch(`${API_BASE_URL}/colors`).then(r => r.json()).catch(() => null),
          fetch(`${API_BASE_URL}/sizes`).then(r => r.json()).catch(() => null),
        ]);

        if (!isMounted) return;

        if (colRes?.success && Array.isArray(colRes.colors)) setAllColors(colRes.colors);
        if (sizeRes?.success && Array.isArray(sizeRes.sizes)) setAllSizes(sizeRes.sizes);

        let prod: any = null;
        if (prodRes?.success && prodRes?.product) {
          prod = prodRes.product;
        } else {
          // Catalog match
          const local = PRODUCTS_CATALOG.find(p => p.id === id) || PRODUCTS_CATALOG[0];
          prod = { ...local };
        }

        if (prod && isMounted) setProduct(prod);
        else if (isMounted) setError('Product not found');
      } catch {
        if (isMounted) {
          const local = PRODUCTS_CATALOG.find(p => p.id === id) || PRODUCTS_CATALOG[0];
          setProduct({ ...local });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [id]);

  /* ---- Computed Available Swatches ---- */
  // Only the colours the admin enabled for THIS product (product.colors = hex list)
  const swatches = useMemo(() => {
    const productHexes = (product?.colors || []).filter(Boolean);
    if (productHexes.length > 0) {
      return productHexes.map(hex => {
        const named = allColors.find(c => c.hex.toLowerCase() === hex.toLowerCase());
        return { name: named?.name || hex.toUpperCase(), hex };
      });
    }
    return [] as { name: string; hex: string }[];
  }, [allColors, product]);

  // Default to the product's first colour once loaded
  useEffect(() => {
    if (swatches.length === 0) {
      if (product) { setActiveColour('#FFFFFF'); setActiveColourName('Standard'); }
      return;
    }
    setActiveColour(swatches[0].hex);
    setActiveColourName(swatches[0].name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, swatches.length === 0]);

  /* ---- Product photography (admin-uploaded: main image + gallery) ---- */
  const productPhotos = useMemo(
    () => [product?.image, ...(product?.gallery || [])].filter((u): u is string => !!u),
    [product]
  );
  const usePhotos = productPhotos.length > 0;
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  useEffect(() => { setActivePhotoIdx(0); }, [product?.id]);

  /* ---- Size categories from backend (grouped by category, admin order) ---- */
  // Only the sizes the admin enabled for THIS product (product.sizes = size names)
  const productSizeNames: string[] | null = product?.sizes && product.sizes.length > 0 ? product.sizes : null;

  const sizeCategories = useMemo<SizeCategory[]>(() => {
    const enabled = (name: string) => !productSizeNames || productSizeNames.includes(name);
    let cats: SizeCategory[];
    if (allSizes.length === 0) {
      cats = FALLBACK_SIZE_CATEGORIES.map(c => ({ ...c, sizes: c.sizes.filter(enabled) }));
    } else {
      const map = new Map<string, string[]>();
      allSizes.forEach(sz => {
        if (!enabled(sz.name)) return;
        const cat = sz.category || 'Adult Standard';
        if (!map.has(cat)) map.set(cat, []);
        map.get(cat)!.push(sz.name);
      });
      cats = Array.from(map, ([label, sizes]) => ({ key: label, label, shortLabel: shortCategoryLabel(label), sizes }));
    }
    return cats.filter(c => c.sizes.length > 0);
  }, [allSizes, productSizeNames]);

  const defaultOpenKey = (sizeCategories.find(c => /adult/i.test(c.label)) || sizeCategories[0])?.key;

  // Seed one default piece (Adult, L) once sizes have loaded
  useEffect(() => {
    if (seededDefaultRef.current || loading) return;
    const cat = sizeCategories.find(c => c.key === defaultOpenKey);
    if (!cat) return;
    seededDefaultRef.current = true;
    const size = cat.sizes.includes('L') ? 'L' : cat.sizes[0];
    if (size) setSizeQty(prev => (Object.keys(prev).length ? prev : { [`${cat.key}:${size}`]: 1 }));
  }, [sizeCategories, defaultOpenKey, loading]);

  /* ---- Active Placement & Artwork ---- */
  const activePlacementData = artwork.placements[selectedPlacement];
  const activeRegion = PLACEMENT_REGIONS[selectedPlacement];

  /* ---- View and Placement Selection Sync ---- */
  const handleSelectView = useCallback((viewKey: GarmentView) => {
    setActiveView(viewKey);
    const currentPlacementView = PLACEMENT_REGIONS[selectedPlacement]?.view;
    if (currentPlacementView !== viewKey) {
      setSelectedPlacement(VIEW_DEFAULT_PLACEMENT[viewKey]);
    }
  }, [selectedPlacement]);

  const handleSelectPlacement = useCallback((placementKey: Placement) => {
    setSelectedPlacement(placementKey);
    const targetView = PLACEMENT_REGIONS[placementKey].view;
    if (activeView !== targetView) {
      setActiveView(targetView);
    }
  }, [activeView]);

  /* ---- Artwork interaction: move / scale / rotate (unified pointer events) ---- */
  const artLayerRef = useRef<HTMLDivElement>(null);
  const [imgAspect, setImgAspect] = useState<Record<string, number>>({});

  const updateActivePlacement = useCallback((patch: Partial<{ x: number; y: number; scale: number; rotation: number }>) => {
    const key = selectedPlacement;
    setArtwork(prev => {
      const cur = prev.placements[key];
      if (!cur) return prev;
      return { ...prev, placements: { ...prev.placements, [key]: { ...cur, ...patch } } };
    });
  }, [selectedPlacement]);

  const startArtworkInteraction = (mode: 'move' | 'scale' | 'rotate') => (e: React.PointerEvent) => {
    const cur = activePlacementData;
    const layer = artLayerRef.current;
    const frame = (e.currentTarget as HTMLElement).closest('[data-art-frame]') as HTMLElement | null;
    if (!cur || !layer || !frame) return;
    e.preventDefault();
    e.stopPropagation();

    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
    const layerRect = layer.getBoundingClientRect();
    const fr = frame.getBoundingClientRect();
    const cx = fr.left + fr.width / 2;
    const cy = fr.top + fr.height / 2;
    const startX = e.clientX;
    const startY = e.clientY;
    const startDist = Math.hypot(startX - cx, startY - cy) || 1;
    const startAngle = Math.atan2(startY - cy, startX - cx);
    const init = { x: cur.x, y: cur.y, scale: cur.scale || 1, rotation: cur.rotation || 0 };

    const onMove = (ev: PointerEvent) => {
      if (mode === 'move') {
        updateActivePlacement({
          x: clamp(init.x + ((ev.clientX - startX) / layerRect.width) * 100, -28, 28),
          y: clamp(init.y + ((ev.clientY - startY) / layerRect.height) * 100, -28, 28),
        });
      } else if (mode === 'scale') {
        const d = Math.hypot(ev.clientX - cx, ev.clientY - cy);
        updateActivePlacement({ scale: clamp(Number((init.scale * (d / startDist)).toFixed(2)), 0.3, 2.5) });
      } else {
        let deg = init.rotation + ((Math.atan2(ev.clientY - cy, ev.clientX - cx) - startAngle) * 180) / Math.PI;
        deg = ((deg % 360) + 360) % 360;
        const snap = Math.round(deg / 15) * 15;
        if (Math.abs(deg - snap) < 3) deg = snap % 360; // snap to 15° steps
        updateActivePlacement({ rotation: Math.round(deg) });
      }
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  /* Frame size (in % of the placement box) that matches the image's real aspect ratio */
  const getFrameSize = (url: string, region: PlacementRegion = activeRegion) => {
    const imgA = imgAspect[url] || 1;
    const boxA = region.wPct / region.hPct;
    return imgA >= boxA
      ? { w: 100, h: (boxA / imgA) * 100 }
      : { w: (imgA / boxA) * 100, h: 100 };
  };

  /* ---- Scale and Rotate Adjusters ---- */
  const handleAdjustScale = (delta: number) => {
    setArtwork(prev => {
      const cur = prev.placements[selectedPlacement];
      if (!cur) return prev;
      const newScale = Math.max(0.3, Math.min(2.5, Number(((cur.scale || 1) + delta).toFixed(2))));
      return {
        ...prev,
        placements: {
          ...prev.placements,
          [selectedPlacement]: {
            ...cur,
            scale: newScale
          }
        }
      };
    });
  };

  const handleResetScale = () => {
    setArtwork(prev => {
      const cur = prev.placements[selectedPlacement];
      if (!cur) return prev;
      return {
        ...prev,
        placements: {
          ...prev.placements,
          [selectedPlacement]: {
            ...cur,
            scale: 1
          }
        }
      };
    });
  };

  const handleRotate = () => {
    setArtwork(prev => {
      const cur = prev.placements[selectedPlacement];
      if (!cur) return prev;
      const newRot = ((cur.rotation || 0) + 15) % 360;
      return {
        ...prev,
        placements: {
          ...prev.placements,
          [selectedPlacement]: {
            ...cur,
            rotation: newRot
          }
        }
      };
    });
  };

  /* ---- Remove Artwork from Current Placement ---- */
  const handleRemoveArtwork = () => {
    setArtwork(prev => {
      const newPlacements = { ...prev.placements };
      delete newPlacements[selectedPlacement];
      return {
        ...prev,
        placements: newPlacements
      };
    });
  };

  /* ---- Place Active Design on Current Placement ---- */
  const handlePlaceCurrentDesign = () => {
    const currentDesign = uploadedDesigns.find(d => d.id === activeDesignId) || uploadedDesigns[0];
    if (!currentDesign) return;

    setArtwork(prev => ({
      ...prev,
      file: currentDesign.file,
      previewUrl: currentDesign.previewUrl,
      mode: 'has_design',
      placements: {
        ...prev.placements,
        [selectedPlacement]: {
          placementId: selectedPlacement,
          file: currentDesign.file,
          previewUrl: currentDesign.previewUrl,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0
        }
      }
    }));
  };

  /* ---- Upload Files Handling ---- */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        const newDesign: UploadedItem = {
          id: `design-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          previewUrl,
          file
        };

        setUploadedDesigns(prev => [newDesign, ...prev]);
        setActiveDesignId(newDesign.id);

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
              rotation: 0,
            }
          }
        }));
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ---- Select from My Designs ---- */
  const handleSelectDesign = (design: UploadedItem) => {
    setActiveDesignId(design.id);
    setArtwork(prev => {
      const existing = prev.placements[selectedPlacement];
      return {
        ...prev,
        file: design.file,
        previewUrl: design.previewUrl,
        mode: 'has_design',
        placements: {
          ...prev.placements,
          [selectedPlacement]: {
            placementId: selectedPlacement,
            file: design.file,
            previewUrl: design.previewUrl,
            x: existing?.x ?? 0,
            y: existing?.y ?? 0,
            scale: existing?.scale ?? 1,
            rotation: existing?.rotation ?? 0,
          }
        }
      };
    });
  };

  /* ---- Colour Swatch Selection ---- */
  const handleColourClick = (c: typeof swatches[0]) => {
    setActiveColour(c.hex);
    setActiveColourName(c.name);
  };

  /* ---- Zoom In / Out ---- */
  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(70, Math.min(160, prev + delta)));
  };

  /* ---- Reset Transformations (Undo/Redo) ---- */
  const handleResetTransform = () => {
    setArtwork(prev => {
      const current = prev.placements[selectedPlacement];
      if (!current) return prev;
      return {
        ...prev,
        placements: {
          ...prev.placements,
          [selectedPlacement]: {
            ...current,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0
          }
        }
      };
    });
  };

  /* ---- Voice Note Recording Logic ---- */
  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Microphone access is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setVoiceAudioUrl(url);

        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceNoteBase64(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      audioTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch {
      alert('Microphone access was denied. Please allow microphone permissions in browser settings.');
    }
  };

  const stopRecording = () => {
    if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const deleteRecording = () => {
    if (audioElementRef.current) audioElementRef.current.pause();
    if (voiceAudioUrl) URL.revokeObjectURL(voiceAudioUrl);
    setVoiceAudioUrl(null);
    setVoiceNoteBase64(null);
    setIsPlayingAudio(false);
    setRecordingSeconds(0);
  };

  const toggleAudioPlayback = () => {
    if (!audioElementRef.current) return;
    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => setIsPlayingAudio(false));
    }
  };

  /* ---- Accordion Toggle ---- */
  const toggleAccordion = (accId: string) => {
    setOpenAccordions(prev => ({ ...prev, [accId]: !prev[accId] }));
  };

  /* ---- Size Category Toggle ---- */
  const toggleSizeCategory = (catKey: string) => {
    setOpenSizeCategories(prev => ({ ...prev, [catKey]: !(prev[catKey] ?? true) }));
  };

  /* ---- Add To Cart Action ---- */
  const setQtyFor = (key: string, next: number) => {
    setSizeQty(prev => {
      const copy = { ...prev };
      const v = Math.max(0, Math.min(9999, Math.floor(next) || 0));
      if (v === 0) delete copy[key]; else copy[key] = v;
      return copy;
    });
  };

  /* Ordered list of selected sizes, e.g. [{ key:'kids:S', label:'Kids S', qty:5 }] */
  const orderLines = useMemo(() => {
    const lines: { key: string; label: string; qty: number }[] = [];
    sizeCategories.forEach(cat => {
      cat.sizes.forEach(sz => {
        const key = `${cat.key}:${sz}`;
        const qty = sizeQty[key] || 0;
        if (qty > 0) lines.push({ key, label: `${cat.shortLabel} ${sz}`, qty });
      });
    });
    return lines;
  }, [sizeQty, sizeCategories]);

  const categoryCount = (catKey: string) =>
    (sizeCategories.find(c => c.key === catKey)?.sizes ?? [])
      .reduce((sum, sz) => sum + (sizeQty[`${catKey}:${sz}`] || 0), 0);

  const handleAddToCart = () => {
    if (!product || totalPieces === 0) return;

    const sizesMap: SizeQtyMap = {};
    orderLines.forEach(l => { sizesMap[l.label] = l.qty; });
    const quantity = totalPieces;

    addToCart({
      productId: product.id,
      name: product.name,
      category: product.category,
      pricePerUnit: unitPrice, // tier price for this quantity
      requiresSizes: product.requiresSizes ?? true,
      requiresColors: product.requiresColors ?? true,
      requiresMockup: product.requiresMockup ?? true,
      applyVolumeDiscount: false, // tiers already applied in unitPrice
      colorVariants: [{
        id: `variant-${activeColour}`,
        color: activeColourName,
        colorHex: activeColour,
        sizes: sizesMap,
        quantity,
      }],
      artwork: {
        ...artwork,
        voiceNote: voiceNoteBase64,
        voiceNoteDuration: recordingSeconds
      },
      voiceNote: voiceNoteBase64,
      voiceNoteDuration: recordingSeconds
    });
  };

  /* ---- Save Design Action ---- */
  const handleSaveDesign = () => {
    const payload = {
      productId: product?.id,
      colour: activeColour,
      colourName: activeColourName,
      view: activeView,
      placement: selectedPlacement,
      artwork,
      sizes: Object.fromEntries(orderLines.map(l => [l.label, l.qty])),
      quantity: totalPieces,
      savedAt: new Date().toISOString(),
    };

    try {
      const stored = JSON.parse(localStorage.getItem('teepresso_saved_designs') || '[]');
      stored.unshift(payload);
      localStorage.setItem('teepresso_saved_designs', JSON.stringify(stored.slice(0, 20)));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2400);
    } catch {
      // fallback
    }
  };

  /* ---- WhatsApp Contact Us ---- */
  const handleContactUs = () => {
    const phone = contactPhone || '919390771123';
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=Hi+Teepresso%2C+I+need+help+customizing+my+T-shirt.`, '_blank');
  };

  const productPrice = product?.startingPrice || 499;
  const popularForTags = (product?.popularFor || '').split(',').map(t => t.trim()).filter(Boolean);
  const totalPieces = orderLines.reduce((sum, l) => sum + l.qty, 0);
  // Admin-defined quantity tiers: price per piece is the highest tier whose minQty is reached
  const sortedTiers = useMemo(
    () => [...(product?.tiers || [])].map(t => ({ minQty: Number(t.minQty), price: Number(t.price) })).sort((a, b) => a.minQty - b.minQty),
    [product]
  );
  const unitPrice = sortedTiers.length === 0
    ? productPrice
    : ([...sortedTiers].reverse().find(t => totalPieces >= t.minQty)?.price ?? sortedTiers[0].price);
  const nextTier = sortedTiers.find(t => t.minQty > totalPieces && t.price < unitPrice);
  const accordions = [
    ...(sortedTiers.length > 1 ? [{ id: 'bulk', title: 'Bulk Pricing', content: '' }] : []),
    ...STATIC_ACCORDIONS,
  ];
  const estimatedTotal = totalPieces * unitPrice;
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className={styles.studioPage}>
      {/* Hidden File Upload Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png, image/jpeg, image/webp, image/svg+xml"
        multiple
        style={{ display: 'none' }}
        aria-label="Upload custom artwork"
      />

      {/* Hidden Audio Element for Voice Preview */}
      {voiceAudioUrl && (
        <audio
          ref={audioElementRef}
          src={voiceAudioUrl}
          onEnded={() => setIsPlayingAudio(false)}
        />
      )}

      {/* ── Mode switch: Product / Design ── */}
      <div className={styles.workflowContainer}>
        <div className={styles.workflowPill} role="tablist" aria-label="Product or design view">
          <button
            type="button"
            role="tab"
            aria-selected={workflowTab === 'product'}
            className={`${styles.tabItem} ${workflowTab === 'product' ? styles.tabItemActive : ''}`}
            onClick={() => setWorkflowTab('product')}
          >
            <Shirt size={14} />
            <span>Product</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={workflowTab === 'design'}
            className={`${styles.tabItem} ${workflowTab === 'design' ? styles.tabItemActive : ''}`}
            onClick={() => setWorkflowTab('design')}
          >
            <Pencil size={14} />
            <span>Design</span>
          </button>
        </div>
      </div>

      {workflowTab === 'product' ? (
      /* ══════════ PRODUCT: photos + details ══════════ */
      <main className={styles.productLayout}>
        <section className={styles.gallery} aria-label="Product photos">
          {productPhotos.length > 1 && (
            <div className={styles.galleryThumbs} role="tablist" aria-label="Select product photo">
              {productPhotos.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={activePhotoIdx === i}
                  aria-label={`${product?.name} photo ${i + 1}`}
                  className={`${styles.galleryThumb} ${activePhotoIdx === i ? styles.galleryThumbActive : ''}`}
                  onClick={() => setActivePhotoIdx(i)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
          <div className={styles.galleryMain}>
            {usePhotos ? (
              <img src={productPhotos[activePhotoIdx]} alt={`${product?.name} photo ${activePhotoIdx + 1}`} />
            ) : (
              <div className={styles.galleryEmpty}>No photo available</div>
            )}
          </div>
        </section>

        <section className={styles.details} aria-label="Product details">
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link to="/products">Products</Link>
            <span aria-hidden="true">/</span>
            <span>{product?.name}</span>
          </nav>
          {/* Heading */}
          <div className={styles.productHeadingArea}>
            <h1 className={styles.productTitle}>{product?.name}</h1>
            {product?.shortDesc && <p className={styles.productSubtitle}>{product.shortDesc}</p>}
          </div>

          {/* Popular-for tags (admin-set) */}
          {popularForTags.length > 0 && (
            <div className={styles.popularForRow}>
              <span className={styles.popularForLabel}>Popular for</span>
              {popularForTags.map(t => <span key={t} className={styles.popularForTag}>{t}</span>)}
            </div>
          )}

          {/* Price Header */}
          <div className={styles.priceSection}>
            <p className={styles.priceLabel}>Your Custom {product?.name}</p>
            <div className={styles.priceRow}>
              <span className={styles.priceVal}>{fmt(unitPrice)}</span>
              <span className={styles.perPiece}>per piece</span>
              <span title="Includes fabric, printing & GST" className={styles.priceInfoIcon}>
                <Info size={14} />
              </span>
            </div>
            <p className={styles.priceSubnote}>
              {nextTier
                ? `Buy ${nextTier.minQty}+ for ${fmt(nextTier.price)}/pc`
                : 'All customisations included'}
            </p>
          </div>

          {/* Customise CTA */}
          <button type="button" className={styles.customiseBtn} onClick={() => setWorkflowTab('design')}>
            <Pencil size={16} />
            <span>Customise your design</span>
          </button>

          {swatches.length > 0 && product?.requiresColors !== false && (
          <div className={styles.colourSection}>
            <p className={styles.sectionHeading}>Colour — <span className={styles.colourNameText}>{activeColourName}</span></p>
            <div className={styles.swatchesRow} role="group" aria-label="Select garment colour">
              {swatches.map(c => {
                const isSelected = activeColour.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    className={`${styles.colourSwatch} ${isSelected ? styles.colourSwatchActive : ''}`}
                    style={{ backgroundColor: c.hex }}
                    onClick={() => handleColourClick(c)}
                    title={c.name}
                    aria-label={`Select ${c.name} colour`}
                    aria-pressed={isSelected}
                  />
                );
              })}
              <button
                type="button"
                className={styles.swatchPlusBtn}
                onClick={handleContactUs}
                title="Custom Pantone / Dye Request"
                aria-label="Request custom colour"
              >
                +
              </button>
            </div>
          </div>
          )}

          {/* 3 Size Categories (Kids, Adult Standard, Adult Plus) */}
          <div className={styles.sizeCategoriesGroup} role="group" aria-label="Size selection categories">
            {sizeCategories.map(category => {
              const isOpen = openSizeCategories[category.key] ?? true;
              return (
                <div key={category.key} className={styles.sizeCategoryBox}>
                  <button
                    type="button"
                    className={styles.sizeCategoryHeader}
                    onClick={() => toggleSizeCategory(category.key)}
                    aria-expanded={isOpen}
                  >
                    <span>
                      {category.label}
                      {categoryCount(category.key) > 0 && (
                        <span className={styles.sizeCategoryCount}>{categoryCount(category.key)} selected</span>
                      )}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`${styles.accordionChevron} ${isOpen ? styles.accordionChevronOpen : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className={styles.sizeQtyList}>
                      {category.sizes.map(sizeStr => {
                        const key = `${category.key}:${sizeStr}`;
                        const qty = sizeQty[key] || 0;
                        return (
                          <div key={key} className={`${styles.sizeQtyRow} ${qty > 0 ? styles.sizeQtyRowActive : ''}`}>
                            <span className={styles.sizeQtyLabel}>{sizeStr}</span>
                            <div className={styles.sizeQtyStepper} role="group" aria-label={`${category.label} ${sizeStr} quantity`}>
                              <button type="button" className={styles.qtyBtn} onClick={() => setQtyFor(key, qty - 1)} disabled={qty === 0} aria-label={`Decrease ${category.label} ${sizeStr}`}>
                                <Minus size={12} />
                              </button>
                              <input
                                type="number"
                                min={0}
                                inputMode="numeric"
                                className={styles.sizeQtyInput}
                                value={qty}
                                onChange={e => setQtyFor(key, parseInt(e.target.value, 10))}
                                aria-label={`${category.label} ${sizeStr} quantity`}
                              />
                              <button type="button" className={styles.qtyBtn} onClick={() => setQtyFor(key, qty + 1)} aria-label={`Increase ${category.label} ${sizeStr}`}>
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary} aria-live="polite">
            <p className={styles.sectionHeading}>Your order</p>
            {orderLines.length === 0 ? (
              <p className={styles.orderEmpty}>Choose a quantity for at least one size.</p>
            ) : (
              <>
                <ul className={styles.orderList}>
                  {orderLines.map(l => (
                    <li key={l.key} className={styles.orderLine}>
                      <span>{l.label} × {l.qty}</span>
                      <button type="button" className={styles.orderRemove} onClick={() => setQtyFor(l.key, 0)} aria-label={`Remove ${l.label}`}>×</button>
                    </li>
                  ))}
                </ul>
                <div className={styles.orderTotalRow}>
                  <span>{totalPieces} {totalPieces === 1 ? 'piece' : 'pieces'} · {fmt(unitPrice)}/pc</span>
                  <strong>{fmt(estimatedTotal)}</strong>
                </div>
              </>
            )}
          </div>


          {/* Instructions for our team */}
          <div className={styles.notesSection}>
            <p className={styles.sectionHeading}>Notes for our team</p>
          {/* Voice Note Section (Warm Peach/Tan Card) */}
          <div className={styles.voiceNoteCard}>
            <div className={styles.voiceNoteLeft}>
              <Mic size={18} className={styles.voiceNoteMicIcon} />
              <div>
                <p className={styles.voiceNoteTitle}>Add a Voice Note</p>
                <p className={styles.voiceNoteDesc}>
                  {isRecording
                    ? `Recording: ${Math.floor(recordingSeconds / 60)}:${(recordingSeconds % 60).toString().padStart(2, '0')}`
                    : voiceAudioUrl
                    ? 'Voice instructions recorded. Click to preview or replace.'
                    : 'Record your instructions or customization requirements.'}
                </p>
              </div>
            </div>

            {/* Dynamic Mic / Play / Stop Button */}
            {!isRecording && !voiceAudioUrl && (
              <button
                type="button"
                className={styles.voiceMicActionBtn}
                onClick={startRecording}
                title="Start Recording Voice Note"
                aria-label="Start recording voice note"
              >
                <Mic size={17} />
              </button>
            )}

            {isRecording && (
              <button
                type="button"
                className={`${styles.voiceMicActionBtn} ${styles.voiceRecordingActive}`}
                onClick={stopRecording}
                title="Stop Recording"
                aria-label="Stop recording"
              >
                <Square size={13} fill="#FFFFFF" />
              </button>
            )}

            {voiceAudioUrl && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className={styles.voiceMicActionBtn}
                  onClick={toggleAudioPlayback}
                  title={isPlayingAudio ? 'Pause' : 'Play'}
                  aria-label="Play recording"
                >
                  {isPlayingAudio ? <Pause size={15} /> : <Play size={15} fill="#FFFFFF" />}
                </button>
                <button
                  type="button"
                  className={styles.voiceMicActionBtn}
                  style={{ background: '#77716D' }}
                  onClick={deleteRecording}
                  title="Delete Recording"
                  aria-label="Delete recording"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Design Assistance Card */}
          <div className={styles.helpRow}>
            <div className={styles.helpLeft}>
              <HelpCircle size={18} className={styles.helpIcon} />
              <p className={styles.helpTitle}>Need help with design?</p>
            </div>
            <button
              type="button"
              className={styles.contactBtn}
              onClick={handleContactUs}
            >
              Contact Us
            </button>
          </div>

          </div>

          {/* Accordion Stack */}
          <div className={styles.accordionList} role="list">
            {accordions.map(acc => {
              const isOpen = !!openAccordions[acc.id];
              return (
                <div key={acc.id} className={styles.accordionItem} role="listitem">
                  <button
                    type="button"
                    className={styles.accordionTrigger}
                    onClick={() => toggleAccordion(acc.id)}
                    aria-expanded={isOpen}
                  >
                    <span>{acc.title}</span>
                    <ChevronDown
                      size={15}
                      className={`${styles.accordionChevron} ${isOpen ? styles.accordionChevronOpen : ''}`}
                    />
                  </button>
                  <div className={`${styles.accordionContent} ${isOpen ? styles.accordionContentOpen : ''}`}>
                    {acc.id === 'bulk' ? (
                      <table className={styles.tierTable}>
                        <tbody>
                          {sortedTiers.map(t => (
                            <tr key={t.minQty}><td>{t.minQty}+ pcs</td><td>{fmt(t.price)} / pc</td></tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className={styles.accordionBody}>{acc.content}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      ) : (
      /* ══════════ DESIGN: mockup studio ══════════ */
      <main className={styles.designGrid}>
        <aside className={styles.designSidebar} aria-label="Design tools & uploads">
          {/* Primary Upload Button */}
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload artwork"
          >
            <UploadCloud size={20} />
            <span>Upload</span>
          </button>

          <div className={styles.sidebarDivider} />

          {/* My Designs Section */}
          <div className={styles.myDesignsHeader}>
            <span className={styles.myDesignsTitle}>My Designs</span>
            <ChevronRight size={13} color="var(--tp-text-secondary)" />
          </div>

          <div className={styles.myDesignsList}>
            {uploadedDesigns.map(design => {
              const isActive = activeDesignId === design.id;
              return (
                <button
                  key={design.id}
                  type="button"
                  className={`${styles.designThumbnailItem} ${isActive ? styles.designThumbnailActive : ''}`}
                  onClick={() => handleSelectDesign(design)}
                  aria-label={`Select ${design.name}`}
                >
                  <img src={design.previewUrl} alt={design.name} className={styles.thumbImg} />
                  {isActive && (
                    <div className={styles.activeCheckmarkBadge} aria-hidden="true">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Add More Button */}
            <button
              type="button"
              className={styles.addMoreBtn}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Add more design files"
            >
              <Plus size={13} />
              <span>Add More</span>
            </button>

            {/* Resize Artwork Stepper in Sidebar */}
            {activePlacementData?.previewUrl && (
              <div className={styles.sidebarResizeSection}>
                <span className={styles.sidebarResizeLabel}>Resize</span>
                <div className={styles.sidebarResizeStepper}>
                  <button
                    type="button"
                    onClick={() => handleAdjustScale(-0.1)}
                    title="Decrease artwork size"
                    aria-label="Decrease artwork size"
                  >
                    <Minus size={11} />
                  </button>
                  <span
                    className={styles.sidebarResizeVal}
                    title="Click to reset to 100%"
                    onClick={handleResetScale}
                  >
                    {Math.round((activePlacementData.scale || 1) * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdjustScale(0.1)}
                    title="Increase artwork size"
                    aria-label="Increase artwork size"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </div>
            )}

            {/* Remove Artwork from Current Placement Button */}
            {activePlacementData?.previewUrl && (
              <button
                type="button"
                className={styles.removeArtworkBtn}
                onClick={handleRemoveArtwork}
                title={`Remove design from ${activeRegion.label}`}
                aria-label={`Remove design from ${activeRegion.label}`}
              >
                <Trash2 size={13} />
                <span>Remove from {activeRegion.label}</span>
              </button>
            )}
          </div>
        </aside>

        <section className={styles.garmentPreviewPanel} aria-label="Garment studio preview">
          {/* Top Bar (Search Zoom on left, Undo/Redo on right) */}
          <div className={styles.previewTopBar}>
            <button
              type="button"
              className={styles.iconCircleBtn}
              onClick={() => handleZoom(10)}
              title="Inspect Garment"
              aria-label="Zoom in garment"
            >
              <Search size={15} />
            </button>

            {/* Placement Switcher Pill (Front positions, or indicator for sleeves/back) */}
            <div className={styles.placementPillsRow}>
              {activeView === 'front' ? (
                (['centre_chest', 'left_chest', 'right_chest', 'full_front'] as Placement[]).map(pKey => (
                  <button
                    key={pKey}
                    type="button"
                    className={`${styles.placementPillBtn} ${selectedPlacement === pKey ? styles.placementPillBtnActive : ''}`}
                    onClick={() => handleSelectPlacement(pKey)}
                  >
                    {PLACEMENT_REGIONS[pKey].label}
                    {artwork.placements[pKey]?.previewUrl && <span className={styles.pillDot} aria-label="Design placed" />}
                  </button>
                ))
              ) : (
                <div className={styles.placementCurrentBadge}>
                  <span>{activeRegion.label}</span>
                </div>
              )}
            </div>

            <div className={styles.undoRedoPill}>
              <button
                type="button"
                className={styles.undoRedoBtn}
                onClick={handleResetTransform}
                title="Reset placement position & scale"
                aria-label="Reset placement position and scale"
              >
                <RotateCcw size={14} />
              </button>
              <div className={styles.undoRedoDivider} />
              <button
                type="button"
                className={styles.undoRedoBtn}
                onClick={handleResetTransform}
                title="Reset placement position & scale"
                aria-label="Reset placement position and scale"
              >
                <RotateCw size={14} />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className={styles.canvasArea} ref={canvasRef}>
            <div className={styles.canvasInner} style={{ transform: `scale(${zoomLevel / 100})` }}>
              {/* Default garment image for the active view (no recolouring) */}
              <img
                src={GARMENT_ASSETS[activeView]}
                alt={`Garment ${activeView} view`}
                className={styles.garmentBaseSvg}
                draggable={false}
              />

              {/* Dashed Printable Area Guide Box across all views */}
              {activeRegion.view === activeView && (
                <div
                  className={styles.printableGuideBox}
                  style={{
                    left: `${activeRegion.xPct - activeRegion.wPct / 2}%`,
                    top: `${activeRegion.yPct - activeRegion.hPct / 2}%`,
                    width: `${activeRegion.wPct}%`,
                    height: `${activeRegion.hPct}%`,
                  }}
                  aria-hidden="true"
                >
                  {/* Empty State Prompt: 1-click add design to this view */}
                  {!activePlacementData?.previewUrl && (
                    <button
                      type="button"
                      className={styles.emptyPlacementPrompt}
                      onClick={handlePlaceCurrentDesign}
                      title={`Place artwork on ${activeRegion.label}`}
                    >
                      <Plus size={15} />
                      <span>Place on {activeRegion.label}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Every placed design on this view is visible; the selected one is editable */}
              {(Object.keys(PLACEMENT_REGIONS) as Placement[]).map(pKey => {
                const region = PLACEMENT_REGIONS[pKey];
                const art = artwork.placements[pKey];
                if (region.view !== activeView || !art?.previewUrl) return null;
                const isSelected = pKey === selectedPlacement;
                const frame = getFrameSize(art.previewUrl, region);
                const sc = art.scale || 1;
                return (
                  <div
                    key={pKey}
                    ref={isSelected ? artLayerRef : undefined}
                    className={styles.artLayer}
                    style={{
                      left: `${region.xPct - region.wPct / 2}%`,
                      top: `${region.yPct - region.hPct / 2}%`,
                      width: `${region.wPct}%`,
                      height: `${region.hPct}%`,
                      zIndex: isSelected ? 16 : 15,
                    }}
                  >
                    <div
                      data-art-frame
                      className={`${styles.artFrame} ${isSelected ? '' : styles.artFrameIdle}`}
                      style={{
                        left: `${50 + art.x}%`,
                        top: `${50 + art.y}%`,
                        width: `${frame.w * sc}%`,
                        height: `${frame.h * sc}%`,
                        transform: `translate(-50%, -50%) rotate(${art.rotation}deg)`,
                      }}
                      onPointerDown={isSelected
                        ? startArtworkInteraction('move')
                        : (e => { e.preventDefault(); setSelectedPlacement(pKey); })}
                      role="img"
                      aria-label={`Placed artwork on ${region.label}`}
                      title={isSelected ? undefined : `Select ${region.label} design`}
                    >
                      <img
                        src={art.previewUrl}
                        alt="Custom artwork design"
                        draggable={false}
                        onLoad={e => {
                          const el = e.currentTarget;
                          if (el.naturalWidth && el.naturalHeight) {
                            setImgAspect(prev => prev[art.previewUrl] ? prev : { ...prev, [art.previewUrl]: el.naturalWidth / el.naturalHeight });
                          }
                        }}
                      />
                      {isSelected && (
                        <>
                          <span className={styles.artRotateStem} aria-hidden="true" />
                          <div
                            className={styles.artRotateHandle}
                            onPointerDown={startArtworkInteraction('rotate')}
                            title="Drag to rotate"
                            aria-label="Rotate artwork"
                          >
                            <RotateCw size={12} />
                          </div>
                          {(['TL', 'TR', 'BL', 'BR'] as const).map(corner => (
                            <div
                              key={corner}
                              className={`${styles.artHandle} ${styles['artHandle' + corner]}`}
                              onPointerDown={startArtworkInteraction('scale')}
                              title="Drag to resize"
                              aria-label="Resize artwork"
                            />
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Artwork controls */}
          {activeRegion.view === activeView && activePlacementData?.previewUrl && (
            <div className={styles.artToolbar} role="group" aria-label="Artwork size and rotation">
              <button type="button" className={styles.artToolbarBtn} onClick={() => handleAdjustScale(-0.05)} aria-label="Decrease artwork size">
                <Minus size={14} />
              </button>
              <input
                type="range"
                min={30}
                max={250}
                step={1}
                value={Math.round((activePlacementData.scale || 1) * 100)}
                onChange={e => updateActivePlacement({ scale: Number(e.target.value) / 100 })}
                className={styles.artSlider}
                aria-label="Artwork size"
              />
              <button type="button" className={styles.artToolbarBtn} onClick={() => handleAdjustScale(0.05)} aria-label="Increase artwork size">
                <Plus size={14} />
              </button>
              <span className={styles.artToolbarVal}>{Math.round((activePlacementData.scale || 1) * 100)}%</span>
              <span className={styles.artToolbarDivider} />
              <button type="button" className={styles.artToolbarBtn} onClick={handleRotate} title="Rotate 15°" aria-label="Rotate 15 degrees">
                <RotateCw size={14} />
              </button>
              <button type="button" className={styles.artToolbarBtn} onClick={() => updateActivePlacement({ x: 0, y: 0, scale: 1, rotation: 0 })} title="Reset size, position and rotation" aria-label="Reset artwork">
                <RotateCcw size={14} />
              </button>
              <button type="button" className={`${styles.artToolbarBtn} ${styles.artToolbarDelete}`} onClick={handleRemoveArtwork} title="Remove artwork" aria-label="Remove artwork">
                <Trash2 size={14} />
              </button>
            </div>
          )}

          {/* Bottom Bar: 4 View Thumbnails & Zoom Capsule */}
          <div className={styles.previewBottomBar}>
            {/* 4 View Thumbnails (Front, Back, Left, Right) */}
            <div className={styles.viewThumbsRow} role="tablist" aria-label="Select garment view">
              {(['front', 'back', 'left', 'right'] as GarmentView[]).map(viewKey => (
                <button
                  key={viewKey}
                  type="button"
                  role="tab"
                  aria-selected={activeView === viewKey}
                  aria-label={`${viewKey} garment view`}
                  className={`${styles.viewThumbBtn} ${activeView === viewKey ? styles.viewThumbBtnActive : ''}`}
                  onClick={() => handleSelectView(viewKey)}
                >
                  <img src={VIEW_THUMBNAILS[viewKey]} alt={`${viewKey} view`} className={styles.viewThumbImg} />
                </button>
              ))}
            </div>

            {/* Zoom Capsule Control */}
            <div className={styles.zoomPill} role="group" aria-label="Zoom controls">
              <button
                type="button"
                className={styles.zoomActionBtn}
                onClick={() => handleZoom(-10)}
                aria-label="Zoom out"
              >
                <ZoomOut size={13} />
              </button>
              <span className={styles.zoomValueText}>{zoomLevel}%</span>
              <button
                type="button"
                className={styles.zoomActionBtn}
                onClick={() => handleZoom(10)}
                aria-label="Zoom in"
              >
                <ZoomIn size={13} />
              </button>
            </div>
          </div>
        </section>

        <aside className={styles.designRight} aria-label="Design options">
          <div className={styles.designRightHead}>
            <p className={styles.designRightTitle}>{product?.name}</p>
            <button type="button" className={styles.linkBtn} onClick={() => setWorkflowTab('product')}>
              ← Back to product
            </button>
          </div>
          <p className={styles.designHint}>
            Drag your artwork to move it, use the corner handles to resize and the top handle to rotate.
            Add voice notes and sizes on the Product tab.
          </p>
          {/* Colour Swatches Selector */}

          {/* Purchase Action Buttons */}
          <div className={styles.purchaseActions}>
            <button
              type="button"
              className={styles.saveDesignBtn}
              onClick={handleSaveDesign}
            >
              <Heart size={15} color={saveSuccess ? '#C0392B' : 'var(--tp-text-primary)'} fill={saveSuccess ? '#C0392B' : 'none'} />
              <span>{saveSuccess ? 'Design Saved!' : 'Save Design'}</span>
            </button>
          </div>
        </aside>
      </main>
      )}

      {/* ── Sticky Order Bar ── */}
      <div className={styles.orderBar} role="region" aria-label="Order summary">
        <div className={styles.orderBarStats}>
          <ShoppingBag size={22} className={styles.orderBarIcon} />
          <div>
            <span className={styles.orderBarLabel}>Total Pieces</span>
            <strong className={styles.orderBarValue}>{totalPieces}</strong>
          </div>
          <div className={styles.orderBarDivider} />
          <div>
            <span className={styles.orderBarLabel}>Price per piece</span>
            <strong className={styles.orderBarValue}>{fmt(unitPrice)}</strong>
          </div>
          <div className={styles.orderBarDivider} />
          <div>
            <span className={styles.orderBarLabel}>Estimated Price</span>
            <strong className={styles.orderBarValue}>{fmt(estimatedTotal)}</strong>
            <span className={styles.orderBarNote}> (Inclusive of all taxes)</span>
          </div>
        </div>
        <div className={styles.orderBarActions}>
          <button type="button" className={styles.continueBtn} onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
          <button type="button" className={styles.orderBarAddBtn} onClick={handleAddToCart} disabled={totalPieces === 0}>
            <ShoppingBag size={16} />
            <span>{totalPieces === 0 ? 'Add to Cart' : `Add to Cart • ${fmt(estimatedTotal)}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
