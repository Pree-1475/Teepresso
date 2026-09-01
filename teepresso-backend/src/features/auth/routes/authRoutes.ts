import { Router } from 'express';
import {
  loginController,
  registerController,
  getUsersController,
  getCustomersController,
  otpLoginController,
  createUserController,
  updateUserController,
  deleteUserController
} from '../controllers/authController.js';

const router = Router();

router.post('/login', loginController);
router.post('/register', registerController);
router.post('/otp-login', otpLoginController);
router.get('/users', getUsersController);
router.get('/customers', getCustomersController);
router.post('/users', createUserController);
router.put('/users/:id', updateUserController);
router.delete('/users/:id', deleteUserController);


export default router;
