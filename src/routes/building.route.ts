import { Router } from 'express';

import * as buildingController from '../controllers/building.controller';

import checkAuth from '../middlewares/checkAuth.middleware';

const router = Router();

router.get('/', checkAuth, buildingController.getBuildings);
router.post('/', checkAuth, buildingController.createBuilding);
router.put('/:buildingId', checkAuth, buildingController.updateBuilding);
router.post('/:buildingId/archive', checkAuth, buildingController.archiveBuilding);

export default router;
