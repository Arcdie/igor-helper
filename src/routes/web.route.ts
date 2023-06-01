import { Router } from 'express';

import * as webController from '../controllers/web.controller';

import isAuthroized from '../middlewares/isAuthorized.middleware';
import checkAuthMiddleware from '../middlewares/checkAuth.middleware';

const router = Router();

router.get('/', isAuthroized, webController.getIndexPage);
router.get('/buildings', isAuthroized, checkAuthMiddleware, webController.getBuildingsPage);
router.get('/publicFiles', isAuthroized, webController.getPublicFilesPage);

router.get('/auth/login', webController.getLoginPage);
router.get('/auth/registration', webController.getRegistrationPage);
router.get('/auth/forgotPassword', webController.getForgotPasswordPage);

export default router;
