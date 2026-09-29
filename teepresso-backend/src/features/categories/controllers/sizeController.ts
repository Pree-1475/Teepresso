import { Request, Response } from 'express';
import { sql } from '../../../config/db.js';

export const getSizesController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sizes = await sql`SELECT * FROM sizes ORDER BY "createdAt" ASC`;
    res.json({ success: true, sizes });
  } catch (err) {
    console.error('Error fetching sizes:', err);
    res.status(500).json({ success: false, message: 'Server error fetching sizes' });
  }
};

export const createSizeController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, chest, length } = req.body;
    if (!name || !category) {
      res.status(400).json({ success: false, message: 'Size name and category are required' });
      return;
    }

    const id = `sz_${Date.now()}`;

    await sql`
      INSERT INTO sizes (id, name, category, chest, length)
      VALUES (${id}, ${name}, ${category}, ${chest || ''}, ${length || ''})
    `;

    const newSize = { id, name, category, chest: chest || '', length: length || '' };
    res.status(201).json({ success: true, size: newSize });
  } catch (err) {
    console.error('Error creating size:', err);
    res.status(500).json({ success: false, message: (err as Error).message || 'Server error' });
  }
};

export const updateSizeController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, category, chest, length } = req.body;

    const existing = await sql`SELECT * FROM sizes WHERE id = ${String(id)}`;
    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Size not found' });
      return;
    }

    await sql`
      UPDATE sizes
      SET name = COALESCE(${name}, name),
          category = COALESCE(${category}, category),
          chest = COALESCE(${chest}, chest),
          length = COALESCE(${length}, length)
      WHERE id = ${String(id)}
    `;

    const updated = await sql`SELECT * FROM sizes WHERE id = ${String(id)}`;
    res.json({ success: true, size: updated[0] });
  } catch (err) {
    console.error('Error updating size:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteSizeController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const size = await sql`SELECT * FROM sizes WHERE id = ${String(id)}`;
    if (size.length === 0) {
      res.status(404).json({ success: false, message: 'Size not found' });
      return;
    }
    
    const name = size[0].name;

    const result = await sql`DELETE FROM sizes WHERE id = ${String(id)} RETURNING id`;
    
    if (result.length > 0) {
      try {
        await sql`
          UPDATE products
          SET sizes = (
            SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
            FROM jsonb_array_elements_text(sizes) elem
            WHERE elem <> ${name}
          )
          WHERE sizes @> concat('"', ${name}::text, '"')::jsonb
        `;
      } catch (cascadeErr) {
        console.error('Error cascading size deletion to products:', cascadeErr);
      }
    }

    res.json({ success: true, message: 'Size deleted successfully' });
  } catch (err) {
    console.error('Error deleting size:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const reorderSizesController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sizes = await sql`SELECT * FROM sizes ORDER BY "createdAt" ASC`;
    res.json({ success: true, sizes });
  } catch (err) {
    console.error('Error reordering sizes:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
