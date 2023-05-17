import { Router } from 'express';

import * as reportController from '../controllers/report.controller';

import checkAuth from '../middlewares/checkAuth.middleware';

const router = Router();

router.get('/', checkAuth, reportController.getReports);
router.post('/', checkAuth, reportController.createReport);
router.put('/:reportId', checkAuth, reportController.updateReport);
router.put('/:reportId/status', checkAuth, reportController.updateReportStatus);

export default router;
