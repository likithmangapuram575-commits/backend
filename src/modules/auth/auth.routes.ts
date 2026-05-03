import { Router } from 'express';
import * as authController from './auth.controller';

const router = Router();

router.post('/login', authController.login);
router.post('/request-otp', authController.postRequestOTP);
router.post('/verify-otp', authController.postVerifyOTP);

export default router;
