# TEEPRESSO — REPOSITORY & SYSTEM ARCHITECTURE MANUAL
> Authoritative reference for AI agents (Claude Code, Antigravity) to minimize codebase discovery tokens and prevent architectural regressions.

---

## 1. PROJECT OVERVIEW
- **Product:** Teepresso — Premium Online Custom Apparel Studio & Bulk Printing Platform.
- **Primary Feature:** Interactive Customization Studio (`/product/:id`) with 4-view garment photography, interactive artwork positioning, scaling, rotation, color tinting, voice note recording, and direct cart operations.
- **Repository Type:** Multi-package workspace with independent frontend and backend services.

---

## 2. REPOSITORY & PACKAGE STRUCTURE

```text
/home/preeman/PreeMakes/Teepresso/
├── teepresso-frontend/
│   ├── client-app/              # Main Customer Storefront & Studio (React 19 + Vite 6)
│   │   ├── public/
│   │   │   ├── images/
│   │   │   │   ├── products/teepresso/white/   # 4 Garment PNGs & thumbnails
│   │   │   │   │   ├── tee-white-front.png     # (1024x1024 transparent)
│   │   │   │   │   ├── tee-white-back.png      # (1024x1024 transparent)
│   │   │   │   │   ├── tee-white-left.png      # (1024x1024 transparent)
│   │   │   │   │   ├── tee-white-right.png     # (1024x1024 transparent)
│   │   │   │   │   └── thumb-*.png             # (120x120 view thumbnails)
│   │   │   │   └── ui/                         # UI artwork assets (great-wave, etc.)
│   │   ├── src/
│   │   │   ├── App.tsx                         # Router & global context providers
│   │   │   ├── common/
│   │   │   │   ├── components/layout/          # Header, Footer, AnnouncementBar
│   │   │   │   ├── config/api.ts               # API_BASE_URL (http://localhost:5001/api/v1)
│   │   │   │   ├── context/StorefrontContext   # Storefront phone, settings
│   │   │   │   └── styles/globals.css          # Global CSS variables & reset
│   │   │   └── features/
│   │   │       ├── auth/                       # AuthContext, LoginPage, RegisterPage
│   │   │       ├── cart/
│   │   │       │   ├── components/CartDrawer   # Slide-out cart drawer
│   │   │       │   └── context/CartContext     # Cart state, item models, ArtworkData
│   │   │       ├── catalog/
│   │   │       │   ├── ProductPage.tsx         # [CORE] Customization Studio
│   │   │       │   ├── ProductPage.module.css  # Studio layout & component styling
│   │   │       │   ├── ProductsPage.tsx        # Catalog listing
│   │   │       │   └── data/productsData.ts    # Fallback product catalog
│   │   │       ├── checkout/                   # Checkout page & address forms
│   │   │       ├── home/                       # Landing page sections
│   │   │       └── tracking/                   # Order tracking & mockup approval
│   │   └── package.json
│   │
│   └── admin-dashboard/         # Operations Portal (React 19 + Vite 6)
│       └── src/                 # Order management, asset export, inventory
│
└── teepresso-backend/           # API Service (Node.js + Express + TypeScript)
    ├── prisma/
    │   └── schema.prisma        # Database models (Products, Categories, Orders)
    ├── src/
    │   ├── config/db.ts         # Neon PostgreSQL & Prisma client
    │   ├── config/storageService.ts # Google Cloud Storage integration
    │   ├── features/products/   # Product routes & controllers
    │   ├── features/orders/     # Order creation & checkout APIs
    │   └── index.ts             # Express entry point (Port 5001)
    └── package.json
```

---

## 3. TECH STACK SPECIFICATIONS

### Frontend (`client-app`)
- **Framework:** React 19.0.0 (`react`, `react-dom`)
- **Build Tool:** Vite 6.1.0 (`@vitejs/plugin-react`)
- **Language:** TypeScript 5.7.3 (Strict mode, ESNext modules)
- **Routing:** `react-router-dom` 7.2.0
- **Icons:** `lucide-react` 1.27.0
- **Styling:** CSS Modules (`*.module.css`) + CSS Custom Properties in `globals.css`
- **State Management:** React Context API (`CartContext`, `AuthContext`, `StorefrontContext`)

