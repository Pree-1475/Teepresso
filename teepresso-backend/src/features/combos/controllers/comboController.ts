import { Request, Response } from 'express';
import { sql } from '../../../config/db.js';
import { Combo, ComboItemInput, EnrichedProductData } from '../models/comboModel.js';
import { productsDatabase } from '../../products/models/productModel.js';

// In-memory fallback storage when PostgreSQL is unreachable (e.g. offline dev or sandbox)
let inMemoryCombos: any[] = [
  {
    id: 'combo-1',
    name: '2 Polo T-Shirts',
    subtitle: 'Classic Duo',
    description: 'Two refined pique polo shirts tailored with custom logo embroidery or high-density chest print.',
    isPopular: false,
    isActive: true,
    displayOrder: 1,
    originalPrice: 899,
    comboPrice: 899,
    savings: 0,
    items: [
      {
        productId: 'polo-corporate',
        quantity: 2,
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL']
      }
    ],
    sizePricing: {},
    createdAt: new Date().toISOString()
  },
  {
    id: 'combo-2',
    name: '5 T-Shirts',
    subtitle: 'Best Value',
    description: 'Five premium bio-washed round neck tees with custom front and back printing for your squad.',
    isPopular: true,
    isActive: true,
    displayOrder: 2,
    originalPrice: 1999,
    comboPrice: 1099,
    savings: 900,
    items: [
      {
        productId: 'tshirt-roundneck',
        quantity: 5,
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL']
      }
    ],
    sizePricing: {},
    createdAt: new Date().toISOString()
  },
  {
    id: 'combo-3',
    name: '10 Polo T-Shirts',
    subtitle: 'Executive Squad',
    description: 'Ten executive polo shirts crafted for company offsites, department merch, and leadership teams.',
    isPopular: false,
    isActive: true,
    displayOrder: 3,
    originalPrice: 3499,
    comboPrice: 2499,
    savings: 1000,
    items: [
      {
        productId: 'polo-corporate',
        quantity: 10,
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL']
      }
    ],
    sizePricing: {},
    createdAt: new Date().toISOString()
  }
];

// Seed default 3 combos into PostgreSQL if none exist
const seedDefaultCombos = async () => {
  try {
    const existing = await sql`SELECT count(*) FROM combos`;
    const count = Number(existing[0]?.count || 0);
    if (count > 0) return;

    console.log('🌱 Seeding initial 3 dynamic combos into database...');

    for (const c of inMemoryCombos) {
      await sql`
        INSERT INTO combos (
          id, name, subtitle, description, "isPopular", "isActive", 
          "displayOrder", "originalPrice", "comboPrice", savings, items, "sizePricing"
        ) VALUES (
          ${c.id}, ${c.name}, ${c.subtitle}, ${c.description}, ${c.isPopular}, ${c.isActive},
          ${c.displayOrder}, ${c.originalPrice}, ${c.comboPrice}, ${c.savings}, 
          ${JSON.stringify(c.items)}::jsonb, ${JSON.stringify(c.sizePricing)}::jsonb
        ) ON CONFLICT (id) DO NOTHING
      `;
    }

    console.log('✅ Default combos seeded successfully!');
  } catch (err) {
    // Expected in offline sandbox, handled gracefully
  }
};

// Helper: Enrich combo items with current product catalog data
const enrichCombosWithProducts = async (combos: any[]) => {
  if (!combos || combos.length === 0) return [];

  const productMap = new Map<string, EnrichedProductData>();

  try {
    const products = await sql`
      SELECT id, name, category, image, "startingPrice", colors, sizes 
      FROM products
    `;
    products.forEach((p: any) => {
      productMap.set(p.id, {
        id: p.id,
        name: p.name,
        category: p.category,
        image: p.image || '/images/products/tshirt.png',
        startingPrice: Number(p.startingPrice || 0),
        colors: p.colors || [],
        sizes: p.sizes || []
      });
    });
  } catch {
    // Fallback to static productsDatabase if DB is unreachable
    productsDatabase.forEach((p: any) => {
      productMap.set(p.id, {
        id: p.id,
        name: p.name,
        category: p.category,
        image: p.image || '/images/products/tshirt.png',
        startingPrice: Number(p.startingPrice || 0),
        colors: p.colors || [],
        sizes: p.sizes || []
      });
    });
  }

  return combos.map((combo: any) => {
    const rawItems: ComboItemInput[] = Array.isArray(combo.items)
      ? combo.items
      : (typeof combo.items === 'string' ? JSON.parse(combo.items) : []);

    const enrichedItems = rawItems.map((item) => ({
      ...item,
      product: productMap.get(item.productId) || {
        id: item.productId,
        name: item.productId,
        category: 'Custom Merch',
        image: '/images/products/tshirt.png',
        startingPrice: 0
      }
    }));

    const originalPrice = Number(combo.originalPrice || 0);
    const comboPrice = Number(combo.comboPrice || 0);
    const savings = Math.max(0, originalPrice - comboPrice);

    return {
      id: combo.id,
      name: combo.name,
      subtitle: combo.subtitle || '',
      description: combo.description || '',
      isPopular: Boolean(combo.isPopular),
      isActive: Boolean(combo.isActive),
      displayOrder: Number(combo.displayOrder || 0),
      originalPrice,
      comboPrice,
      savings,
      sizePricing: combo.sizePricing || {},
      items: enrichedItems,
      createdAt: combo.createdAt,
      updatedAt: combo.updatedAt
    };
  });
};

