import { Router } from 'express';
import { getProductsController } from '../controllers/productController.js';

const router = Router();

router.get('/', getProductsController);

export default router;