### Backend (`teepresso-backend`)
- **Runtime:** Node.js (v20+ / v22+)
- **Framework:** Express 4.21.2
- **Language:** TypeScript 5.7.3 (`tsc-watch` in dev)
- **Database:** PostgreSQL (Neon Serverless) via Prisma 7.10.0 & `pg` 8.23.0
- **Storage:** Google Cloud Storage (`@google-cloud/storage` 8.0.1)
- **Image Processing:** `sharp` 0.35.4

---

## 4. COMMAND CHEATSHEET

```bash
# Frontend (Storefront Client App)
cd teepresso-frontend/client-app
npm run dev               # Start Vite dev server on port 5173
npm run build             # Compile TypeScript and Vite production bundle
npm run preview           # Preview dist bundle on port 5173
./node_modules/.bin/tsc --noEmit   # Fast type check without emitting files

# Backend API
cd teepresso-backend
npm run dev               # Start Express API with tsc-watch on port 5001
npm run build             # Compile TypeScript to dist/
npm start                 # Run compiled dist/index.js

# Full Monorepo Typecheck
cd teepresso-frontend/client-app && ./node_modules/.bin/tsc --noEmit && cd ../../teepresso-backend && npx tsc --noEmit
```

---

## 5. DESIGN SYSTEM & TOKENS (EDITORIAL ESPRESSO)

Defined in `ProductPage.module.css` and `globals.css`:

| Token | Value | Purpose |
|---|---|---|
| `--tp-espresso` | `#482719` | Primary brand brown (buttons, active pills, text accents) |
| `--tp-espresso-hover` | `#3A1E13` | Button hover state |
| `--tp-bg` | `#FCF8F4` | Warm studio parchment page background |
| `--tp-surface` | `#FFFFFF` | Canvas cards & panels |
| `--tp-surface-card` | `#FDFCFA` | Left sidebar background |
| `--tp-border` | `#EFEAE4` | Subtle borders |
| `--tp-border-dark` | `#D6CCC2` | Drag guides & secondary outlines |
| `--tp-radius-panel` | `24px` | Outer panels and canvas corners |
| `--tp-radius-pill` | `9999px` | Badges, workflow buttons, action capsules |

---

## 6. CUSTOMIZATION STUDIO ARCHITECTURE (`ProductPage.tsx`)

### Layout Grid (4 Columns matching Reference A)
`grid-template-columns: 105px minmax(420px, 1.45fr) minmax(320px, 1.15fr) minmax(290px, 1fr)`

1. **Column 1 — Left Design Sidebar (105px):**
   - Upload Button (triggers hidden multi-file input)
   - Tool buttons: Text, Graphics, Stickers, Templates
   - `My Designs` list with active selection checkmark
   - `+ Add More` button
   - `RESIZE` stepper widget (`[-]` Scale% `[+]`)
   - `Remove from [Placement]` action button

2. **Column 2 — Central Studio Canvas (1.45fr):**
   - **Top Bar:** Search zoom circle button, Placement pill switcher (`Centre Chest`, `Left Chest`, `Right Chest`, `Full Front`), Undo/Redo pill.
   - **Canvas Inner:** $1024 \times 1024$ transparent garment photography.
   - **Fabric Recoloring:** Dynamic luminance-preserving CSS filters applied directly to the base PNG without affecting the placed artwork.
   - **Printable Guide Box:** Dashed border for active placement. When empty, renders `+ Place on [Placement]`.
   - **Interactive Artwork:** Drag-to-move (bounded), 12px interactive corner resize handles (`handleTL`, `handleTR`, `handleBL`, `handleBR`), floating action toolbar (`RESIZE: [-] 100% [+] [↻] [🗑]`).
   - **Bottom Bar:** 4 view thumbnails (`front`, `back`, `left`, `right`) + Zoom pill (`[ - ] 100% [ + ]`).