// 1. GET /api/v1/combos (List active combos or all combos if ?all=true)
export const getCombosController = async (req: Request, res: Response): Promise<void> => {
  try {
    await seedDefaultCombos();

    const includeAll = req.query.all === 'true' || req.query.includeInactive === 'true';

    try {
      const rawCombos = includeAll
        ? await sql`SELECT * FROM combos ORDER BY "displayOrder" ASC, "createdAt" ASC`
        : await sql`SELECT * FROM combos WHERE "isActive" = true ORDER BY "displayOrder" ASC, "createdAt" ASC`;

      const enriched = await enrichCombosWithProducts(rawCombos);
      res.json({ success: true, combos: enriched });
      return;
    } catch {
      // In-memory fallback
      const filtered = includeAll ? inMemoryCombos : inMemoryCombos.filter((c) => c.isActive);
      const enriched = await enrichCombosWithProducts(filtered);
      res.json({ success: true, combos: enriched });
      return;
    }
  } catch (err) {
    console.error('Error fetching combos:', err);
    res.status(500).json({ success: false, message: 'Server error fetching combos' });
  }
};

// 2. GET /api/v1/combos/:id (Single combo details)
export const getComboByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let targetCombo: any = null;

    try {
      const rawCombos = await sql`SELECT * FROM combos WHERE id = ${String(id)}`;
      if (rawCombos.length > 0) targetCombo = rawCombos[0];
    } catch {
      targetCombo = inMemoryCombos.find((c) => c.id === String(id));
    }

    if (!targetCombo) {
      res.status(404).json({ success: false, message: 'Combo not found' });
      return;
    }

    const enriched = await enrichCombosWithProducts([targetCombo]);
    res.json({ success: true, combo: enriched[0] });
  } catch (err) {
    console.error('Error fetching combo by ID:', err);
    res.status(500).json({ success: false, message: 'Server error fetching combo' });
  }
};

// 3. POST /api/v1/combos (Create new combo)
export const createComboController = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      subtitle,
      description,
      isPopular = false,
      isActive = true,
      displayOrder = 0,
      originalPrice,
      comboPrice,
      items = [],
      sizePricing = {}
    } = req.body;

    if (!name || String(name).trim() === '') {
      res.status(400).json({ success: false, message: 'Combo name is required' });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'At least one product must be included in the combo' });
      return;
    }

    const id = req.body.id || `combo-${Date.now()}`;
    const cleanComboPrice = Math.max(0, Number(comboPrice || 0));

    // Calculate original price fallback if not manually provided
    let cleanOriginalPrice = Number(originalPrice || 0);
    if (cleanOriginalPrice <= 0) {
      const priceMap = new Map<string, number>();
      try {
        const products = await sql`SELECT id, "startingPrice" FROM products`;
        products.forEach((p: any) => priceMap.set(p.id, Number(p.startingPrice || 0)));
      } catch {
        productsDatabase.forEach((p: any) => priceMap.set(p.id, Number(p.startingPrice || 0)));
      }

      cleanOriginalPrice = items.reduce((sum: number, it: any) => {
        const prodPrice = priceMap.get(it.productId) || 0;
        return sum + prodPrice * Number(it.quantity || 1);
      }, 0);
    }

    // Do not allow fake discounts: savings only genuine
    const cleanSavings = Math.max(0, cleanOriginalPrice - cleanComboPrice);

    const comboRecord = {
      id,
      name: String(name).trim(),
      subtitle: subtitle ? String(subtitle).trim() : null,
      description: description ? String(description).trim() : null,
      isPopular: Boolean(isPopular),
      isActive: Boolean(isActive),
      displayOrder: Number(displayOrder || 0),
      originalPrice: cleanOriginalPrice,
      comboPrice: cleanComboPrice,
      savings: cleanSavings,
      items,
      sizePricing,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await sql`
        INSERT INTO combos (
          id, name, subtitle, description, "isPopular", "isActive",
          "displayOrder", "originalPrice", "comboPrice", savings, items, "sizePricing"
        ) VALUES (
          ${id}, 
          ${comboRecord.name}, 
          ${comboRecord.subtitle}, 
          ${comboRecord.description}, 
          ${comboRecord.isPopular}, 
          ${comboRecord.isActive},
          ${comboRecord.displayOrder}, 
          ${comboRecord.originalPrice}, 
          ${comboRecord.comboPrice}, 
          ${comboRecord.savings}, 
          ${JSON.stringify(items)}::jsonb, 
          ${JSON.stringify(sizePricing)}::jsonb
        )
      `;
    } catch {
      // In-memory fallback
      inMemoryCombos.push(comboRecord);
    }

    const enriched = await enrichCombosWithProducts([comboRecord]);

    res.status(201).json({
      success: true,
      message: 'Combo created successfully',
      combo: enriched[0]
    });
  } catch (err: any) {
    console.error('Error creating combo:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error creating combo' });
  }
};

