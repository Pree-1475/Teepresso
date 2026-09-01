import { Request, Response } from 'express';
import { colorsDatabase, ColorSnippet } from '../models/colorModel.js';
import { saveDb } from '../../../config/jsonDb.js';

// Get all colors
export const getColorsController = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    colors: colorsDatabase,
  });
};

// Create color
export const createColorController = (req: Request, res: Response): void => {
  const { name, hex } = req.body;
  if (!name || !hex) {
    res.status(400).json({ success: false, message: 'Color name and hex code are required' });
    return;
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const exists = colorsDatabase.some(c => c.id === id || c.hex.toLowerCase() === hex.toLowerCase());
  if (exists) {
    res.status(400).json({ success: false, message: `Color with name '${name}' or hex '${hex}' already exists` });
    return;
  }

  const newColor: ColorSnippet = { id, name, hex };
  colorsDatabase.push(newColor);
  saveDb();

  res.status(201).json({ success: true, color: newColor });
};

// Update color
export const updateColorController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { name, hex } = req.body;
  
  const colorIndex = colorsDatabase.findIndex(c => c.id === id);
  if (colorIndex === -1) {
    res.status(404).json({ success: false, message: 'Color not found' });
    return;
  }

  if (!name || !hex) {
    res.status(400).json({ success: false, message: 'Color name and hex code are required' });
    return;
  }

  colorsDatabase[colorIndex].name = name;
  colorsDatabase[colorIndex].hex = hex;
  saveDb();

  res.json({ success: true, color: colorsDatabase[colorIndex] });
};

// Delete color
export const deleteColorController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const colorIndex = colorsDatabase.findIndex(c => c.id === id);
  if (colorIndex === -1) {
    res.status(404).json({ success: false, message: 'Color not found' });
    return;
  }

  colorsDatabase.splice(colorIndex, 1);
  saveDb();

  res.json({ success: true, message: 'Color deleted successfully' });
};

// Reorder colors
export const reorderColorsController = (req: Request, res: Response): void => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    res.status(400).json({ success: false, message: 'orderedIds array is required' });
    return;
  }

  const newOrderedList: ColorSnippet[] = [];
  orderedIds.forEach(id => {
    const found = colorsDatabase.find(c => c.id === id);
    if (found) {
      newOrderedList.push(found);
    }
  });

  colorsDatabase.forEach(c => {
    if (!newOrderedList.some(item => item.id === c.id)) {
      newOrderedList.push(c);
    }
  });

  colorsDatabase.length = 0;
  colorsDatabase.push(...newOrderedList);
  saveDb();

  res.json({ success: true, message: 'Colors reordered successfully', colors: colorsDatabase });
};
