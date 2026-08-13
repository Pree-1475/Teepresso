import { Router } from 'express';
import { getAttendanceController, checkInAttendanceController, checkOutAttendanceController } from '../controllers/attendanceController.js';

const router = Router();

router.get('/', getAttendanceController);
router.post('/check-in', checkInAttendanceController);
router.post('/check-out', checkOutAttendanceController);

export default router;
