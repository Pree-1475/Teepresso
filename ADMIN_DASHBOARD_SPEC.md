# Teepresso Admin Dashboard — Practical Operations Specification

> **Project:** Teepresso ERP Operations Console  
> **Target Persona:** Apparel Business Owner / Operations Manager (Zero-fluff, 100% practical daily utility)  
> **Tech Stack:** Vite + React 19 + TypeScript + CSS Modules + Lucide Icons  
> **Design Theme:** High-density Neubrutalism (Warm organic canvas `#E5E9D4 → #F8F8F5`, Sun-Yellow `#ECEF22`, Obsidian `#0F0F11`, Curved cards `28px radius`, Glassmorphic sidebar `76px`)

---

## 🎯 Human-Centered Product Vision

Instead of generic "AI admin template" placeholders, every screen in the Teepresso Console is designed specifically for **Indian Custom Apparel Manufacturing & B2B Bulk Fulfillment**:

1. **Zero Fake Content:** All camera/electronics/Jaunt/Theta placeholders have been removed. Every card and table displays **real custom apparel products** (Festive Custom Kurtas, 240 GSM Oversized Streetwear Tees, 220 GSM Corporate Polos, 350 GSM Fleece Hoodies) and actual client organizations (IIT Bombay TechFest, ZettaScale Tech, Greenwood Heights RWA, Global Consulting Group).
2. **Workforce & Staff Manager (Not just a punch list):** Complete employee lifecycle management—active staff roster, "Mark as Left Job" worker archival (preserves audit history), base monthly salary tracking, and an integrated biometric check-in simulator.
3. **Operational Command Dashboard:** Instant launcher for walk-in POS billing, blank stock checks, live batch production tracking, and Pan-India courier radar.

---

## 🧭 Page Architecture & Specifications

---

### Page 1: Dashboard (`/`) — Factory Operations Console
* **Header & Quick Launchers:**
  * Welcome Banner: "Factory Operations Command Console".
  * Action Buttons: `+ Walk-in POS Order` (opens POS billing) and `📦 Check Blanks Stock`.
* **Top Row Cards (Custom Apparel Metrics):**
  1. **Production Batches (Sun-Yellow `#ECEF22`):** Overdue (`1`), Mockup Pending (`3`), In Printing (`14`), Delivered (`94`). Features diagonal stripe volume chart for Kurta, Tee, Polo, Hoodie batches.
  2. **Warehouse Blanks (Coral Gradient):** Live blank garment stock breakdown (180 GSM Kurta Blanks, 240 GSM Tee Blanks, 220 GSM Pique Polos, 350 GSM Hoodies) with center ring badge showing `1,480 Pcs` total available blanks.
  3. **Top Restock SKU (Obsidian Dark `#0F0F11`):** High-demand highlight card featuring the 240 GSM Matte Black Oversized Tee Blank (Low stock alert at 150 Pcs left).
* **Middle Logistics Radar:**
  * Displays Pan-India express shipment tracking (Delhivery Air Express & BlueDart) handling major campus fest batches with E-Way Bill flags (>₹50,000 threshold).
* **Bottom Table — Live Production Floor Queue:**
  * Lists active orders: Order ID (with ⚡ Express badge), Organization & Client Name, Apparel Specifications & Category, Quantity, Batch Value (₹), Current Stage, and direct "Inspect" action button.

---

### Page 2: Orders Queue (`/orders`)
* **Header & Banners:** Urgent Order alert (>48h target) + Bulk Order alert (>300 pcs).
* **8 Production Stage Tabs:** `All` | `Order Placed` | `Waiting for Approval` | `Approved` | `Printing` | `Quality Check` | `In Transit` | `Delivered`.
* **PII Masking Shield:** If logged in under the `Manager` role, sensitive client contact details (phone, email) are automatically masked with a security shield badge.
* **Order Inspection Modal:** Displays full order specs, apparel breakdown, client organization, and an **interactive stage dropdown** to advance production.

---

### Page 3: Offline Order Terminal (`/offline-orders`)
* **Walk-in POS Form Modal:** Customer details, organization type, apparel blank dropdown with auto-calculated unit rates.
* **UPI Payment QR Generator:** Hits API to render dynamic scannable payment QR (`upi://pay`). Clicking "Confirm Payment" updates status to `PAID`.
* **Tax Invoice Printer:** Auto-calculates 18% CGST/SGST split and triggers `window.print()`.

---

### Page 4: Mockup Proofing Queue (`/mockups`)
* **Visual Canvas Proof Cards:** Displays watermarked proof image ("TEEPRESSO SECURE PROOF"). Unlocks watermark server-side when approved.
* **WhatsApp Approval Trigger:** One-click WhatsApp notification simulation sending approval link (`http://localhost:3000/approve-mockup?order=TP-XXXX`).
* **Vector Source Files:** Editor-only download links for source artwork (`.AI`, `.EPS`, `.CDR`).

---

### Page 5: Inventory Blanks (`/inventory`)
* **Size Matrix Stock Grid:** S / M / L / XL / XXL breakdown per blank SKU.
* **Automated Low-Stock Amber Alert:** Triggers when physical stock dips below `reorderPoint`.
* **Stock In/Out Modal & Ledger:** Records stock adjustments with operator notes and prevents over-withdrawal.

---

### Page 6: Dispatch & Shipping (`/dispatch`)
* **4-Point Quality Control Checklist:** Verification of piece count, print alignment, stitching seams, and ironed packaging.
* **Automated E-Way Bill (>₹50,000):** Auto-generates `EWB-YYYYXXXXXXXXXX` when shipping label is printed for high-value orders.
* **Shipping Partner Selection:** Delhivery, BlueDart, DTDC, DHL.

---

### Page 7: Workforce & Attendance Manager (`/attendance`)
* **Dual Operational Tabs:**
  1. `⏱️ Daily Attendance Register`: Daily login/logout punch logs, on-duty active status, and late check-in detection (post-09:15 AM).
  2. `👥 Staff Directory & Payroll`: Roster of all factory staff (Managers, Editors, Production/Print Operators, Dispatchers).
* **Employee Management Actions:**
  * **Add New Employee:** Name, Role, Email, Phone, Base Monthly Salary (₹).
  * **Mark as Left Job:** Archives worker status to "Left Job" to preserve past attendance & audit history without cluttering daily check-in dropdowns.
  * **Delete Employee:** Purges entries created by mistake.
  * **Monthly Payroll Estimate:** Sums total active base salaries (e.g. ₹1,50,000 / month).
* **Biometric Punch Terminal:** Integrated right-side terminal synced with active employees list for easy simulation.

---

### Pages 8 - 11: Financial Reports, Analytics, Products & Customers
* **P&L Reports (`/reports`):** Monthly financial matrix (Revenue, COGS, Expenses, Net Profit Margin %).
* **Analytics (`/analytics`):** Category volume share and turnaround speed metrics.
* **Products Catalog (`/products`):** Base rate & MOQ tiers.
* **Customers Vault (`/customers`):** Accounts LTV tracking.
