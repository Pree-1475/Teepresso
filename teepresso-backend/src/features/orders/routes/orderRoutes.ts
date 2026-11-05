import { Router } from 'express';
import {
  getOrdersController,
  trackOrderController,
  createOrderController,
  createOfflineOrderController,
  collectQRPaymentController,
  confirmOfflinePaymentController,
  updateOrderStageController,
  updateOrderMockupController,
  updateDispatchController,
  updateOrderFullController,
  uploadVoiceNoteController
} from '../controllers/orderController.js';

const router = Router();

router.get('/', getOrdersController);
router.get('/track', trackOrderController);
router.post('/create', createOrderController);
router.post('/offline', createOfflineOrderController);
router.post('/upload-voice', uploadVoiceNoteController);
router.get('/:id/payment-qr', collectQRPaymentController);
router.post('/:id/confirm-payment', confirmOfflinePaymentController);
router.put('/:id/stage', updateOrderStageController);
router.put('/:id/mockup', updateOrderMockupController);
router.put('/:id/dispatch', updateDispatchController);
router.put('/:id', updateOrderFullController);

export default router;
