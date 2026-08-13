import { Router } from 'express';
import { getInventoryController, updateStockController } from '../controllers/inventoryController.js';

const router = Router();

router.get('/', getInventoryController);
router.post('/:id/transaction', updateStockController);

export default router;
