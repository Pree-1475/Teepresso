import { Router } from 'express';
import {
  getCategoriesController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
  reorderCategoriesController
} from '../controllers/categoryController.js';

const router = Router();

router.get('/', getCategoriesController);
router.post('/', createCategoryController);
router.post('/reorder', reorderCategoriesController);
router.put('/:id', updateCategoryController);
router.delete('/:id', deleteCategoryController);

export default router;
