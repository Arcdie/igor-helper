import { Router } from 'express';

import webRoute from './web.route';
import authRoute from './auth.route';
import userRoute from './user.route';
import reportRoute from './report.route';
import buildingRoute from './building.route';
import settingsRoute from './settings.route';

import checkAuthMiddleware from '../middlewares/checkAuth.middleware';

const router = Router();

router.use('/', webRoute);

router.use('/auth', authRoute);
router.use('/api/settings', settingsRoute);
router.use('/api/users', checkAuthMiddleware, userRoute);
router.use('/api/reports', checkAuthMiddleware, reportRoute);
router.use('/api/buildings', checkAuthMiddleware, buildingRoute);

export default router;
