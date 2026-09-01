import { Request, Response } from 'express';
import { sql } from '../../../config/db.js';

export const getInventoryController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const inventory = await sql`SELECT * FROM inventory ORDER BY "createdAt" DESC`;
    res.json({ success: true, inventory });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ success: false, message: 'Server error fetching inventory' });
  }
};

export const createInventoryItemController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemCode, itemName, category, stockLevel, reorderPoint, unitPrice, unit, supplier } = req.body;
    if (!itemName || !category) {
      res.status(400).json({ success: false, message: 'Item name and category are required' });
      return;
    }

    const id = `inv_${Date.now()}`;
    const code = itemCode || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
    const lastRestocked = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    await sql`
      INSERT INTO inventory (
        id, "itemCode", "itemName", category, "stockLevel", "reorderPoint",
        "unitPrice", unit, "lastRestocked", supplier
      ) VALUES (
        ${id}, ${code}, ${itemName}, ${category}, ${Number(stockLevel || 0)},
        ${Number(reorderPoint || 10)}, ${Number(unitPrice || 0)}, ${unit || 'Pcs'},
        ${lastRestocked}, ${supplier || ''}
      )
    `;

    const newItem = { id, itemCode: code, itemName, category, stockLevel, reorderPoint, unitPrice, unit, lastRestocked, supplier };
    res.status(201).json({ success: true, item: newItem });
  } catch (err) {
    console.error('Error creating inventory item:', err);
    res.status(500).json({ success: false, message: (err as Error).message || 'Server error' });
  }
};

export const updateInventoryItemController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { stockLevel, reorderPoint, unitPrice, supplier } = req.body;

    const existing = await sql`SELECT * FROM inventory WHERE id = ${String(id)}`;
    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    const lastRestocked = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    await sql`
      UPDATE inventory
      SET "stockLevel" = COALESCE(${stockLevel}, "stockLevel"),
          "reorderPoint" = COALESCE(${reorderPoint}, "reorderPoint"),
          "unitPrice" = COALESCE(${unitPrice}, "unitPrice"),
          supplier = COALESCE(${supplier}, supplier),
          "lastRestocked" = ${lastRestocked}
      WHERE id = ${String(id)}
    `;

    const updated = await sql`SELECT * FROM inventory WHERE id = ${String(id)}`;
    res.json({ success: true, item: updated[0] });
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteInventoryItemController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await sql`DELETE FROM inventory WHERE id = ${String(id)} RETURNING id`;
    
    if (result.length === 0) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateStockController = async (req: Request, res: Response): Promise<void> => {
  return updateInventoryItemController(req, res);
};