// 4. PUT /api/v1/combos/:id (Update combo)
export const updateComboController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let current: any = null;

    try {
      const existing = await sql`SELECT * FROM combos WHERE id = ${String(id)}`;
      if (existing.length > 0) current = existing[0];
    } catch {
      current = inMemoryCombos.find((c) => c.id === String(id));
    }

    if (!current) {
      res.status(404).json({ success: false, message: 'Combo not found' });
      return;
    }

    const {
      name,
      subtitle,
      description,
      isPopular,
      isActive,
      displayOrder,
      originalPrice,
      comboPrice,
      items,
      sizePricing
    } = req.body;

    const updatedName = name !== undefined ? String(name).trim() : current.name;
    const updatedSubtitle = subtitle !== undefined ? String(subtitle).trim() : current.subtitle;
    const updatedDesc = description !== undefined ? String(description).trim() : current.description;
    const updatedIsPopular = isPopular !== undefined ? Boolean(isPopular) : current.isPopular;
    const updatedIsActive = isActive !== undefined ? Boolean(isActive) : current.isActive;
    const updatedDisplayOrder = displayOrder !== undefined ? Number(displayOrder) : current.displayOrder;
    const updatedComboPrice = comboPrice !== undefined ? Math.max(0, Number(comboPrice)) : current.comboPrice;
    const updatedOriginalPrice = originalPrice !== undefined ? Math.max(0, Number(originalPrice)) : current.originalPrice;
    const updatedSavings = Math.max(0, updatedOriginalPrice - updatedComboPrice);
    const updatedItems = items !== undefined ? items : (Array.isArray(current.items) ? current.items : JSON.parse(current.items));
    const updatedSizePricing = sizePricing !== undefined ? sizePricing : (current.sizePricing || {});

    const updatedRecord = {
      id: String(id),
      name: updatedName,
      subtitle: updatedSubtitle,
      description: updatedDesc,
      isPopular: updatedIsPopular,
      isActive: updatedIsActive,
      displayOrder: updatedDisplayOrder,
      originalPrice: updatedOriginalPrice,
      comboPrice: updatedComboPrice,
      savings: updatedSavings,
      items: updatedItems,
      sizePricing: updatedSizePricing,
      updatedAt: new Date().toISOString()
    };

    try {
      await sql`
        UPDATE combos SET
          name = ${updatedName},
          subtitle = ${updatedSubtitle},
          description = ${updatedDesc},
          "isPopular" = ${updatedIsPopular},
          "isActive" = ${updatedIsActive},
          "displayOrder" = ${updatedDisplayOrder},
          "originalPrice" = ${updatedOriginalPrice},
          "comboPrice" = ${updatedComboPrice},
          savings = ${updatedSavings},
          items = ${JSON.stringify(updatedItems)}::jsonb,
          "sizePricing" = ${JSON.stringify(updatedSizePricing)}::jsonb,
          "updatedAt" = NOW()
        WHERE id = ${String(id)}
      `;
    } catch {
      // In-memory update
      const idx = inMemoryCombos.findIndex((c) => c.id === String(id));
      if (idx !== -1) inMemoryCombos[idx] = updatedRecord;
    }

    const enriched = await enrichCombosWithProducts([updatedRecord]);

    res.json({
      success: true,
      message: 'Combo updated successfully',
      combo: enriched[0]
    });
  } catch (err: any) {
    console.error('Error updating combo:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error updating combo' });
  }
};

// 5. DELETE /api/v1/combos/:id (Delete combo)
export const deleteComboController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    try {
      await sql`DELETE FROM combos WHERE id = ${String(id)}`;
    } catch {
      inMemoryCombos = inMemoryCombos.filter((c) => c.id !== String(id));
    }

    res.json({ success: true, message: 'Combo deleted successfully' });
  } catch (err) {
    console.error('Error deleting combo:', err);
    res.status(500).json({ success: false, message: 'Server error deleting combo' });
  }
};

// 6. PATCH /api/v1/combos/:id/toggle-active (Toggle active/inactive status)
export const toggleActiveComboController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let newActiveState = true;

    try {
      const existing = await sql`SELECT "isActive" FROM combos WHERE id = ${String(id)}`;
      if (existing.length > 0) {
        newActiveState = !Boolean(existing[0].isActive);
        await sql`UPDATE combos SET "isActive" = ${newActiveState}, "updatedAt" = NOW() WHERE id = ${String(id)}`;
      }
    } catch {
      const c = inMemoryCombos.find((it) => it.id === String(id));
      if (c) {
        c.isActive = !c.isActive;
        newActiveState = c.isActive;
      }
    }

    res.json({
      success: true,
      message: `Combo ${newActiveState ? 'activated' : 'deactivated'} successfully`,
      isActive: newActiveState
    });
  } catch (err) {
    console.error('Error toggling combo active status:', err);
    res.status(500).json({ success: false, message: 'Server error toggling active status' });
  }
};
