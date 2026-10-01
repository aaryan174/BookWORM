import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRoles('admin'));

router.get('/users', AdminController.getUsers);
router.patch('/users/:id/roles', AdminController.updateUserRoles);
router.get('/analytics', AdminController.getAnalytics);

export default router;
