import { Router } from 'express';

import * as reportController from '../controllers/report.controller';
import * as buildingController from '../controllers/building.controller';

const router = Router();

router.get('/', buildingController.getBuildings);
router.get('/:buildingId', buildingController.getBuildingById);

router.get('/:buildingId/report', reportController.getReportByBuilding);
router.post('/:buildingId/report', reportController.createReport);

router.post('/', buildingController.createBuilding);
router.put('/:buildingId', buildingController.updateBuilding);
router.post('/:buildingId/archive', buildingController.archiveBuilding);

export default router;
