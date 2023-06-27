import { Router } from 'express';

import * as userController from '../controllers/user.controller';

const router = Router();

router.get('/', userController.getUsers);

router.get('/:userId', userController.getUserById);
router.put('/:userId', userController.updateUser);

export default router;
