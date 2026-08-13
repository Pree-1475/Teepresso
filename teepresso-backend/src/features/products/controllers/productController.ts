import { Request, Response } from 'express';
import { productsDatabase } from '../models/productModel.js';

export const getProductsController = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    products: productsDatabase,
  });
};
