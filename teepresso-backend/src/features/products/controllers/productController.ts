import { Request, Response } from 'express';
import { sql } from '../../../config/db.js';
import { uploadBase64ToGCS } from '../../../config/storageService.js';

interface PriceTier {
  minQty: number;
  price: number;
}

// Helper to process pricing tiers
const processPricing = (tiers: PriceTier[], fallbackStartingPrice: number, fallbackPriceRange: string) => {
  if (!tiers || tiers.length === 0) {
    return {
      startingPrice: fallbackStartingPrice,
      priceRange: fallbackPriceRange || `₹${fallbackStartingPrice} / pc`,
      tiers: [{ minQty: 1, price: fallbackStartingPrice }]
    };
  }

  const sortedTiers = [...tiers].sort((a, b) => Number(a.minQty) - Number(b.minQty));
  const prices = sortedTiers.map(t => Number(t.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const startingPrice = sortedTiers.find(t => Number(t.minQty) === 1)?.price || sortedTiers[0].price;
  const priceRange = minPrice === maxPrice 
    ? `₹${minPrice} / pc` 
    : `₹${minPrice} – ₹${maxPrice} / pc`;

  return {
    startingPrice,
    priceRange,
    tiers: sortedTiers.map(t => ({ minQty: Number(t.minQty), price: Number(t.price) }))
  };
};

// Helper to auto-upload base64 images to GCS
const processImageUpload = async (imageStr: string | undefined, pathPrefix: string): Promise<string> => {
  if (!imageStr) return '';
  if (imageStr.startsWith('http://') || imageStr.startsWith('https://')) return imageStr;

  try {
    const fileName = `${pathPrefix}/prod_${Date.now()}_${Math.floor(Math.random() * 1000)}.webp`;
    return await uploadBase64ToGCS(imageStr, fileName);
  } catch (err) {
    console.error('Failed to upload image to GCS, storing fallback:', err);
    return imageStr;
  }
};

// Get all products
export const getProductsController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await sql`SELECT * FROM products ORDER BY "createdAt" DESC`;
    res.json({
      success: true,
      products,
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

// Get single product by ID
export const getProductByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let products = await sql`SELECT * FROM products WHERE id = ${String(id)}`;
    
    if (products.length === 0) {
      const searchPattern = `%${String(id).toLowerCase()}%`;
      products = await sql`SELECT * FROM products WHERE LOWER(name) LIKE ${searchPattern} OR LOWER(id) LIKE ${searchPattern}`;
    }

    if (products.length === 0) {
      products = await sql`SELECT * FROM products ORDER BY "createdAt" DESC LIMIT 1`;
    }

    if (products.length === 0) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, product: products[0] });
  } catch (err) {
    console.error('Error fetching product by ID:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create product
export const createProductController = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = req.body;
    if (!productData.name || !productData.category) {
      res.status(400).json({ success: false, message: 'Product name and category are required' });
      return;
    }

    const id = productData.id || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const existing = await sql`SELECT * FROM products WHERE id = ${id}`;
    if (existing.length > 0) {
      res.status(400).json({ success: false, message: `Product with ID '${id}' already exists` });
      return;
    }

    const pricing = processPricing(
      productData.tiers || [], 
      Number(productData.startingPrice || 0), 
      productData.priceRange || ''
    );

    const imageUrl = await processImageUpload(
      productData.image || 'https://images.unsplash.com/photo-1610996843657-3f82fc464c17?auto=format&fit=crop&q=80&w=800',
      'products'
    );

    
    let galleryUrls = [];
    if (Array.isArray(productData.gallery)) {
      galleryUrls = await Promise.all(
        productData.gallery.map(async (img: any) => {
          if (typeof img === 'string' && img.startsWith('data:')) {
            return await processImageUpload(img, 'products/gallery');
          }
          return img;
        })
      );
    }
  const colorsJson = JSON.stringify(Array.isArray(productData.colors) ? productData.colors : []);
    const sizesJson = JSON.stringify(Array.isArray(productData.sizes) ? productData.sizes : []);
    const patternsJson = JSON.stringify(Array.isArray(productData.patterns) ? productData.patterns : []);
    const tiersJson = JSON.stringify(pricing.tiers);
    const sizesStockJson = JSON.stringify(typeof productData.sizesStock === 'object' ? productData.sizesStock : {});

    await sql`
      INSERT INTO products (
        id, name, category, "shortDesc", "startingPrice", "priceRange",
        colors, sizes, patterns, image, gallery, "popularFor", "requiresSizes",
        "requiresColors", "requiresPatterns", "requiresMockup", "applyVolumeDiscount",
        "isSeasonalKurta", tiers, stock, "sizesStock"
      ) VALUES (
        ${id}, ${productData.name}, ${productData.category}, ${productData.shortDesc || ''},
        ${pricing.startingPrice}, ${pricing.priceRange}, ${colorsJson}::jsonb, ${sizesJson}::jsonb,
        ${patternsJson}::jsonb, ${imageUrl}, ${JSON.stringify(galleryUrls)}::jsonb, ${productData.popularFor || ''}, ${!!productData.requiresSizes},
        ${!!productData.requiresColors}, ${!!productData.requiresPatterns}, ${!!productData.requiresMockup},
        ${!!productData.applyVolumeDiscount}, ${!!productData.isSeasonalKurta}, ${tiersJson}::jsonb,
        ${productData.stock !== undefined ? Number(productData.stock) : null}, ${sizesStockJson}::jsonb
      )
    `;

    const created = await sql`SELECT * FROM products WHERE id = ${id}`;
    res.status(201).json({ success: true, message: 'Product created successfully', product: created[0] });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ success: false, message: (err as Error).message || 'Server error creating product' });
  }
};

