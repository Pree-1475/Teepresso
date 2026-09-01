import { Router } from 'express';
import {
  getSizesController,
  createSizeController,
  updateSizeController,
  deleteSizeController,
  reorderSizesController
} from '../controllers/sizeController.js';

const router = Router();

router.get('/', getSizesController);
router.post('/', createSizeController);
router.post('/reorder', reorderSizesController);
router.put('/:id', updateSizeController);
router.delete('/:id', deleteSizeController);

export default router;
