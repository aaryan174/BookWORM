import { Router } from 'express';
import { SellerController } from '../controllers/seller.controller.js';
import {
  onboardSellerValidator,
  createListingValidator,
  updateListingValidator
} from '../validators/seller.validator.js';
import { authenticate, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/onboard', onboardSellerValidator, SellerController.onboard);
router.get('/profile', requireRoles('seller'), SellerController.getProfile);
router.get('/listings', requireRoles('seller'), SellerController.getListings);
router.post('/listings', requireRoles('seller'), createListingValidator, SellerController.createListing);
router.patch('/listings/:id', requireRoles('seller'), updateListingValidator, SellerController.updateListing);
router.delete('/listings/:id', requireRoles('seller'), SellerController.deleteListing);
router.get('/sales', requireRoles('seller'), SellerController.getSales);

export default router;