3. **Column 3 — Product Information Panel (1.15fr):**
   - Product title ("Premium Oversized Tee") & subtitle ("Comfort. Style. Everyday.")
   - 4 Feature badges (100% Cotton, Ultra Soft Fabric, Premium Print Quality, Relaxed Fit)
   - Voice Note Card: Warm peach card with dynamic Mic / Recording timer / Audio preview player / Delete audio
   - Need Help Card: "Need help with design? [Contact Us]" with direct WhatsApp URL
   - 4 Accordions: Fabric Details, Size & Fit Guide, Care Instructions, Shipping & Returns

4. **Column 4 — Purchase Panel (1fr):**
   - Price display (`₹499`, tooltip "All customisations included")
   - 8 Swatches + Custom color request button
   - 3 Size Categories (Kids, Adult Standard [default open, 'L' selected], Adult Plus)
   - Quantity capsule: `[ - ] 1 [ + ]`
   - `Add to Cart →` and `Save Design` buttons

---

## 7. GARMENT COORDINATE & PLACEMENT SYSTEM

All views standardize on $(1024 \times 1024)$ coordinates with collar at $y=154\text{px}$.

```ts
type GarmentView = 'front' | 'back' | 'left' | 'right';
type Placement = 'centre_chest' | 'left_chest' | 'right_chest' | 'full_front' | 'back' | 'left_sleeve' | 'right_sleeve';

interface PlacementRegion {
  view: GarmentView;
  xPct: number; // Center X as % of 1024
  yPct: number; // Center Y as % of 1024
  wPct: number; // Width as %
  hPct: number; // Height as %
  label: string;
}

const PLACEMENT_REGIONS: Record<Placement, PlacementRegion> = {
  centre_chest: { view: 'front', xPct: 50, yPct: 41, wPct: 30, hPct: 30, label: 'Centre Chest' },
  left_chest:   { view: 'front', xPct: 62, yPct: 34, wPct: 18, hPct: 18, label: 'Left Chest' },
  right_chest:  { view: 'front', xPct: 38, yPct: 34, wPct: 18, hPct: 18, label: 'Right Chest' },
  full_front:   { view: 'front', xPct: 50, yPct: 48, wPct: 44, hPct: 44, label: 'Full Front' },
  back:         { view: 'back',  xPct: 50, yPct: 44, wPct: 36, hPct: 36, label: 'Back' },
  left_sleeve:  { view: 'left',  xPct: 55, yPct: 36, wPct: 18, hPct: 18, label: 'Left Sleeve' },
  right_sleeve: { view: 'right', xPct: 45, yPct: 36, wPct: 18, hPct: 18, label: 'Right Sleeve' },
};
```

---

## 8. CART & ARTWORK DATA CONTRACTS

Defined in `src/features/cart/context/CartContext.tsx`. **DO NOT BREAK THESE CONTRACTS.**

```ts
export interface PlacementArtworkData {
  placementId: string;
  file: File | null;
  previewUrl: string;
  x: number;       // % offset (-28 to +28)
  y: number;       // % offset (-28 to +28)
  scale: number;   // 0.3 to 2.5 (1.0 default)
  rotation: number;// degrees (0 to 360)
}

export interface ArtworkData {
  file: File | null;
  previewUrl: string;
  mode: 'has_design' | 'need_help' | 'none';
  instructions: string;
  placements: Record<string, PlacementArtworkData>; // Multi-placement dictionary
  voiceNote?: string | null;                       // Base64 webm audio
  voiceNoteDuration?: number | null;               // seconds
}
```

---

## 9. CRITICAL RULES & CONSTRAINTS FOR FUTURE EDITS
1. **Never mock cart operations:** Always use `useCart().addToCart(...)`.
2. **Never break multi-placement storage:** Each placement (`centre_chest`, `left_sleeve`, `right_sleeve`, `back`) is stored independently in `artwork.placements[key]`.
3. **Transparent Garment PNGs:** Never replace PNG assets with unmasked JPEGs. The CSS fabric tinting depends on transparent backgrounds.
4. **Preserve Database Fallback:** `ProductPage.tsx` attempts API fetch from `${API_BASE_URL}/products/${id}` with clean fallback to `PRODUCTS_CATALOG` in `productsData.ts`.
5. **No unnecessary dependencies:** Use existing Lucide icons and native CSS modules rather than installing Tailwind or heavy UI libraries.
