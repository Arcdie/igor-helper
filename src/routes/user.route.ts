import { Router } from 'express';

import * as userController from '../controllers/user.controller';

const router = Router();

router.get('/clients', userController.getClients);

export default router;