// Update product
export const updateProductController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await sql`SELECT * FROM products WHERE id = ${String(id)}`;
    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const existingProduct = existing[0];
    const updateData = req.body;

    if (updateData.image) {
      updateData.image = await processImageUpload(updateData.image, 'products');
    }
    let newGalleryJson = null;
    if (updateData.gallery !== undefined) {
      if (Array.isArray(updateData.gallery)) {
        const processed = await Promise.all(
          updateData.gallery.map(async (img: any) => {
            if (typeof img === 'string' && img.startsWith('data:')) {
              return await processImageUpload(img, 'products/gallery');
            }
            return img;
          })
        );
        newGalleryJson = JSON.stringify(processed);
      } else {
        newGalleryJson = JSON.stringify([]);
      }
    }
  

    let pricing = {
      startingPrice: existingProduct.startingPrice,
      priceRange: existingProduct.priceRange,
      tiers: existingProduct.tiers
    };

    if (updateData.tiers !== undefined) {
      pricing = processPricing(
        updateData.tiers, 
        Number(updateData.startingPrice !== undefined ? updateData.startingPrice : existingProduct.startingPrice), 
        updateData.priceRange || ''
      );
    } else if (updateData.startingPrice !== undefined) {
      pricing.startingPrice = Number(updateData.startingPrice);
      pricing.priceRange = updateData.priceRange || `₹${updateData.startingPrice} / pc`;
      pricing.tiers = [{ minQty: 1, price: pricing.startingPrice }];
    }

    const colorsJson = updateData.colors ? JSON.stringify(updateData.colors) : null;
    const sizesJson = updateData.sizes ? JSON.stringify(updateData.sizes) : null;
    const patternsJson = updateData.patterns ? JSON.stringify(updateData.patterns) : null;
    const tiersJson = JSON.stringify(pricing.tiers);
    const sizesStockJson = updateData.sizesStock ? JSON.stringify(updateData.sizesStock) : null;

    await sql`
      UPDATE products
      SET name = COALESCE(${updateData.name}, name),
          category = COALESCE(${updateData.category}, category),
          "shortDesc" = COALESCE(${updateData.shortDesc}, "shortDesc"),
          "startingPrice" = ${pricing.startingPrice},
          "priceRange" = ${pricing.priceRange},
          colors = COALESCE(${colorsJson}::jsonb, colors),
          sizes = COALESCE(${sizesJson}::jsonb, sizes),
          patterns = COALESCE(${patternsJson}::jsonb, patterns),
          image = COALESCE(${updateData.image}, image),
          gallery = COALESCE(${newGalleryJson}::jsonb, gallery),
          "popularFor" = COALESCE(${updateData.popularFor}, "popularFor"),
          "requiresSizes" = COALESCE(${updateData.requiresSizes}, "requiresSizes"),
          "requiresColors" = COALESCE(${updateData.requiresColors}, "requiresColors"),
          "requiresPatterns" = COALESCE(${updateData.requiresPatterns}, "requiresPatterns"),
          "requiresMockup" = COALESCE(${updateData.requiresMockup}, "requiresMockup"),
          "applyVolumeDiscount" = COALESCE(${updateData.applyVolumeDiscount}, "applyVolumeDiscount"),
          "isSeasonalKurta" = COALESCE(${updateData.isSeasonalKurta}, "isSeasonalKurta"),
          tiers = ${tiersJson}::jsonb,
          stock = COALESCE(${updateData.stock !== undefined ? Number(updateData.stock) : null}, stock),
          "sizesStock" = COALESCE(${sizesStockJson}::jsonb, "sizesStock")
      WHERE id = ${String(id)}
    `;

    const updated = await sql`SELECT * FROM products WHERE id = ${String(id)}`;
    res.json({ success: true, message: 'Product updated successfully', product: updated[0] });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, message: 'Server error updating product' });
  }
};

// Delete product
export const deleteProductController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await sql`DELETE FROM products WHERE id = ${String(id)} RETURNING id`;
    if (result.length === 0) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
};
