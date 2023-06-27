import { Router } from 'express';

import * as webController from '../controllers/web.controller';

import setLocals from '../middlewares/setLocals.middleware';
import isAuthroized from '../middlewares/isAuthorized.middleware';
import checkAuthMiddleware from '../middlewares/checkAuth.middleware';

const router = Router();

const middlewareList = [isAuthroized, checkAuthMiddleware, setLocals];

router.get('/', isAuthroized, setLocals, webController.getIndexPage);
router.get('/users', ...middlewareList, webController.getUsersPage);
router.get('/buildings', ...middlewareList, webController.getBuildingsPage);
router.get('/publicFiles', ...middlewareList, webController.getPublicFilesPage);

router.get('/auth/login', setLocals, webController.getLoginPage);
router.get('/auth/registration', setLocals, webController.getRegistrationPage);
router.get('/auth/forgotPassword', setLocals, webController.getForgotPasswordPage);

export default router;
