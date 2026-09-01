import { Request, Response } from 'express';
import { sizesDatabase, SizeSnippet } from '../models/sizeModel.js';
import { saveDb } from '../../../config/jsonDb.js';

// Get all sizes
export const getSizesController = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    sizes: sizesDatabase,
  });
};

// Create size
export const createSizeController = (req: Request, res: Response): void => {
  const { name, category } = req.body;
  if (!name) {
    res.status(400).json({ success: false, message: 'Size name is required' });
    return;
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const exists = sizesDatabase.some(s => s.id === id);
  if (exists) {
    res.status(400).json({ success: false, message: `Size with name '${name}' already exists` });
    return;
  }

  const validatedCategory = category || 'Adult Standard';
  const newSize: SizeSnippet = { id, name, category: validatedCategory };
  sizesDatabase.push(newSize);
  saveDb();

  res.status(201).json({ success: true, size: newSize });
};

// Update size
export const updateSizeController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { name, category } = req.body;
  
  const sizeIndex = sizesDatabase.findIndex(s => s.id === id);
  if (sizeIndex === -1) {
    res.status(404).json({ success: false, message: 'Size not found' });
    return;
  }

  if (name) sizesDatabase[sizeIndex].name = name;
  if (category) sizesDatabase[sizeIndex].category = category;
  saveDb();

  res.json({ success: true, size: sizesDatabase[sizeIndex] });
};

// Delete size
export const deleteSizeController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const sizeIndex = sizesDatabase.findIndex(s => s.id === id);
  if (sizeIndex === -1) {
    res.status(404).json({ success: false, message: 'Size not found' });
    return;
  }

  sizesDatabase.splice(sizeIndex, 1);
  saveDb();

  res.json({ success: true, message: 'Size deleted successfully' });
};

// Reorder sizes
export const reorderSizesController = (req: Request, res: Response): void => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    res.status(400).json({ success: false, message: 'orderedIds array is required' });
    return;
  }

  const newOrderedList: SizeSnippet[] = [];
  orderedIds.forEach(id => {
    const found = sizesDatabase.find(s => s.id === id);
    if (found) {
      newOrderedList.push(found);
    }
  });

  sizesDatabase.forEach(s => {
    if (!newOrderedList.some(item => item.id === s.id)) {
      newOrderedList.push(s);
    }
  });

  sizesDatabase.length = 0;
  sizesDatabase.push(...newOrderedList);
  saveDb();

  res.json({ success: true, message: 'Sizes reordered successfully', sizes: sizesDatabase });
};
