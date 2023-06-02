import { Router } from 'express';

import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/login', authController.loginUser);
router.get('/logout', authController.logoutUser);
router.post('/registration', authController.registerUser);
router.post('/forgotPassword', authController.forgotPassword);

export default router;
