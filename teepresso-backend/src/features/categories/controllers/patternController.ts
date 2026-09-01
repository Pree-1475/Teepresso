import { Request, Response } from 'express';
import { patternsDatabase, PatternSnippet } from '../models/patternModel.js';
import { saveDb } from '../../../config/jsonDb.js';

// Get all patterns
export const getPatternsController = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    patterns: patternsDatabase,
  });
};

// Create pattern
export const createPatternController = (req: Request, res: Response): void => {
  const { name, image } = req.body;
  if (!name || !image) {
    res.status(400).json({ success: false, message: 'Pattern name and image are required' });
    return;
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const exists = patternsDatabase.some(p => p.id === id);
  if (exists) {
    res.status(400).json({ success: false, message: `Pattern with name '${name}' already exists` });
    return;
  }

  const newPattern: PatternSnippet = { id, name, image };
  patternsDatabase.push(newPattern);
  saveDb();

  res.status(201).json({ success: true, pattern: newPattern });
};

// Update pattern
export const updatePatternController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { name, image } = req.body;
  
  const patternIndex = patternsDatabase.findIndex(p => p.id === id);
  if (patternIndex === -1) {
    res.status(404).json({ success: false, message: 'Pattern not found' });
    return;
  }

  if (!name || !image) {
    res.status(400).json({ success: false, message: 'Pattern name and image are required' });
    return;
  }

  patternsDatabase[patternIndex].name = name;
  patternsDatabase[patternIndex].image = image;
  saveDb();

  res.json({ success: true, pattern: patternsDatabase[patternIndex] });
};

// Delete pattern
export const deletePatternController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const patternIndex = patternsDatabase.findIndex(p => p.id === id);
  if (patternIndex === -1) {
    res.status(404).json({ success: false, message: 'Pattern not found' });
    return;
  }

  patternsDatabase.splice(patternIndex, 1);
  saveDb();

  res.json({ success: true, message: 'Pattern deleted successfully' });
};

// Reorder patterns
export const reorderPatternsController = (req: Request, res: Response): void => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    res.status(400).json({ success: false, message: 'orderedIds must be an array of pattern IDs' });
    return;
  }

  const newOrderMap = new Map(orderedIds.map((id, index) => [id, index]));
  patternsDatabase.sort((a, b) => {
    const orderA = newOrderMap.has(a.id) ? newOrderMap.get(a.id)! : 999;
    const orderB = newOrderMap.has(b.id) ? newOrderMap.get(b.id)! : 999;
    return orderA - orderB;
  });

  saveDb();
  res.json({ success: true, patterns: patternsDatabase });
};
