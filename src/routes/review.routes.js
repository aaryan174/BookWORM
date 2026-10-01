import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { createReviewValidator, getBookReviewsValidator } from '../validators/review.validator.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/book/:bookId', getBookReviewsValidator, ReviewController.getBookReviews);
router.post('/', authenticate, createReviewValidator, ReviewController.createReview);

export default router;
