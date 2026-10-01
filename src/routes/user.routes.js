import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { addressValidator, updateProfileValidator } from '../validators/user.validator.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.patch('/profile', updateProfileValidator, UserController.updateProfile);
router.get('/addresses', UserController.getAddresses);
router.post('/addresses', addressValidator, UserController.addAddress);
router.delete('/addresses/:id', UserController.deleteAddress);

export default router;
