import { Router } from 'express';
import {
  getColorsController,
  createColorController,
  updateColorController,
  deleteColorController,
  reorderColorsController
} from '../controllers/colorController.js';

const router = Router();

router.get('/', getColorsController);
router.post('/', createColorController);
router.post('/reorder', reorderColorsController);
router.put('/:id', updateColorController);
router.delete('/:id', deleteColorController);

export default router;
