import { Request, Response } from 'express';
import { productsDatabase, Product, PriceTier } from '../models/productModel.js';
import { saveDb } from '../../../config/jsonDb.js';
import { uploadBase64ToGCS } from '../../../config/storageService.js';

// Helper to auto-calculate starting price and price range from tiers
const processPricing = (tiers: PriceTier[], fallbackStartingPrice: number, fallbackPriceRange: string) => {
  if (!tiers || tiers.length === 0) {
    return {
      startingPrice: fallbackStartingPrice,
      priceRange: fallbackPriceRange || `₹${fallbackStartingPrice} / pc`,
      tiers: [{ minQty: 1, price: fallbackStartingPrice }]
    };
  }

  // Sort tiers by minimum quantity ascending
  const sortedTiers = [...tiers].sort((a, b) => Number(a.minQty) - Number(b.minQty));
  
  // Find highest & lowest prices in tiers
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

// Get all products
export const getProductsController = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    products: productsDatabase,
  });
};

// Get single product by ID
export const getProductByIdController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const product = productsDatabase.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }
  res.json({ success: true, product });
};

// Helper to auto-upload base64 images to GCS
const processImageUpload = async (imageStr: string | undefined, pathPrefix: string): Promise<string> => {
  if (!imageStr) return '';
  if (imageStr.startsWith('data:image/') || (imageStr.length > 500 && !imageStr.startsWith('http'))) {
    try {
      const fileName = `${pathPrefix}/${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
      const gcsUrl = await uploadBase64ToGCS(imageStr, fileName);
      return gcsUrl;
    } catch (err) {
      console.error('Failed to upload image to GCS, storing fallback string:', err);
    }
  }
  return imageStr;
};

// Create product
export const createProductController = async (req: Request, res: Response): Promise<void> => {
  const productData: Omit<Product, 'id'> & { id?: string } = req.body;
  
  if (!productData.name || !productData.category) {
    res.status(400).json({ success: false, message: 'Product name and category are required' });
    return;
  }

  const id = productData.id || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const exists = productsDatabase.some(p => p.id === id);
  if (exists) {
    res.status(400).json({ success: false, message: `Product with ID '${id}' already exists` });
    return;
  }

  // Process pricing tiers
  const pricing = processPricing(
    productData.tiers || [], 
    Number(productData.startingPrice || 0), 
    productData.priceRange || ''
  );

  // Upload image to GCS if base64
  const imageUrl = await processImageUpload(
    productData.image || 'https://images.unsplash.com/photo-1610996843657-3f82fc464c17?auto=format&fit=crop&q=80&w=800',
    'products'
  );

  const newProduct: Product = {
    id,
    name: productData.name,
    category: productData.category,
    shortDesc: productData.shortDesc || '',
    startingPrice: pricing.startingPrice,
    priceRange: pricing.priceRange,
    colors: Array.isArray(productData.colors) ? productData.colors : [],
    sizes: Array.isArray(productData.sizes) ? productData.sizes : [],
    image: imageUrl,
    gallery: Array.isArray(productData.gallery) ? productData.gallery : [],
    popularFor: productData.popularFor || '',
    requiresSizes: !!productData.requiresSizes,
    requiresColors: !!productData.requiresColors,
    requiresPatterns: !!productData.requiresPatterns,
    patterns: Array.isArray(productData.patterns) ? productData.patterns : [],
    requiresMockup: !!productData.requiresMockup,
    applyVolumeDiscount: !!productData.applyVolumeDiscount,
    isSeasonalKurta: !!productData.isSeasonalKurta,
    tiers: pricing.tiers,
    stock: productData.stock !== undefined ? Number(productData.stock) : undefined,
    sizesStock: typeof productData.sizesStock === 'object' ? productData.sizesStock : {},
  };

  productsDatabase.push(newProduct);
  saveDb();

  res.status(201).json({ success: true, message: 'Product created successfully', product: newProduct });
};

// Update product
export const updateProductController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const productIndex = productsDatabase.findIndex(p => p.id === id);
  if (productIndex === -1) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  const updateData: Partial<Product> = req.body;
  const existingProduct = productsDatabase[productIndex];

  // Upload new image to GCS if base64 provided
  if (updateData.image) {
    updateData.image = await processImageUpload(updateData.image, 'products');
  }

  // Process updated pricing tiers if present
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

  const updatedProduct: Product = {
    ...existingProduct,
    ...updateData,
    id: existingProduct.id,
    startingPrice: pricing.startingPrice,
    priceRange: pricing.priceRange,
    tiers: pricing.tiers,
  };

  productsDatabase[productIndex] = updatedProduct;
  saveDb();

  res.json({ success: true, message: 'Product updated successfully', product: updatedProduct });
};

// Delete product
export const deleteProductController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const productIndex = productsDatabase.findIndex(p => p.id === id);
  if (productIndex === -1) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  productsDatabase.splice(productIndex, 1);
  saveDb();

  res.json({ success: true, message: 'Product deleted successfully' });
};
