import { Router } from 'express';
import { getReportsController, getAnalyticsController } from '../controllers/reportsController.js';

const router = Router();

router.get('/', getReportsController);
router.get('/analytics', getAnalyticsController);

export default router;
