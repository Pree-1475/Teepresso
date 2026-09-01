import { Request, Response } from 'express';
import { categoriesDatabase, Category } from '../models/categoryModel.js';
import { saveDb } from '../../../config/jsonDb.js';

// Get all categories
export const getCategoriesController = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    categories: categoriesDatabase,
  });
};

// Create category
export const createCategoryController = (req: Request, res: Response): void => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ success: false, message: 'Category name is required' });
    return;
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const exists = categoriesDatabase.some(c => c.id === id);
  if (exists) {
    res.status(400).json({ success: false, message: `Category with ID '${id}' already exists` });
    return;
  }

  const newCategory: Category = { id, name };
  categoriesDatabase.push(newCategory);
  saveDb();

  res.status(201).json({ success: true, category: newCategory });
};

// Update category
export const updateCategoryController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { name } = req.body;
  
  const categoryIndex = categoriesDatabase.findIndex(c => c.id === id);
  if (categoryIndex === -1) {
    res.status(404).json({ success: false, message: 'Category not found' });
    return;
  }

  if (!name) {
    res.status(400).json({ success: false, message: 'Category name is required' });
    return;
  }

  categoriesDatabase[categoryIndex].name = name;
  saveDb();

  res.json({ success: true, category: categoriesDatabase[categoryIndex] });
};

// Delete category
export const deleteCategoryController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const categoryIndex = categoriesDatabase.findIndex(c => c.id === id);
  if (categoryIndex === -1) {
    res.status(404).json({ success: false, message: 'Category not found' });
    return;
  }

  categoriesDatabase.splice(categoryIndex, 1);
  saveDb();

  res.json({ success: true, message: 'Category deleted successfully' });
};

// Reorder categories
export const reorderCategoriesController = (req: Request, res: Response): void => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    res.status(400).json({ success: false, message: 'orderedIds array is required' });
    return;
  }

  const newOrderedList: Category[] = [];
  orderedIds.forEach(id => {
    const found = categoriesDatabase.find(c => c.id === id);
    if (found) {
      newOrderedList.push(found);
    }
  });

  categoriesDatabase.forEach(c => {
    if (!newOrderedList.some(item => item.id === c.id)) {
      newOrderedList.push(c);
    }
  });

  categoriesDatabase.length = 0;
  categoriesDatabase.push(...newOrderedList);
  saveDb();

  res.json({ success: true, message: 'Categories reordered successfully', categories: categoriesDatabase });
};
