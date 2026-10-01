import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validator.middleware.js';

export const createBookValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('authors').isArray({ min: 1 }).withMessage('At least one author is required'),
  body('isbn13').trim().notEmpty().withMessage('ISBN-13 is required').isLength({ min: 10, max: 17 }).withMessage('Valid ISBN format required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('publisher').trim().notEmpty().withMessage('Publisher is required'),
  body('coverImageUrl').trim().notEmpty().isURL().withMessage('Valid cover image URL is required'),
  validateRequest
];
