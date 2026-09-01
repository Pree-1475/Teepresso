import { Router } from 'express';
import {
  getSettingsController,
  updateSettingsController
} from '../controllers/settingsController.js';

const router = Router();

router.get('/', getSettingsController);
router.post('/', updateSettingsController);

export default router;
