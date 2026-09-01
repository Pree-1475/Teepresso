import { Request, Response } from 'express';
import { sql } from '../../../config/db.js';
import { uploadBase64ToGCS } from '../../../config/storageService.js';

// Helper to auto-upload base64 pattern swatches to GCS
const processPatternImageUpload = async (imageStr: string, patternId: string): Promise<string> => {
  if (!imageStr) return '';
  if (imageStr.startsWith('http://') || imageStr.startsWith('https://')) {
    return imageStr;
  }

  try {
    const fileName = `patterns/pattern_${patternId}_${Date.now()}.webp`;
    const gcsUrl = await uploadBase64ToGCS(imageStr, fileName);
    return gcsUrl;
  } catch (err) {
    console.error('Failed to upload pattern image to GCS:', err);
    return imageStr;
  }
};

// Get all patterns
export const getPatternsController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const patterns = await sql`SELECT * FROM patterns ORDER BY "createdAt" ASC`;
    res.json({
      success: true,
      patterns,
    });
  } catch (err) {
    console.error('Error fetching patterns:', err);
    res.status(500).json({ success: false, message: 'Server error fetching patterns' });
  }
};

// Create pattern
export const createPatternController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, image } = req.body;
    if (!name || !image) {
      res.status(400).json({ success: false, message: 'Pattern name and image are required' });
      return;
    }

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const existing = await sql`SELECT * FROM patterns WHERE id = ${id} OR name = ${name}`;
    if (existing.length > 0) {
      res.status(400).json({ success: false, message: `Pattern with name '${name}' already exists` });
      return;
    }

    const gcsImageUrl = await processPatternImageUpload(image, String(id));

    await sql`
      INSERT INTO patterns (id, name, image)
      VALUES (${id}, ${name}, ${gcsImageUrl})
    `;

    const newPattern = { id, name, image: gcsImageUrl };
    res.status(201).json({ success: true, pattern: newPattern });
  } catch (err) {
    console.error('Error creating pattern:', err);
    res.status(500).json({ success: false, message: (err as Error).message || 'Server error creating pattern' });
  }
};

// Update pattern
export const updatePatternController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;

    const existing = await sql`SELECT * FROM patterns WHERE id = ${id}`;
    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Pattern not found' });
      return;
    }

    if (!name || !image) {
      res.status(400).json({ success: false, message: 'Pattern name and image are required' });
      return;
    }

    const gcsImageUrl = await processPatternImageUpload(image, String(id));

    await sql`
      UPDATE patterns
      SET name = ${name}, image = ${gcsImageUrl}
      WHERE id = ${id}
    `;

    const updatedPattern = { id, name, image: gcsImageUrl };
    res.json({ success: true, pattern: updatedPattern });
  } catch (err) {
    console.error('Error updating pattern:', err);
    res.status(500).json({ success: false, message: 'Server error updating pattern' });
  }
};

// Delete pattern
export const deletePatternController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await sql`DELETE FROM patterns WHERE id = ${id} RETURNING id`;
    
    if (result.length === 0) {
      res.status(404).json({ success: false, message: 'Pattern not found' });
      return;
    }

    res.json({ success: true, message: 'Pattern deleted successfully' });
  } catch (err) {
    console.error('Error deleting pattern:', err);
    res.status(500).json({ success: false, message: 'Server error deleting pattern' });
  }
};

// Reorder patterns
export const reorderPatternsController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const patterns = await sql`SELECT * FROM patterns ORDER BY "createdAt" ASC`;
    res.json({ success: true, patterns });
  } catch (err) {
    console.error('Error reordering patterns:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
