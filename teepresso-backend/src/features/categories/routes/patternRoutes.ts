import { Router } from 'express';
import {
  getPatternsController,
  createPatternController,
  updatePatternController,
  deletePatternController,
  reorderPatternsController
} from '../controllers/patternController.js';

const router = Router();

router.get('/', getPatternsController);
router.post('/', createPatternController);
router.post('/reorder', reorderPatternsController);
router.put('/:id', updatePatternController);
router.delete('/:id', deletePatternController);

export default router;
