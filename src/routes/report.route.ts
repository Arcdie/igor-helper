import { Router } from 'express';

import * as reportController from '../controllers/report.controller';

import checkAuth from '../middlewares/checkAuth.middleware';
import { multipleUpload } from '../middlewares/fileUploader.middleware';

const router = Router();

router.get('/', checkAuth, reportController.getReports);

router.put('/:reportId', checkAuth, reportController.updateReport);
router.put('/:reportId/status', checkAuth, reportController.updateReportStatus);

router.get('/:reportId/files', checkAuth, reportController.getReportFiles);
router.put('/:reportId/files', checkAuth, multipleUpload, reportController.updateFilesInReport);

export default router;
