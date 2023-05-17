import { Router } from 'express';

import webRoute from './web.route';
import userRoute from './user.route';
import reportRoute from './report.route';
import buildingRoute from './building.route';

const router = Router();

router.use('/', webRoute);

router.use('/api/users', userRoute);
router.use('/api/reports', reportRoute);
router.use('/api/buildings', buildingRoute);

export default router;
