import { Request, Response } from 'express';
import { sql } from '../../../config/db.js';
import { uploadBase64ToGCS } from '../../../config/storageService.js';

const processCategoryImage = async (imageStr: string, catId: string): Promise<string> => {
  if (!imageStr) return '';
  if (imageStr.startsWith('http://') || imageStr.startsWith('https://')) return imageStr;

  try {
    const fileName = `categories/cat_${catId}_${Date.now()}.webp`;
    return await uploadBase64ToGCS(imageStr, fileName);
  } catch (err) {
    console.error('Failed to upload category image to GCS:', err);
    return imageStr;
  }
};

export const getCategoriesController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await sql`SELECT * FROM categories ORDER BY "createdAt" ASC`;
    res.json({ success: true, categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, message: 'Server error fetching categories' });
  }
};

export const createCategoryController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, image, description } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required' });
      return;
    }

    const catSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `cat_${Date.now()}`;

    const existing = await sql`SELECT * FROM categories WHERE slug = ${catSlug} OR name = ${name}`;
    if (existing.length > 0) {
      res.status(400).json({ success: false, message: `Category '${name}' already exists` });
      return;
    }

    const gcsImageUrl = await processCategoryImage(image, catSlug);

    await sql`
      INSERT INTO categories (id, name, slug, image, description)
      VALUES (${id}, ${name}, ${catSlug}, ${gcsImageUrl}, ${description || ''})
    `;

    const newCat = { id, name, slug: catSlug, image: gcsImageUrl, description: description || '' };
    res.status(201).json({ success: true, category: newCat });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ success: false, message: (err as Error).message || 'Server error' });
  }
};

export const updateCategoryController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, image, description } = req.body;

    const existing = await sql`SELECT * FROM categories WHERE id = ${String(id)}`;
    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    const gcsImageUrl = await processCategoryImage(image, String(id));

    await sql`
      UPDATE categories
      SET name = COALESCE(${name}, name),
          slug = COALESCE(${slug}, slug),
          image = COALESCE(${gcsImageUrl}, image),
          description = COALESCE(${description}, description)
      WHERE id = ${String(id)}
    `;

    const updated = await sql`SELECT * FROM categories WHERE id = ${String(id)}`;
    res.json({ success: true, category: updated[0] });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteCategoryController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await sql`DELETE FROM categories WHERE id = ${String(id)} RETURNING id`;
    
    if (result.length === 0) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const reorderCategoriesController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await sql`SELECT * FROM categories ORDER BY "createdAt" ASC`;
    res.json({ success: true, categories });
  } catch (err) {
    console.error('Error reordering categories:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
