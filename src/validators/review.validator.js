import { body, param } from 'express-validator';
import { validateRequest } from '../middlewares/validator.middleware.js';

export const createReviewValidator = [
  body('bookId').isMongoId().withMessage('Valid canonical book ID is required'),
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('title').trim().notEmpty().withMessage('Review title is required'),
  body('comment').trim().notEmpty().withMessage('Review comment is required'),
  validateRequest
];

export const getBookReviewsValidator = [
  param('bookId').isMongoId().withMessage('Valid book ID is required'),
  validateRequest
];
