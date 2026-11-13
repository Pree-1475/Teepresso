import { Router } from 'express';
import {
  getCombosController,
  getComboByIdController,
  createComboController,
  updateComboController,
  deleteComboController,
  toggleActiveComboController,
} from '../controllers/comboController.js';

const router = Router();

// Public & Admin endpoints
router.get('/', getCombosController);
router.get('/:id', getComboByIdController);

// Admin-managed endpoints
router.post('/', createComboController);
router.put('/:id', updateComboController);
router.delete('/:id', deleteComboController);
router.patch('/:id/toggle-active', toggleActiveComboController);

export default router;

