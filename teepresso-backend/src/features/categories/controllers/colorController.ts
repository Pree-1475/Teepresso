import { Request, Response } from 'express';
import { sql } from '../../../config/db.js';

export const getColorsController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const colors = await sql`SELECT * FROM colors ORDER BY "createdAt" ASC`;
    res.json({ success: true, colors });
  } catch (err) {
    console.error('Error fetching colors:', err);
    res.status(500).json({ success: false, message: 'Server error fetching colors' });
  }
};

export const createColorController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, hex } = req.body;
    if (!name || !hex) {
      res.status(400).json({ success: false, message: 'Color name and hex code are required' });
      return;
    }

    const id = `col_${Date.now()}`;
    const cleanHex = hex.trim().toLowerCase();

    const existing = await sql`SELECT * FROM colors WHERE hex = ${cleanHex} OR name = ${name}`;
    if (existing.length > 0) {
      res.status(400).json({ success: false, message: `Color '${name}' (${hex}) already exists` });
      return;
    }

    await sql`
      INSERT INTO colors (id, name, hex)
      VALUES (${id}, ${name}, ${cleanHex})
    `;

    const newColor = { id, name, hex: cleanHex };
    res.status(201).json({ success: true, color: newColor });
  } catch (err) {
    console.error('Error creating color:', err);
    res.status(500).json({ success: false, message: (err as Error).message || 'Server error' });
  }
};

export const updateColorController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, hex } = req.body;

    const existing = await sql`SELECT * FROM colors WHERE id = ${String(id)}`;
    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Color not found' });
      return;
    }

    const cleanHex = hex ? hex.trim().toLowerCase() : existing[0].hex;

    await sql`
      UPDATE colors
      SET name = COALESCE(${name}, name),
          hex = ${cleanHex}
      WHERE id = ${String(id)}
    `;

    const updated = await sql`SELECT * FROM colors WHERE id = ${String(id)}`;
    res.json({ success: true, color: updated[0] });
  } catch (err) {
    console.error('Error updating color:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteColorController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // First get the color to know its hex/name
    const color = await sql`SELECT * FROM colors WHERE id = ${String(id)}`;
    if (color.length === 0) {
      res.status(404).json({ success: false, message: 'Color not found' });
      return;
    }
    
    const hex = color[0].hex;
    const name = color[0].name;

    const result = await sql`DELETE FROM colors WHERE id = ${String(id)} RETURNING id`;
    
    if (result.length > 0) {
      // Remove references from products where colors JSONB array contains this hex or name
      try {
        await sql`
          UPDATE products
          SET colors = (
            SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
            FROM jsonb_array_elements_text(colors) elem
            WHERE elem <> ${hex} AND elem <> ${name}
          )
          WHERE colors @> concat('"', ${hex}::text, '"')::jsonb 
             OR colors @> concat('"', ${name}::text, '"')::jsonb
        `;
      } catch (cascadeErr) {
        console.error('Error cascading color deletion to products:', cascadeErr);
      }
    }

    res.json({ success: true, message: 'Color deleted successfully' });
  } catch (err) {
    console.error('Error deleting color:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const reorderColorsController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const colors = await sql`SELECT * FROM colors ORDER BY "createdAt" ASC`;
    res.json({ success: true, colors });
  } catch (err) {
    console.error('Error reordering colors:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
