import { Request, Response } from 'express';
import { sql } from '../../../config/db.js';

export const getPatternsController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const patterns = await sql`SELECT * FROM patterns ORDER BY "createdAt" ASC`;
    res.json({ success: true, patterns });
  } catch (err) {
    console.error('Error fetching patterns:', err);
    res.status(500).json({ success: false, message: 'Server error fetching patterns' });
  }
};

export const createPatternController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, image } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Pattern name is required' });
      return;
    }

    const id = `pat_${Date.now()}`;

    const existing = await sql`SELECT * FROM patterns WHERE name = ${name}`;
    if (existing.length > 0) {
      res.status(400).json({ success: false, message: `Pattern '${name}' already exists` });
      return;
    }

    await sql`
      INSERT INTO patterns (id, name, image)
      VALUES (${id}, ${name}, ${image || null})
    `;

    const newPattern = { id, name, image: image || null };
    res.status(201).json({ success: true, pattern: newPattern });
  } catch (err) {
    console.error('Error creating pattern:', err);
    res.status(500).json({ success: false, message: (err as Error).message || 'Server error' });
  }
};

export const updatePatternController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;

    const existing = await sql`SELECT * FROM patterns WHERE id = ${String(id)}`;
    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Pattern not found' });
      return;
    }

    await sql`
      UPDATE patterns
      SET name = COALESCE(${name}, name),
          image = COALESCE(${image}, image)
      WHERE id = ${String(id)}
    `;

    const updated = await sql`SELECT * FROM patterns WHERE id = ${String(id)}`;
    res.json({ success: true, pattern: updated[0] });
  } catch (err) {
    console.error('Error updating pattern:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deletePatternController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const pattern = await sql`SELECT * FROM patterns WHERE id = ${String(id)}`;
    if (pattern.length === 0) {
      res.status(404).json({ success: false, message: 'Pattern not found' });
      return;
    }
    
    const name = pattern[0].name;

    const result = await sql`DELETE FROM patterns WHERE id = ${String(id)} RETURNING id`;
    
    if (result.length > 0) {
      try {
        await sql`
          UPDATE products
          SET patterns = (
            SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
            FROM jsonb_array_elements_text(patterns) elem
            WHERE elem <> ${name}
          )
          WHERE patterns @> concat('"', ${name}::text, '"')::jsonb
        `;
      } catch (cascadeErr) {
        console.error('Error cascading pattern deletion to products:', cascadeErr);
      }
    }

    res.json({ success: true, message: 'Pattern deleted successfully' });
  } catch (err) {
    console.error('Error deleting pattern:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const reorderPatternsController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const patterns = await sql`SELECT * FROM patterns ORDER BY "createdAt" ASC`;
    res.json({ success: true, patterns });
  } catch (err) {
    console.error('Error reordering patterns:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
